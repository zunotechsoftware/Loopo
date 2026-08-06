import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    return this.prisma.category.create({
      data,
    });
  }

  async update(id: string, data: Prisma.CategoryUncheckedUpdateInput) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string, updatedBy?: string) {
    return this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy,
      },
    });
  }

  async restore(id: string, updatedBy?: string) {
    return this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
        updatedBy,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        parent: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findFirst({
      where: { slug, deletedAt: null },
      include: {
        parent: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.category.findMany({
      skip,
      take,
      where: {
        ...where,
        deletedAt: null,
      },
      orderBy: orderBy || { sortOrder: 'asc' },
    });
  }

  async findTree() {
    // Fetches all categories that are not soft-deleted to construct tree in memory (scalable for thousands, for millions we can cache the compiled tree in Redis)
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findChildren(parentId: string) {
    return this.prisma.category.findMany({
      where: {
        parentId,
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findParents() {
    return this.prisma.category.findMany({
      where: {
        parentId: null,
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAncestors(categoryId: string): Promise<any[]> {
    // Resolves category ancestors path iteratively to support unlimited levels
    const path: any[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category = await this.prisma.category.findFirst({
        where: { id: currentId, deletedAt: null },
        select: { id: true, name: true, slug: true, parentId: true, level: true },
      });

      if (!category) break;
      path.unshift(category); // prepend to get root-to-leaf path
      currentId = category.parentId;
    }

    return path;
  }
}
