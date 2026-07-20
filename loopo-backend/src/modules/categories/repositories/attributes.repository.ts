import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttributesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Category Attribute Groups ---
  async createGroup(data: Prisma.CategoryAttributeGroupUncheckedCreateInput) {
    return this.prisma.categoryAttributeGroup.create({
      data,
    });
  }

  async updateGroup(id: string, data: Prisma.CategoryAttributeGroupUncheckedUpdateInput) {
    return this.prisma.categoryAttributeGroup.update({
      where: { id },
      data,
    });
  }

  async deleteGroup(id: string) {
    return this.prisma.categoryAttributeGroup.delete({
      where: { id },
    });
  }

  async findGroupById(id: string) {
    return this.prisma.categoryAttributeGroup.findUnique({
      where: { id },
    });
  }

  async findGroupsByCategoryId(categoryId: string) {
    return this.prisma.categoryAttributeGroup.findMany({
      where: { categoryId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // --- Category Attributes ---
  async createAttribute(data: Prisma.CategoryAttributeUncheckedCreateInput) {
    return this.prisma.categoryAttribute.create({
      data,
    });
  }

  async updateAttribute(id: string, data: Prisma.CategoryAttributeUncheckedUpdateInput) {
    return this.prisma.categoryAttribute.update({
      where: { id },
      data,
    });
  }

  async softDeleteAttribute(id: string, updatedBy?: string) {
    return this.prisma.categoryAttribute.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy,
      },
    });
  }

  async findAttributeById(id: string) {
    return this.prisma.categoryAttribute.findFirst({
      where: { id, deletedAt: null },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        group: true,
      },
    });
  }

  async findAttributesByCategoryId(categoryId: string) {
    return this.prisma.categoryAttribute.findMany({
      where: { categoryId, deletedAt: null },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        group: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAttributesByCategoryIds(categoryIds: string[]) {
    return this.prisma.categoryAttribute.findMany({
      where: {
        categoryId: { in: categoryIds },
        deletedAt: null,
      },
      include: {
        options: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        group: true,
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAttributeBySlug(categoryId: string, slug: string) {
    return this.prisma.categoryAttribute.findFirst({
      where: { categoryId, slug, deletedAt: null },
    });
  }

  // --- Attribute Options ---
  async createOption(data: Prisma.AttributeOptionUncheckedCreateInput) {
    return this.prisma.attributeOption.create({
      data,
    });
  }

  async updateOption(id: string, data: Prisma.AttributeOptionUncheckedUpdateInput) {
    return this.prisma.attributeOption.update({
      where: { id },
      data,
    });
  }

  async deleteOption(id: string) {
    return this.prisma.attributeOption.delete({
      where: { id },
    });
  }

  async findOptionById(id: string) {
    return this.prisma.attributeOption.findUnique({
      where: { id },
    });
  }

  async findOptionsByAttributeId(attributeId: string) {
    return this.prisma.attributeOption.findMany({
      where: { attributeId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // --- Category Attribute Values (For Listings) ---
  async createValue(data: Prisma.CategoryAttributeValueUncheckedCreateInput) {
    return this.prisma.categoryAttributeValue.create({
      data,
    });
  }

  async findValuesByListingId(listingId: string) {
    return this.prisma.categoryAttributeValue.findMany({
      where: { listingId },
      include: {
        attribute: true,
      },
    });
  }
}
