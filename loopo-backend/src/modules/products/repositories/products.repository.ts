import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma, ProductStatus } from '@prisma/client';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    product: Prisma.ProductUncheckedCreateInput;
    location: Prisma.ProductLocationUncheckedCreateWithoutProductInput;
    attributes?: { attributeId: string; value: string }[];
  }) {
    const { product, location, attributes } = params;

    return this.prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          ...product,
          location: {
            create: location,
          },
          statistics: {
            create: {}, // Initialize blank stats record
          },
        },
      });

      if (attributes && attributes.length > 0) {
        await tx.productAttribute.createMany({
          data: attributes.map((attr) => ({
            productId: createdProduct.id,
            attributeId: attr.attributeId,
            value: attr.value,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: createdProduct.id },
        include: {
          location: true,
          attributes: true,
          statistics: true,
        },
      });
    });
  }

  async update(
    id: string,
    params: {
      product: Prisma.ProductUncheckedUpdateInput;
      location?: Prisma.ProductLocationUncheckedUpdateWithoutProductInput;
      attributes?: { attributeId: string; value: string }[];
    },
  ) {
    const { product, location, attributes } = params;

    return this.prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: product,
      });

      if (location) {
        await tx.productLocation.upsert({
          where: { productId: id },
          update: location,
          create: {
            ...location,
            productId: id,
          } as any,
        });
      }

      if (attributes) {
        // Simple strategy: wipe existing attributes and write updated list
        await tx.productAttribute.deleteMany({
          where: { productId: id },
        });

        if (attributes.length > 0) {
          await tx.productAttribute.createMany({
            data: attributes.map((attr) => ({
              productId: id,
              attributeId: attr.attributeId,
              value: attr.value,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          location: true,
          attributes: true,
          images: true,
          videos: true,
        },
      });
    });
  }

  async softDelete(id: string, updatedBy?: string) {
    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy,
      },
    });
  }

  async restore(id: string, updatedBy?: string) {
    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedBy,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        seller: {
          select: { id: true, email: true, phone: true, firstName: true, lastName: true },
        },
        category: true,
        location: true,
        attributes: {
          include: { attribute: true },
        },
        images: { orderBy: { sortOrder: 'asc' } },
        videos: { orderBy: { sortOrder: 'asc' } },
        statistics: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        seller: {
          select: { id: true, email: true, phone: true, firstName: true, lastName: true },
        },
        category: true,
        location: true,
        attributes: {
          include: { attribute: true },
        },
        images: { orderBy: { sortOrder: 'asc' } },
        videos: { orderBy: { sortOrder: 'asc' } },
        statistics: true,
      },
    });
  }

  async findAll(params: {
    skip: number;
    take: number;
    where: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.product.findMany({
      skip,
      take,
      where: {
        ...where,
        deletedAt: null,
      },
      include: {
        location: true,
        images: { orderBy: { sortOrder: 'asc' } },
        statistics: true,
      },
      orderBy: orderBy || { createdAt: 'desc' },
    });
  }

  async count(where: Prisma.ProductWhereInput) {
    return this.prisma.product.count({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  async createStatusHistory(data: Prisma.ProductStatusHistoryUncheckedCreateInput) {
    return this.prisma.productStatusHistory.create({
      data,
    });
  }

  // --- Media Handlers ---
  async addImage(data: Prisma.ProductImageUncheckedCreateInput) {
    return this.prisma.productImage.create({
      data,
    });
  }

  async updateImage(id: string, data: Prisma.ProductImageUncheckedUpdateInput) {
    return this.prisma.productImage.update({
      where: { id },
      data,
    });
  }

  async deleteImage(id: string) {
    return this.prisma.productImage.delete({
      where: { id },
    });
  }

  async findImageById(id: string) {
    return this.prisma.productImage.findUnique({
      where: { id },
    });
  }

  async addVideo(data: Prisma.ProductVideoUncheckedCreateInput) {
    return this.prisma.productVideo.create({
      data,
    });
  }

  async deleteVideo(id: string) {
    return this.prisma.productVideo.delete({
      where: { id },
    });
  }

  async findVideoById(id: string) {
    return this.prisma.productVideo.findUnique({
      where: { id },
    });
  }

  // --- Promoted Ads ---
  async createFeatured(data: Prisma.FeaturedProductUncheckedCreateInput) {
    return this.prisma.featuredProduct.create({
      data,
    });
  }

  async createBoosted(data: Prisma.BoostedProductUncheckedCreateInput) {
    return this.prisma.boostedProduct.create({
      data,
    });
  }

  // --- Expirations ---
  async findExpiredListings(now: Date): Promise<string[]> {
    const expired = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.APPROVED,
        expiresAt: { lt: now },
        deletedAt: null,
      },
      select: { id: true },
    });
    return expired.map((p) => p.id);
  }

  async expireMultipleListings(ids: string[]) {
    return this.prisma.product.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: ProductStatus.EXPIRED,
      },
    });
  }

  // --- View stats tracking & Redis batch sync ---
  async syncStatisticsBatch(productId: string, viewsCount: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update stats table
      await tx.productStatistics.upsert({
        where: { productId },
        update: {
          viewsTotal: { increment: viewsCount },
        },
        create: {
          productId,
          viewsTotal: viewsCount,
        },
      });

      // 2. Sync to product count field for cached reads
      await tx.product.update({
        where: { id: productId },
        data: {
          viewCount: { increment: viewsCount },
        },
      });
    });
  }
}
