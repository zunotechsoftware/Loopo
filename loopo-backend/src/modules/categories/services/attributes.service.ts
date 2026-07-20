import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AttributesRepository } from '../repositories/attributes.repository';
import { CategoriesRepository } from '../repositories/categories.repository';
import { CreateAttributeDto, UpdateAttributeDto, CreateAttributeGroupDto, UpdateAttributeGroupDto } from '../dto/attribute.dto';
import { CreateOptionDto, UpdateOptionDto } from '../dto/option.dto';
import { RedisService } from '../../../shared/redis/redis.service';

@Injectable()
export class AttributesService {
  constructor(
    private readonly attributesRepo: AttributesRepository,
    private readonly categoriesRepo: CategoriesRepository,
    private readonly redisService: RedisService,
  ) {}

  // --- Attribute Groups ---
  async createGroup(categoryId: string, dto: CreateAttributeGroupDto) {
    const category = await this.categoriesRepo.findById(categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const group = await this.attributesRepo.createGroup({
      categoryId,
      name: dto.name,
      sortOrder: dto.sortOrder || 0,
    });

    await this.invalidateCategoryAttributesCache(categoryId);
    return group;
  }

  async updateGroup(groupId: string, dto: UpdateAttributeGroupDto) {
    const group = await this.attributesRepo.findGroupById(groupId);
    if (!group) {
      throw new NotFoundException(`Attribute Group with ID ${groupId} not found`);
    }

    const updated = await this.attributesRepo.updateGroup(groupId, {
      name: dto.name,
      sortOrder: dto.sortOrder,
    });

    await this.invalidateCategoryAttributesCache(group.categoryId);
    return updated;
  }

  async deleteGroup(groupId: string) {
    const group = await this.attributesRepo.findGroupById(groupId);
    if (!group) {
      throw new NotFoundException(`Attribute Group with ID ${groupId} not found`);
    }

    await this.attributesRepo.deleteGroup(groupId);
    await this.invalidateCategoryAttributesCache(group.categoryId);

    return { id: groupId, success: true };
  }

  async getGroups(categoryId: string) {
    const category = await this.categoriesRepo.findById(categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
    return this.attributesRepo.findGroupsByCategoryId(categoryId);
  }

  // --- Attributes Management ---
  async createAttribute(categoryId: string, dto: CreateAttributeDto, userId?: string) {
    const category = await this.categoriesRepo.findById(categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Generate slug from name if not provided
    const slug = dto.slug || this.slugify(dto.name);

    // Verify slug uniqueness within this category
    const existing = await this.attributesRepo.findAttributeBySlug(categoryId, slug);
    if (existing) {
      throw new BadRequestException(`Attribute slug '${slug}' already exists in this category`);
    }

    // Verify group if provided
    if (dto.groupId) {
      const group = await this.attributesRepo.findGroupById(dto.groupId);
      if (!group || group.categoryId !== categoryId) {
        throw new BadRequestException(`Attribute Group with ID ${dto.groupId} not found in this category`);
      }
    }

    const attribute = await this.attributesRepo.createAttribute({
      categoryId,
      groupId: dto.groupId || null,
      name: dto.name,
      slug,
      type: dto.type,
      isRequired: dto.isRequired || false,
      minLength: dto.minLength,
      maxLength: dto.maxLength,
      minValue: dto.minValue,
      maxValue: dto.maxValue,
      regex: dto.regex,
      isUnique: dto.isUnique || false,
      placeholder: dto.placeholder,
      helpText: dto.helpText,
      defaultValue: dto.defaultValue,
      sortOrder: dto.sortOrder || 0,
      createdBy: userId,
    });

    await this.invalidateCategoryAttributesCache(categoryId);
    return attribute;
  }

  async updateAttribute(attributeId: string, dto: UpdateAttributeDto, userId?: string) {
    const attribute = await this.attributesRepo.findAttributeById(attributeId);
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${attributeId} not found`);
    }

    const updateData: any = {
      name: dto.name,
      type: dto.type,
      isRequired: dto.isRequired,
      minLength: dto.minLength,
      maxLength: dto.maxLength,
      minValue: dto.minValue,
      maxValue: dto.maxValue,
      regex: dto.regex,
      isUnique: dto.isUnique,
      placeholder: dto.placeholder,
      helpText: dto.helpText,
      defaultValue: dto.defaultValue,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
      updatedBy: userId,
    };

    if (dto.slug && dto.slug !== attribute.slug) {
      const existing = await this.attributesRepo.findAttributeBySlug(attribute.categoryId, dto.slug);
      if (existing) {
        throw new BadRequestException(`Attribute slug '${dto.slug}' already exists in this category`);
      }
      updateData.slug = dto.slug;
    }

    if (dto.groupId !== undefined) {
      if (dto.groupId) {
        const group = await this.attributesRepo.findGroupById(dto.groupId);
        if (!group || group.categoryId !== attribute.categoryId) {
          throw new BadRequestException(`Attribute Group with ID ${dto.groupId} not found in this category`);
        }
        updateData.groupId = dto.groupId;
      } else {
        updateData.groupId = null;
      }
    }

    const updated = await this.attributesRepo.updateAttribute(attributeId, updateData);
    await this.invalidateCategoryAttributesCache(attribute.categoryId);

    return updated;
  }

  async deleteAttribute(attributeId: string, userId?: string) {
    const attribute = await this.attributesRepo.findAttributeById(attributeId);
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${attributeId} not found`);
    }

    await this.attributesRepo.softDeleteAttribute(attributeId, userId);
    await this.invalidateCategoryAttributesCache(attribute.categoryId);

    return { id: attributeId, deletedAt: new Date() };
  }

  async getCategoryAttributes(categoryId: string, includeInherited = true) {
    const cacheKey = `categories:attributes:${categoryId}:${includeInherited}`;
    
    // Check Cache
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Redis read error for category attributes:', err);
    }

    let attributes: any[] = [];

    if (includeInherited) {
      // Resolve path of ancestor category IDs
      const ancestors = await this.categoriesRepo.findAncestors(categoryId);
      const ancestorIds = ancestors.map((a) => a.id);
      
      // Fetch combined attributes
      attributes = await this.attributesRepo.findAttributesByCategoryIds(ancestorIds);
    } else {
      attributes = await this.attributesRepo.findAttributesByCategoryId(categoryId);
    }

    // Cache results
    try {
      await this.redisService.set(cacheKey, JSON.stringify(attributes), 3600); // 1 hour TTL
    } catch (err) {
      console.error('Redis write error for category attributes:', err);
    }

    return attributes;
  }

