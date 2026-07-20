import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { CreateCategoryDto, UpdateCategoryDto, ReorderCategoriesDto } from '../dto/category.dto';
import { RedisService } from '../../../shared/redis/redis.service';

@Injectable()
export class CategoriesService {
  private readonly TREE_CACHE_KEY = 'categories:tree';

  constructor(
    private readonly categoriesRepo: CategoriesRepository,
    private readonly redisService: RedisService,
  ) {}

  async createCategory(dto: CreateCategoryDto, userId?: string) {
    // 1. If parentId is provided, verify it exists and is not deleted
    let level = 0;
    if (dto.parentId) {
      const parent = await this.categoriesRepo.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${dto.parentId} not found`);
      }
      level = parent.level + 1;
    }

    // 2. Generate slug
    const slug = await this.generateSlug(dto.name, dto.parentId);

    // 3. Create category
    const category = await this.categoriesRepo.create({
      name: dto.name,
      slug,
      description: dto.description,
      parentId: dto.parentId || null,
      level,
      sortOrder: dto.sortOrder || 0,
      icon: dto.icon,
      bannerImage: dto.bannerImage,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      createdBy: userId,
    });

    // 4. Invalidate caches
    await this.invalidateTreeCache();

    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, userId?: string) {
    const category = await this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const updateData: any = {
      description: dto.description,
      sortOrder: dto.sortOrder,
      icon: dto.icon,
      bannerImage: dto.bannerImage,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      updatedBy: userId,
    };

    // If name is updated, regenerate slug
    if (dto.name && dto.name !== category.name) {
      updateData.name = dto.name;
      updateData.slug = await this.generateSlug(dto.name, dto.parentId || category.parentId || undefined);
    }

    // If parentId is updated
    if (dto.parentId !== undefined && dto.parentId !== category.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }

      if (dto.parentId) {
        const newParent = await this.categoriesRepo.findById(dto.parentId);
        if (!newParent) {
          throw new NotFoundException(`New parent category with ID ${dto.parentId} not found`);
        }
        
        // Cycle detection: ensure new parent is not a child/descendant of this category
        const ancestors = await this.categoriesRepo.findAncestors(dto.parentId);
        if (ancestors.some((ancestor) => ancestor.id === id)) {
          throw new BadRequestException('Cannot move a category under its own descendant (cyclic reference detected)');
        }

        updateData.parentId = dto.parentId;
        updateData.level = newParent.level + 1;
      } else {
        updateData.parentId = null;
        updateData.level = 0;
      }
    }

    const updated = await this.categoriesRepo.update(id, updateData);

    // Invalidate caches
    await this.invalidateCategoryCache(id, category.slug);
    if (updateData.slug && updateData.slug !== category.slug) {
      await this.invalidateCategoryCache(id, updateData.slug);
    }
    await this.invalidateTreeCache();

    return updated;
  }

  async deleteCategory(id: string, userId?: string) {
    const category = await this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Soft delete category
    await this.categoriesRepo.softDelete(id, userId);

    // Invalidate caches
    await this.invalidateCategoryCache(id, category.slug);
    await this.invalidateTreeCache();

    return { id, deletedAt: new Date() };
  }

  async restoreCategory(id: string, userId?: string) {
    const category = await this.prismaFindDeleted(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found or not deleted`);
    }

    const restored = await this.categoriesRepo.restore(id, userId);

    // Invalidate caches
    await this.invalidateTreeCache();

