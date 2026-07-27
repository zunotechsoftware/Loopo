import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { CategoriesService } from '../../categories/services/categories.service';
import { AttributesService } from '../../categories/services/attributes.service';
import { InteractionsService } from '../../interactions/services/interactions.service';
import { CreateProductDto, UpdateProductDto, ListingSearchQueryDto } from '../dto/product.dto';
import { RedisService } from '../../../shared/redis/redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ProductStatus, Prisma } from '@prisma/client';
import { S3Service } from '../../../shared/services/s3.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly categoriesService: CategoriesService,
    private readonly attributesService: AttributesService,
    private readonly redisService: RedisService,
    private readonly s3Service: S3Service,
    private readonly interactionsService: InteractionsService,
    @InjectQueue('image-compression') private readonly imageCompressionQueue: Queue,
    @InjectQueue('thumbnail-generation') private readonly thumbnailGenerationQueue: Queue,
    @InjectQueue('product-expiration') private readonly expirationQueue: Queue,
    @InjectQueue('search-index-update') private readonly searchIndexQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createProduct(dto: CreateProductDto, sellerId: string) {
    // 1. Verify Category exists
    const category = await this.categoriesService.getCategoryDetails(dto.categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
    }

    // 2. Validate Dynamic Attributes Schema
    if (dto.attributes) {
      await this.validateProductAttributes(dto.categoryId, dto.attributes);
    }

    // 3. Generate unique slug from title
    const slug = await this.generateUniqueSlug(dto.title);

    // 4. Create Product
    const product = await this.productsRepo.create({
      product: {
        sellerId,
        categoryId: dto.categoryId,
        subcategoryId: dto.subcategoryId || null,
        title: dto.title,
        slug,
        description: dto.description,
        condition: dto.condition,
        price: dto.price,
        currency: dto.currency || 'INR',
        negotiable: dto.negotiable || false,
        quantity: dto.quantity || 1,
        status: ProductStatus.PENDING, // Direct transition to Pending moderation review on publish
        createdBy: sellerId,
      },
      location: {
        country: dto.location.country,
        state: dto.location.state,
        city: dto.location.city,
        area: dto.location.area,
        zipCode: dto.location.zipCode,
        latitude: dto.location.latitude,
        longitude: dto.location.longitude,
      },
      attributes: dto.attributes,
    });

    // 5. Audit Transition
    await this.productsRepo.createStatusHistory({
      productId: product!.id,
      fromStatus: ProductStatus.DRAFT,
      toStatus: ProductStatus.PENDING,
      comment: 'Listing created and submitted for review',
      changedById: sellerId,
    });

    // 6. Queue Search Index & Notifications
    await this.searchIndexQueue.add('index', { action: 'CREATE', productId: product!.id });
    await this.notificationQueue.add('send', { type: 'LISTING_SUBMITTED', userId: sellerId, listingId: product!.id });

    // 7. Emit product created event for auto-creating seller profile
    this.eventEmitter.emit('product.created', {
      productId: product!.id,
      sellerId,
      title: product!.title,
    });

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto, sellerId: string, isAdmin = false) {
    const product = await this.productsRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    // Auth validation
    if (product.sellerId !== sellerId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to modify this listing');
    }

    const updateProductData: any = {
      description: dto.description,
      condition: dto.condition,
      price: dto.price,
      currency: dto.currency,
      negotiable: dto.negotiable,
      quantity: dto.quantity,
      updatedBy: sellerId,
    };

    // If title changes, update slug
    if (dto.title && dto.title !== product.title) {
      updateProductData.title = dto.title;
      updateProductData.slug = await this.generateUniqueSlug(dto.title);
    }

    // Re-verify category if modified
    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const category = await this.categoriesService.getCategoryDetails(dto.categoryId);
      if (!category) {
        throw new NotFoundException(`Category with ID ${dto.categoryId} not found`);
      }
      updateProductData.categoryId = dto.categoryId;
    }

    // Validate attributes schema
    const updatedAttrs = dto.attributes;
    if (updatedAttrs) {
      const catId = dto.categoryId || product.categoryId;
      await this.validateProductAttributes(catId, updatedAttrs);
    }

    // Clean location update payload
    let updateLocationData: any = undefined;
    if (dto.location) {
      updateLocationData = {
        country: dto.location.country,
        state: dto.location.state,
        city: dto.location.city,
        area: dto.location.area,
        zipCode: dto.location.zipCode,
        latitude: dto.location.latitude,
        longitude: dto.location.longitude,
      };
    }

    // OLX business logic: editing a listing reverts it to Pending approval
    let targetStatus = product.status;
    if (product.status === ProductStatus.APPROVED && !isAdmin) {
      targetStatus = ProductStatus.PENDING;
      updateProductData.status = ProductStatus.PENDING;

      await this.productsRepo.createStatusHistory({
        productId: id,
        fromStatus: ProductStatus.APPROVED,
        toStatus: ProductStatus.PENDING,
        comment: 'Listing updated by seller, reverted to review status',
        changedById: sellerId,
      });
    }

    const updated = await this.productsRepo.update(id, {
      product: updateProductData,
      location: updateLocationData,
      attributes: updatedAttrs,
    });

    // Invalidate details caches
    await this.invalidateListingCache(id, product.slug);
    if (updateProductData.slug) {
      await this.invalidateListingCache(id, updateProductData.slug);
    }

    // Trigger Search re-index
    await this.searchIndexQueue.add('index', { action: 'UPDATE', productId: id });

    return updated;
  }

  async deleteProduct(id: string, sellerId: string, isAdmin = false) {
    const product = await this.productsRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    if (product.sellerId !== sellerId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this listing');
    }

    await this.productsRepo.softDelete(id, sellerId);
    await this.invalidateListingCache(id, product.slug);

    // Sync Search Index
    await this.searchIndexQueue.add('index', { action: 'DELETE', productId: id });

    return { id, deletedAt: new Date() };
  }

  async viewListing(idOrSlug: string, userId?: string, ipAddress?: string, userAgent?: string) {
    const product = await this.getListingDetails(idOrSlug);

    // Buffering views in Redis using Sorted Set or simple counter to prevent write bottleneck
    // We increment a general page views counter for the product
    const bufferKey = `product:views:buffer:${product.id}`;
    await this.redisService.set(bufferKey, '1'); // will be processed by worker

    // Track unique views: Redis HyperLogLog or simple set
    const uniqueViewersKey = `product:views:unique:${product.id}`;
    const viewerId = userId || ipAddress || 'anonymous';
    
    // Add viewer to check uniqueness
    const isNewViewer = await this.redisService.exists(uniqueViewersKey);
    // Wait, let's keep it simple: we can push views to a queue to record detail records asynchronously
    await this.redisService.set(`views:log:${product.id}:${Date.now()}`, JSON.stringify({ userId, ipAddress, userAgent }));

    if (userId) {
      await this.interactionsService.recordRecentlyViewed(userId, product.id);
    }

    return product;
  }

  async getListingDetails(idOrSlug: string) {
    const cacheKey = `product:detail:${idOrSlug}`;
    
    // Check Cache
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {}

    let product = await this.productsRepo.findById(idOrSlug);
    if (!product) {
      product = await this.productsRepo.findBySlug(idOrSlug);
    }

    if (!product) {
      throw new NotFoundException(`Listing with ID or Slug ${idOrSlug} not found`);
    }

    // Cache result
    try {
      await this.redisService.set(cacheKey, JSON.stringify(product), 1800); // 30 minutes TTL
    } catch (err) {}

    return product;
  }

  async getMyListings(sellerId: string, query: ListingSearchQueryDto) {
    const skip = (query.page! - 1) * query.limit!;
    const where: Prisma.ProductWhereInput = {
      sellerId,
    };

    if (query.status) {
      where.status = query.status;
    }

    const items = await this.productsRepo.findAll({
      skip,
      take: query.limit!,
      where,
    });

    const total = await this.productsRepo.count(where);

    return { items, total, page: query.page, limit: query.limit };
  }

  async findPublicListings(query: ListingSearchQueryDto) {
    const skip = (query.page! - 1) * query.limit!;
    
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.APPROVED,
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.subcategoryId) {
      where.subcategoryId = query.subcategoryId;
    }
    if (query.condition) {
      where.condition = query.condition;
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }
    if (query.city) {
      where.location = {
        city: { equals: query.city, mode: 'insensitive' },
      };
    }
    if (query.keyword) {
      where.OR = [
        { title: { contains: query.keyword, mode: 'insensitive' } },
        { description: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    const items = await this.productsRepo.findAll({
      skip,
      take: query.limit!,
      where,
      orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || 'desc' } : undefined,
    });

    const total = await this.productsRepo.count(where);

    return { items, total, page: query.page, limit: query.limit };
  }

  // --- S3 Presigned URLs & Media upload ---
  async generatePresignedMediaUrl(
    productId: string,
    fileName: string,
    fileType: string,
    sellerId: string,
  ) {
    const product = await this.productsRepo.findById(productId);
    if (!product) {
      throw new NotFoundException(`Listing with ID ${productId} not found`);
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    const category = fileType.startsWith('video/') ? 'listing_videos' : 'listing_images';
    const s3Data = await this.s3Service.generatePresignedUploadUrl(
      sellerId,
      fileName,
      category,
      fileType,
    );

    return s3Data;
  }

  async attachImage(productId: string, fileUrl: string, fileKey: string, sortOrder = 0) {
    const img = await this.productsRepo.addImage({
      productId,
      originalUrl: fileUrl,
      fileKey,
      sortOrder,
      mimeType: 'image/jpeg',
    });

    // Queue compression and thumbnail extraction jobs
    await this.imageCompressionQueue.add('compress', { imageId: img.id });
    await this.thumbnailGenerationQueue.add('generate-thumbnail', { imageId: img.id, type: 'IMAGE' });

    return img;
  }

  async deleteImage(imageId: string, sellerId: string) {
    const image = await this.productsRepo.findImageById(imageId);
    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }

    const product = await this.productsRepo.findById(image.productId);
    if (product?.sellerId !== sellerId) {
      throw new ForbiddenException('You do not own this listing');
    }

    await this.productsRepo.deleteImage(imageId);
    if (image.fileKey) {
      await this.s3Service.deleteFile(image.fileKey);
    }

    return { id: imageId, success: true };
  }

  // --- Workflow Moderation ---
  async approveProduct(id: string, moderatorId: string) {
    const product = await this.productsRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + 30); // 30 day expiration window

    const updated = await this.productsRepo.update(id, {
      product: {
        status: ProductStatus.APPROVED,
        publishedAt: now,
        expiresAt,
        updatedBy: moderatorId,
      },
    });

    await this.productsRepo.createStatusHistory({
      productId: id,
      fromStatus: product.status,
      toStatus: ProductStatus.APPROVED,
      comment: 'Listing approved by moderator',
      changedById: moderatorId,
    });

    await this.invalidateListingCache(id, product.slug);
    await this.searchIndexQueue.add('index', { action: 'UPDATE', productId: id });
    await this.notificationQueue.add('send', { type: 'LISTING_APPROVED', userId: product.sellerId, listingId: id });

    return updated;
  }

  async rejectProduct(id: string, reason: string, moderatorId: string) {
    const product = await this.productsRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    const updated = await this.productsRepo.update(id, {
      product: {
        status: ProductStatus.REJECTED,
        rejectionReason: reason,
        updatedBy: moderatorId,
      },
    });

    await this.productsRepo.createStatusHistory({
      productId: id,
      fromStatus: product.status,
      toStatus: ProductStatus.REJECTED,
      comment: `Rejected: ${reason}`,
      changedById: moderatorId,
    });

    await this.invalidateListingCache(id, product.slug);
    await this.notificationQueue.add('send', {
      type: 'LISTING_REJECTED',
      userId: product.sellerId,
      listingId: id,
      metadata: { reason },
    });

    return updated;
  }

  // --- Promotions & Promoted Badges ---
  async promoteFeatured(id: string, durationDays: number) {
    const product = await this.productsRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + durationDays);

    await this.productsRepo.createFeatured({
      productId: id,
      durationDays,
      endDate: featuredUntil,
    });

    const updated = await this.productsRepo.update(id, {
      product: {
        featuredUntil,
      },
    });

    await this.invalidateListingCache(id, product.slug);
    return updated;
  }

  async promoteBoost(id: string, packageName: string) {
    const product = await this.productsRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    const boostUntil = new Date();
    boostUntil.setDate(boostUntil.getDate() + 7); // Default package: 7 days boost

    await this.productsRepo.createBoosted({
      productId: id,
      packageName,
      endDate: boostUntil,
    });

    const updated = await this.productsRepo.update(id, {
      product: {
        boostUntil,
      },
    });

    await this.invalidateListingCache(id, product.slug);
    return updated;
  }

  // --- Helper Methods ---

  private async generateUniqueSlug(title: string): Promise<string> {
    const clean = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${clean}-${randSuffix}`;

    const existing = await this.productsRepo.findBySlug(slug);
    if (existing) {
      return this.generateUniqueSlug(title);
    }
    return slug;
  }

  private async validateProductAttributes(categoryId: string, attributes: { attributeId: string; value: string }[]) {
    const schema = await this.attributesService.getCategoryAttributes(categoryId, true);
    const userAttrMap = new Map(attributes.map((a) => [a.attributeId, a.value]));

    for (const field of schema) {
      const value = userAttrMap.get(field.id);

      if (field.isRequired && (value === undefined || value === null || value.trim() === '')) {
        throw new BadRequestException(`Category attribute '${field.name}' is required`);
      }

      if (value !== undefined && value !== null && value.trim() !== '') {
        if (field.minLength && value.length < field.minLength) {
          throw new BadRequestException(`Attribute '${field.name}' value must be at least ${field.minLength} chars`);
        }
        if (field.maxLength && value.length > field.maxLength) {
          throw new BadRequestException(`Attribute '${field.name}' value must not exceed ${field.maxLength} chars`);
        }

        if (field.type === 'NUMBER' || field.type === 'DECIMAL') {
          const num = Number(value);
          if (isNaN(num)) {
            throw new BadRequestException(`Attribute '${field.name}' must be a valid number`);
          }
          if (field.minValue !== null && num < field.minValue) {
            throw new BadRequestException(`Attribute '${field.name}' must be at least ${field.minValue}`);
          }
          if (field.maxValue !== null && num > field.maxValue) {
            throw new BadRequestException(`Attribute '${field.name}' must be at most ${field.maxValue}`);
          }
        }

        if (field.regex) {
          const rx = new RegExp(field.regex);
          if (!rx.test(value)) {
            throw new BadRequestException(`Attribute '${field.name}' is invalid in format`);
          }
        }
      }
    }
  }

  private async invalidateListingCache(id: string, slug: string) {
    try {
      await this.redisService.del(`product:detail:${id}`);
      await this.redisService.del(`product:detail:${slug}`);
    } catch (err) {}
  }
}