  // --- Attribute Options Management ---
  async createOption(attributeId: string, dto: CreateOptionDto) {
    const attribute = await this.attributesRepo.findAttributeById(attributeId);
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${attributeId} not found`);
    }

    const option = await this.attributesRepo.createOption({
      attributeId,
      value: dto.value,
      label: dto.label,
      sortOrder: dto.sortOrder || 0,
    });

    await this.invalidateCategoryAttributesCache(attribute.categoryId);
    return option;
  }

  async updateOption(optionId: string, dto: UpdateOptionDto) {
    const option = await this.attributesRepo.findOptionById(optionId);
    if (!option) {
      throw new NotFoundException(`Option with ID ${optionId} not found`);
    }

    const updated = await this.attributesRepo.updateOption(optionId, {
      value: dto.value,
      label: dto.label,
      sortOrder: dto.sortOrder,
    });

    const attribute = await this.attributesRepo.findAttributeById(option.attributeId);
    if (attribute) {
      await this.invalidateCategoryAttributesCache(attribute.categoryId);
    }

    return updated;
  }

  async deleteOption(optionId: string) {
    const option = await this.attributesRepo.findOptionById(optionId);
    if (!option) {
      throw new NotFoundException(`Option with ID ${optionId} not found`);
    }

    await this.attributesRepo.deleteOption(optionId);
    const attribute = await this.attributesRepo.findAttributeById(option.attributeId);
    if (attribute) {
      await this.invalidateCategoryAttributesCache(attribute.categoryId);
    }

    return { id: optionId, success: true };
  }

  async getOptions(attributeId: string) {
    const attribute = await this.attributesRepo.findAttributeById(attributeId);
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${attributeId} not found`);
    }
    return this.attributesRepo.findOptionsByAttributeId(attributeId);
  }

  // --- Helpers ---
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async invalidateCategoryAttributesCache(categoryId: string) {
    try {
      // Invalidate both direct and inherited caches
      await this.redisService.del(`categories:attributes:${categoryId}:true`);
      await this.redisService.del(`categories:attributes:${categoryId}:false`);

      // Invalidate children's caches since they inherit from this category
      const children = await this.categoriesRepo.findChildren(categoryId);
      for (const child of children) {
        await this.invalidateCategoryAttributesCache(child.id);
      }
    } catch (err) {
      console.error('Redis delete error for category attributes cache:', err);
    }
  }
}
