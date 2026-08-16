import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BrandsRepository } from '../repositories/brands.repository';
import { CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';
import { RedisService } from '../../../shared/redis/redis.service';

@Injectable()
export class BrandsService {
  private readonly BRANDS_CACHE_PREFIX = 'brands';

  constructor(
    private readonly brandsRepo: BrandsRepository,
    private readonly redisService: RedisService,
  ) {}

  async createBrand(dto: CreateBrandDto, userId?: string) {
    // Generate slug from name if not provided
    const slug = dto.slug || (await this.generateSlug(dto.name));

    // Check if slug already exists
    const existing = await this.brandsRepo.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Brand with slug "${slug}" already exists`);
    }

    const brand = await this.brandsRepo.create({
      name: dto.name,
      slug,
      shortDescription: dto.shortDescription,
      description: dto.description,
      categoryId: dto.categoryId || null,
      country: dto.country,
      website: dto.website,
      establishedYear: dto.establishedYear,
      logoUrl: dto.logoUrl,
      bannerUrl: dto.bannerUrl,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      isActive: dto.isActive ?? true,
      isFeatured: dto.isFeatured ?? false,
      sortOrder: dto.sortOrder ?? 0,
      createdBy: userId,
    });

    // Invalidate list cache
    await this.invalidateListCache();

    return brand;
  }

  async updateBrand(id: string, dto: UpdateBrandDto, userId?: string) {
    const brand = await this.brandsRepo.findById(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    const updateData: any = {
      ...dto,
      updatedBy: userId,
    };

    // If name changed and no custom slug, regenerate slug
    if (dto.name && dto.name !== brand.name && !dto.slug) {
      updateData.slug = await this.generateSlug(dto.name);
    }

    // If slug provided, check uniqueness
    if (dto.slug && dto.slug !== brand.slug) {
      const existing = await this.brandsRepo.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Brand with slug "${dto.slug}" already exists`);
      }
    }

    const updated = await this.brandsRepo.update(id, updateData);

    // Invalidate caches
    await this.invalidateBrandCache(id, brand.slug);
    if (updateData.slug && updateData.slug !== brand.slug) {
      await this.invalidateBrandCache(id, updateData.slug);
    }
    await this.invalidateListCache();

    return updated;
  }

  async deleteBrand(id: string, userId?: string) {
    const brand = await this.brandsRepo.findById(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    await this.brandsRepo.softDelete(id, userId);

    // Invalidate caches
    await this.invalidateBrandCache(id, brand.slug);
    await this.invalidateListCache();

    return { id, deletedAt: new Date() };
  }

  async getBrand(idOrSlug: string) {
    const cacheKey = `${this.BRANDS_CACHE_PREFIX}:detail:${idOrSlug}`;

    // Check cache
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Redis read error for brand details:', err);
    }

    // Fetch from DB
    let brand = await this.brandsRepo.findById(idOrSlug);
    if (!brand) {
      brand = await this.brandsRepo.findBySlug(idOrSlug);
    }

    if (!brand) {
      throw new NotFoundException(`Brand with ID or slug "${idOrSlug}" not found`);
    }

    // Write cache
    try {
      await this.redisService.set(cacheKey, JSON.stringify(brand), 3600);
    } catch (err) {
      console.error('Redis write error for brand details:', err);
    }

    return brand;
  }

  async getAllBrands(params: {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
    categoryId?: string;
    isFeatured?: boolean;
  }) {
    return this.brandsRepo.findAll(params);
  }

  async getStats() {
    const cacheKey = `${this.BRANDS_CACHE_PREFIX}:stats`;

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Redis read error for brand stats:', err);
    }

    const stats = await this.brandsRepo.getStats();

    try {
      await this.redisService.set(cacheKey, JSON.stringify(stats), 300); // 5 min TTL
    } catch (err) {
      console.error('Redis write error for brand stats:', err);
    }

    return stats;
  }

  async updateStatus(id: string, isActive: boolean, userId?: string) {
    const brand = await this.brandsRepo.findById(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    const updated = await this.brandsRepo.update(id, {
      isActive,
      updatedBy: userId,
    });

    await this.invalidateBrandCache(id, brand.slug);
    await this.invalidateListCache();

    return updated;
  }

  async toggleFeatured(id: string, isFeatured: boolean, userId?: string) {
    const brand = await this.brandsRepo.findById(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    const updated = await this.brandsRepo.update(id, {
      isFeatured,
      updatedBy: userId,
    });

    await this.invalidateBrandCache(id, brand.slug);
    await this.invalidateListCache();

    return updated;
  }

  // --- Helpers ---

  private async generateSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await this.brandsRepo.findBySlug(uniqueSlug);
      if (!existing) {
        break;
      }
      counter++;
      uniqueSlug = `${baseSlug}-${counter}`;
    }

    return uniqueSlug;
  }

  private async invalidateBrandCache(id: string, slug: string) {
    try {
      await this.redisService.del(`${this.BRANDS_CACHE_PREFIX}:detail:${id}`);
      await this.redisService.del(`${this.BRANDS_CACHE_PREFIX}:detail:${slug}`);
    } catch (err) {
      console.error('Redis delete error for brand keys:', err);
    }
  }

  private async invalidateListCache() {
    try {
      await this.redisService.del(`${this.BRANDS_CACHE_PREFIX}:stats`);
    } catch (err) {
      console.error('Redis delete error for brand list:', err);
    }
  }
}