    return restored;
  }

  async updateCategoryStatus(id: string, isActive: boolean, userId?: string) {
    const category = await this.categoriesRepo.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const updated = await this.categoriesRepo.update(id, {
      isActive,
      updatedBy: userId,
    });

    // Invalidate caches
    await this.invalidateCategoryCache(id, category.slug);
    await this.invalidateTreeCache();

    return updated;
  }

  async moveCategory(id: string, parentId: string | null, userId?: string) {
    return this.updateCategory(id, { parentId: parentId || undefined }, userId);
  }

  async reorderCategories(dto: ReorderCategoriesDto, userId?: string) {
    // Perform bulk updates in transaction (within repository layer context)
    for (const item of dto.categories) {
      await this.categoriesRepo.update(item.id, {
        sortOrder: item.sortOrder,
        updatedBy: userId,
      });
      // Invalidate detail cache for each
      const cat = await this.categoriesRepo.findById(item.id);
      if (cat) {
        await this.invalidateCategoryCache(item.id, cat.slug);
      }
    }

    await this.invalidateTreeCache();
    return { success: true };
  }

  async getCategoryTree() {
    // 1. Try to read from Redis cache
    try {
      const cachedTree = await this.redisService.get(this.TREE_CACHE_KEY);
      if (cachedTree) {
        return JSON.parse(cachedTree);
      }
    } catch (err) {
      console.error('Redis read error for category tree:', err);
    }

    // 2. Fetch all categories and build tree in memory
    const allCategories = await this.categoriesRepo.findTree();
    const tree = this.buildTreeStructure(allCategories, null);

    // 3. Write back to Redis
    try {
      await this.redisService.set(this.TREE_CACHE_KEY, JSON.stringify(tree), 86400); // 24 hour TTL
    } catch (err) {
      console.error('Redis write error for category tree:', err);
    }

    return tree;
  }

  async getCategoryDetails(idOrSlug: string) {
    const cacheKey = `categories:detail:${idOrSlug}`;
    
    // Check cache
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Redis read error for category details:', err);
    }

    // Fetch DB
    let category = await this.categoriesRepo.findById(idOrSlug);
    if (!category) {
      category = await this.categoriesRepo.findBySlug(idOrSlug);
    }

    if (!category) {
      throw new NotFoundException(`Category with ID or Slug ${idOrSlug} not found`);
    }

    // Write cache
    try {
      await this.redisService.set(cacheKey, JSON.stringify(category), 3600); // 1 hour TTL
    } catch (err) {
      console.error('Redis write error for category details:', err);
    }

    return category;
  }

  async getCategoryPath(id: string) {
    const cacheKey = `categories:path:${id}`;
    
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Redis read error for category path:', err);
    }

    const path = await this.categoriesRepo.findAncestors(id);
    if (path.length === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    try {
      await this.redisService.set(cacheKey, JSON.stringify(path), 3600);
    } catch (err) {
      console.error('Redis write error for category path:', err);
    }

    return path;
  }

  async getCategoryBreadcrumbs(id: string) {
    const path = await this.getCategoryPath(id);
    return path.map((node) => ({
      label: node.name,
      slug: node.slug,
      url: `/categories/${node.slug}`,
    }));
  }

  async getParentCategories() {
    return this.categoriesRepo.findParents();
  }

  async getChildCategories(parentId: string) {
    const parent = await this.categoriesRepo.findById(parentId);
    if (!parent) {
      throw new NotFoundException(`Parent category with ID ${parentId} not found`);
    }
    return this.categoriesRepo.findChildren(parentId);
  }

  // --- Helpers ---

  private async generateSlug(name: string, parentId?: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let fullSlug = baseSlug;
    if (parentId) {
      const parent = await this.categoriesRepo.findById(parentId);
      if (parent) {
        fullSlug = `${parent.slug}-${baseSlug}`;
      }
    }

    let uniqueSlug = fullSlug;
    let counter = 1;
    while (true) {
      const existing = await this.categoriesRepo.findBySlug(uniqueSlug);
      if (!existing) {
        break;
      }
      counter++;
      uniqueSlug = `${fullSlug}-${counter}`;
    }

    return uniqueSlug;
  }

  private buildTreeStructure(categories: any[], parentId: string | null): any[] {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        ...cat,
        children: this.buildTreeStructure(categories, cat.id),
      }));
  }

  private async prismaFindDeleted(id: string) {
    // Direct low-level query to get category regardless of soft-delete state for restore verification
    // Since repository filters out deletedAt: null, we can access it directly via prisma client inside service if needed
    // or Repository can have a custom method. Let's make it query PrismaService database table directly
    const categoriesRepositoryWithDeleted = await this.categoriesRepo.findAll({
      where: { id },
    });
    // Oh, wait, categoriesRepo.findAll appends `deletedAt: null`. Let's bypass repository or check details
    // We can define a database findUnique in repository or do it directly. Let's execute raw or write it.
    // Wait, let's look at categoriesRepo. Let's write a small helper in CategoriesRepository if needed or query database:
    return (this.categoriesRepo as any).prisma.category.findFirst({
      where: { id, deletedAt: { not: null } },
    });
  }

  private async invalidateTreeCache() {
    try {
      await this.redisService.del(this.TREE_CACHE_KEY);
    } catch (err) {
      console.error('Redis delete error:', err);
    }
  }

  private async invalidateCategoryCache(id: string, slug: string) {
    try {
      await this.redisService.del(`categories:detail:${id}`);
      await this.redisService.del(`categories:detail:${slug}`);
      await this.redisService.del(`categories:path:${id}`);
    } catch (err) {
      console.error('Redis delete error for category keys:', err);
    }
  }
}
