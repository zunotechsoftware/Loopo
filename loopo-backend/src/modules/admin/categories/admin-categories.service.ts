import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateAdminCategoryDto, UpdateAdminCategoryDto } from './dto/admin-category.dto';
import { RedisService } from '../../../shared/redis/redis.service';

@Injectable()
export class AdminCategoriesService {
  private readonly CACHE_KEY = 'categories:tree';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getAllCategories() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { products: true, children: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCategoryById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        attributes: true,
      },
    });

    if (!category || category.deletedAt) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    return category;
  }

  async createCategory(userId: string, dto: CreateAdminCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Category with slug ${dto.slug} already exists`);
    }

    let level = 0;
    if (dto.parentId) {
      const parent = await this.getCategoryById(dto.parentId);
      level = parent.level + 1;
    }

    const category = await this.prisma.category.create({
      data: {
        ...dto,
        level,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.redisService.del(this.CACHE_KEY);
    return category;
  }

  async updateCategory(id: string, userId: string, dto: UpdateAdminCategoryDto) {
    const category = await this.getCategoryById(id);

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(`Category with slug ${dto.slug} already exists`);
      }
    }

    let level = category.level;
    if (dto.parentId && dto.parentId !== category.parentId) {
      if (dto.parentId === id) {
        throw new ConflictException('Category cannot be its own parent');
      }
      const parent = await this.getCategoryById(dto.parentId);
      level = parent.level + 1;
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        ...dto,
        level,
        updatedBy: userId,
      },
    });

    await this.redisService.del(this.CACHE_KEY);
    return updated;
  }

  async deleteCategory(id: string, adminId: string) {
    await this.getCategoryById(id);
    
    // Soft delete
    const deleted = await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: adminId },
    });

    await this.redisService.del(this.CACHE_KEY);
    return deleted;
  }
}
