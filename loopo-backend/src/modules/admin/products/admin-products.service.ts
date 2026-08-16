import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RejectProductDto, FeatureProductDto, BoostProductDto, UpdateProductDto } from './dto/admin-product.dto';
import { ProductStatus, ProductCondition, Prisma } from '@prisma/client';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProducts(
    skip: number = 0, 
    take: number = 20, 
    status?: ProductStatus, 
    search?: string,
    categoryId?: string,
    subcategoryId?: string,
    condition?: ProductCondition,
    location?: string,
  ) {
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (condition) where.condition = condition;
    
    if (location) {
      where.location = { city: location };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        {
          seller: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { profile: { displayName: { contains: search, mode: 'insensitive' } } }
            ]
          }
        }
      ];
      // Check if search is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(search)) {
        where.OR.push({ id: search });
      }
    }
    
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: { 
          seller: { include: { profile: true } }, 
          category: true,
          location: true,
          images: true
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where })
    ]);

    return { data, total, skip, take };
  }

  async getProductsStats() {
    const [total, active, pending, rejected, sold] = await Promise.all([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null, status: 'APPROVED' } }),
      this.prisma.product.count({ where: { deletedAt: null, status: 'PENDING' } }),
      this.prisma.product.count({ where: { deletedAt: null, status: 'REJECTED' } }),
      this.prisma.product.count({ where: { deletedAt: null, status: 'SOLD' } }),
    ]);

    return { total, active, pending, rejected, sold };
  }

  async getDistinctLocations() {
    const locations = await this.prisma.productLocation.findMany({
      select: { city: true },
      distinct: ['city'],
      where: { city: { not: '' } }
    });
    return locations.map(l => l.city).filter(Boolean);
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: true,
        category: true,
        images: true,
        videos: true,
        attributes: { include: { attribute: true } },
        location: true,
      },
    });

    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async updateProductStatus(id: string, adminId: string, status: ProductStatus, reason?: string) {
    const product = await this.getProductById(id);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          status,
          rejectionReason: reason || null,
          updatedBy: adminId,
          publishedAt: status === 'APPROVED' && !product.publishedAt ? new Date() : product.publishedAt,
        },
      });

      await tx.productStatusHistory.create({
        data: {
          productId: id,
          fromStatus: product.status,
          toStatus: status,
          comment: reason,
          changedById: adminId,
        },
      });

      return updated;
    });
  }

  async featureProduct(id: string, adminId: string, dto: FeatureProductDto) {
    await this.getProductById(id);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + dto.durationDays);

    return this.prisma.featuredProduct.create({
      data: {
        productId: id,
        durationDays: dto.durationDays,
        endDate,
      },
    });
  }

  async boostProduct(id: string, adminId: string, dto: BoostProductDto) {
    await this.getProductById(id);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + dto.durationDays);

    return this.prisma.boostedProduct.create({
      data: {
        productId: id,
        packageName: dto.packageName,
        endDate,
      },
    });
  }

  async deleteProduct(id: string, adminId: string) {
    await this.getProductById(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: adminId },
    });
  }

  async updateProductDetails(id: string, adminId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: adminId,
      },
      include: {
        seller: { select: { firstName: true, lastName: true } },
        category: true,
      }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_PRODUCT_DETAILS',
        entity: 'Product',
        entityId: id,
        newValues: JSON.parse(JSON.stringify(dto)),
      }
    });

    return updated;
  }
}
