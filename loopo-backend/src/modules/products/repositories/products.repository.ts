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
          select: {
            id: true, email: true, phone: true, firstName: true, lastName: true,
            // Real KYC-complete signal for the "Verified/Trusted Seller"
            // badge - Profile.verifiedBadge is what KycService.approveKyc/
            // rejectKyc actually set; without this the embedded seller
            // object here had no way to carry it at all.
            profile: { select: { verifiedBadge: true } },
            // Centralized seller rating/count/positive% (ReputationService.
            // recalculateSellerStats) - avoids a second, divergent rating
            // formula living inside the product-listing display path.
            sellerStatistics: { select: { averageRating: true, totalReviews: true, positivePercent: true } },
          },
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
          select: {
            id: true, email: true, phone: true, firstName: true, lastName: true,
            // Real KYC-complete signal for the "Verified/Trusted Seller"
            // badge - Profile.verifiedBadge is what KycService.approveKyc/
            // rejectKyc actually set; without this the embedded seller
            // object here had no way to carry it at all.
            profile: { select: { verifiedBadge: true } },
            // Centralized seller rating/count/positive% (ReputationService.
            // recalculateSellerStats) - avoids a second, divergent rating
            // formula living inside the product-listing display path.
            sellerStatistics: { select: { averageRating: true, totalReviews: true, positivePercent: true } },
          },
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
        seller: {
          select: {
            id: true, email: true, phone: true, firstName: true, lastName: true,
            // Real KYC-complete signal for the "Verified/Trusted Seller"
            // badge - Profile.verifiedBadge is what KycService.approveKyc/
            // rejectKyc actually set; without this the embedded seller
            // object here had no way to carry it at all.
            profile: { select: { verifiedBadge: true } },
            // Centralized seller rating/count/positive% (ReputationService.
            // recalculateSellerStats) - avoids a second, divergent rating
            // formula living inside the product-listing display path.
            sellerStatistics: { select: { averageRating: true, totalReviews: true, positivePercent: true } },
          },
        },
        category: { select: { id: true, name: true, slug: true } },
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

  /** The real, authoritative KYC-complete signal: Profile.verifiedBadge,
   * which KycService.approveKyc/rejectKyc actually flip
   * (true/false respectively) - not SellerProfile.kycStatus, which is a
   * separate, seed-only field the real approve/reject flow never touches. */
  async isSellerKycVerified(sellerId: string): Promise<boolean> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: sellerId },
      select: { verifiedBadge: true },
    });
    return profile?.verifiedBadge === true;
  }

  async findActiveUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: { id: true, deletedAt: true } });
  }

  /** A seller can't just type in an arbitrary stranger's id when marking a
   * listing Sold and claim they were the buyer - this requires the
   * selected user to have a real, pre-existing Offer or chat Conversation
   * on this exact listing. Either is sufficient (matches the "genuine
   * interaction" mechanisms already in the app). */
  async hasGenuineInteraction(productId: string, sellerId: string, buyerId: string): Promise<boolean> {
    const [offer, conversation] = await Promise.all([
      this.prisma.offer.findFirst({
        where: { productId, sellerId, buyerId },
        select: { id: true },
      }),
      this.prisma.conversation.findFirst({
        where: { productId, sellerId, buyerId },
        select: { id: true },
      }),
    ]);
    return Boolean(offer || conversation);
  }

  /** Atomically: flip the listing to SOLD, create the Order representing
   * this direct/offline sale, and create the buyer's rating-eligibility
   * (pending-rating) record - all or nothing, so a crash or concurrent
   * request can never leave "sold + ordered" without the eligibility that
   * is supposed to always accompany it, or vice versa. */
  async markSoldWithBuyerTransaction(params: {
    productId: string;
    sellerId: string;
    buyerId: string;
    price: number;
    currency: string;
    expiresAt: Date;
  }) {
    const { productId, sellerId, buyerId, price, currency, expiresAt } = params;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: { status: 'SOLD' },
      });

      await tx.productStatusHistory.create({
        data: {
          productId,
          fromStatus: 'APPROVED',
          toStatus: 'SOLD',
          comment: 'Seller marked listing sold and selected the buyer',
          changedById: sellerId,
        },
      });

      const order = await tx.order.create({
        data: {
          buyerId,
          sellerId,
          productId,
          quantity: 1,
          price,
          totalAmount: price,
          currency,
          status: 'DELIVERED',
        },
      });

      // Unique on (buyerId, sellerId, productId) and on orderId - a second
      // concurrent attempt to mark the same listing sold (e.g. a retried
      // request) will violate this and roll the whole transaction back
      // rather than silently creating a duplicate eligibility/order pair.
      const eligibility = await tx.ratingEligibility.create({
        data: {
          buyerId,
          sellerId,
          productId,
          orderId: order.id,
          expiresAt,
        },
      });

      return { product, order, eligibility };
    });
  }
}
