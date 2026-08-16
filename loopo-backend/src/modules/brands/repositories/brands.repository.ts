import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BrandUncheckedCreateInput) {
    return this.prisma.brand.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: Prisma.BrandUncheckedUpdateInput) {
    return this.prisma.brand.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async softDelete(id: string, updatedBy?: string) {
    return this.prisma.brand.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy,
      },
    });
  }

  async restore(id: string, updatedBy?: string) {
    return this.prisma.brand.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
        updatedBy,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.brand.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.brand.findFirst({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
    categoryId?: string;
    isFeatured?: boolean;
  }) {
    const { skip = 0, take = 10, search, status, categoryId, isFeatured } = params;

    const where: Prisma.BrandWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    const [data, total] = await Promise.all([
      this.prisma.brand.findMany({
        skip,
        take,
        where,
        include: {
          category: true,
          _count: {
            select: { products: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.brand.count({ where }),
    ]);

    return { data, total };
  }

  async count(where?: Prisma.BrandWhereInput) {
    return this.prisma.brand.count({
      where: {
        deletedAt: null,
        ...where,
      },
    });
  }

  async getStats() {
    const [total, active, inactive, featured] = await Promise.all([
      this.prisma.brand.count({ where: { deletedAt: null } }),
      this.prisma.brand.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.brand.count({ where: { deletedAt: null, isActive: false } }),
      this.prisma.brand.count({ where: { deletedAt: null, isFeatured: true } }),
    ]);

    // Count total products linked to brands
    const totalProducts = await this.prisma.product.count({
      where: { brandId: { not: null }, deletedAt: null },
    });

    return { total, active, inactive, featured, totalProducts };
  }
}
