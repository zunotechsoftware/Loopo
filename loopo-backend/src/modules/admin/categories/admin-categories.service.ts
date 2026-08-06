import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateAdminCategoryDto, UpdateAdminCategoryDto, AdminCategoryQueryDto } from './dto/admin-category.dto';
import { RedisService } from '../../../shared/redis/redis.service';

@Injectable()
export class AdminCategoriesService {
  private readonly CACHE_KEY = 'categories:tree';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getAllCategories(queryDto?: AdminCategoryQueryDto) {
    const { search, status, type, level, sortBy, sortOrder, page = 1, limit = 10, all = false } = queryDto || {};

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    if (type && type !== 'all') {
      if (type === 'root') {
        where.parentId = null;
      } else if (type === 'subcategory') {
        where.parentId = { not: null };
      }
    }

    if (level !== undefined) {
      where.level = level;
    }

    let orderBy: any = { sortOrder: 'asc' };
    if (sortBy === 'name') {
      orderBy = { name: sortOrder || 'asc' };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder || 'desc' };
    } else if (sortBy === 'level') {
      orderBy = { level: sortOrder || 'asc' };
    } else {
      orderBy = { sortOrder: sortOrder || 'asc' };
    }

    if (all) {
      const data = await this.prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { products: true, children: true },
          },
        },
        orderBy,
      });
      return { data, total: data.length, page: 1, limit: data.length };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { products: true, children: true },
          },
        },
        orderBy,
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getCategoriesStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const calculateGrowth = (current: number, past: number) => {
      if (past === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - past) / past) * 100).toFixed(1));
    };

    // 1. Total Categories
    const totalCategories = await this.prisma.category.count({
      where: { deletedAt: null },
    });
    const totalCategoriesPast = await this.prisma.category.count({
      where: { deletedAt: null, createdAt: { lt: thirtyDaysAgo } },
    });
    const totalCategoriesChange = calculateGrowth(totalCategories, totalCategoriesPast);

    // 2. Active Categories
    const activeCategories = await this.prisma.category.count({
      where: { deletedAt: null, isActive: true },
    });
    const activeCategoriesPast = await this.prisma.category.count({
      where: { deletedAt: null, isActive: true, createdAt: { lt: thirtyDaysAgo } },
    });
    const activeCategoriesChange = calculateGrowth(activeCategories, activeCategoriesPast);

    // 3. Sub Categories
    const subCategories = await this.prisma.category.count({
      where: { deletedAt: null, parentId: { not: null } },
    });
    const subCategoriesPast = await this.prisma.category.count({
      where: { deletedAt: null, parentId: { not: null }, createdAt: { lt: thirtyDaysAgo } },
    });
    const subCategoriesChange = calculateGrowth(subCategories, subCategoriesPast);

    // 4. Total Products
    const totalProducts = await this.prisma.product.count({
      where: { deletedAt: null },
    });
    const totalProductsPast = await this.prisma.product.count({
      where: { deletedAt: null, createdAt: { lt: thirtyDaysAgo } },
    });
    const totalProductsChange = calculateGrowth(totalProducts, totalProductsPast);

    // 5. Inactive Categories
    const inactiveCategories = await this.prisma.category.count({
      where: { deletedAt: null, isActive: false },
    });
    const inactiveCategoriesPast = await this.prisma.category.count({
      where: { deletedAt: null, isActive: false, createdAt: { lt: thirtyDaysAgo } },
    });
    const inactiveCategoriesChange = calculateGrowth(inactiveCategories, inactiveCategoriesPast);

    return {
      totalCategories: {
        value: totalCategories,
        change: totalCategoriesChange,
        changeType: totalCategoriesChange >= 0 ? 'increase' : 'decrease',
      },
      activeCategories: {
        value: activeCategories,
        change: activeCategoriesChange,
        changeType: activeCategoriesChange >= 0 ? 'increase' : 'decrease',
      },
      subCategories: {
        value: subCategories,
        change: subCategoriesChange,
        changeType: subCategoriesChange >= 0 ? 'increase' : 'decrease',
      },
      totalProducts: {
        value: totalProducts,
        change: totalProductsChange,
        changeType: totalProductsChange >= 0 ? 'increase' : 'decrease',
      },
      inactiveCategories: {
        value: inactiveCategories,
        change: inactiveCategoriesChange,
        changeType: inactiveCategoriesChange >= 0 ? 'increase' : 'decrease',
      },
    };
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
