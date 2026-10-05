import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma, ReviewType, RatingEligibilityStatus } from '@prisma/client';

const REVIEW_LIST_INCLUDE = {
  reviewer: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
  ratings: true,
  reactions: true,
  tags: true,
  photos: { orderBy: { sortOrder: 'asc' as const } },
  response: true,
};

@Injectable()
export class ReviewsRepository {
  constructor(public readonly prisma: PrismaService) {}

  /** Creates the review, its rating row, tag links, and photo rows in one
   * transaction - a review with tags/photos either fully exists or doesn't,
   * never half-written. */
  async createReviewWithDetails(params: {
    review: Prisma.ReviewUncheckedCreateInput;
    rating: Omit<Prisma.ReviewRatingUncheckedCreateInput, 'reviewId'>;
    tagIds?: string[];
    photos?: { fileUrl: string; fileKey: string }[];
  }) {
    const { review, rating, tagIds, photos } = params;
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          ...review,
          ratings: { create: rating },
          tags: tagIds && tagIds.length > 0 ? { connect: tagIds.map((id) => ({ id })) } : undefined,
          photos: photos && photos.length > 0
            ? { create: photos.map((p, i) => ({ fileUrl: p.fileUrl, fileKey: p.fileKey, sortOrder: i })) }
            : undefined,
        },
        include: REVIEW_LIST_INCLUDE,
      });

      if (review.eligibilityId) {
        await tx.ratingEligibility.update({
          where: { id: review.eligibilityId },
          data: { status: RatingEligibilityStatus.COMPLETED },
        });
      }

      return created;
    });
  }

  async updateRating(reviewId: string, data: Prisma.ReviewRatingUncheckedUpdateInput) {
    return this.prisma.reviewRating.update({ where: { reviewId }, data });
  }

  async findReviewById(id: string) {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        ...REVIEW_LIST_INCLUDE,
        targetUser: { select: { id: true, email: true, firstName: true, lastName: true } },
        product: { select: { id: true, title: true, slug: true } },
      },
    });
  }

  async findReviewByUnique(reviewerId: string, productId: string, reviewType: ReviewType) {
    return this.prisma.review.findUnique({
      where: {
        reviewerId_productId_reviewType: { reviewerId, productId, reviewType },
      },
    });
  }

  async updateReview(id: string, data: Prisma.ReviewUncheckedUpdateInput) {
    return this.prisma.review.update({ where: { id }, data, include: { ratings: true } });
  }

  async softDeleteReview(id: string) {
    return this.prisma.review.update({
      where: { id },
      data: { deletedAt: new Date(), isVisible: false },
    });
  }

  async restoreReview(id: string) {
    return this.prisma.review.update({
      where: { id },
      data: { deletedAt: null, isVisible: true },
    });
  }

  /** Paginated + filterable seller reviews (the dedicated Reviews page).
   * Defaults (page 1, limit 20, no star/positive filter) match the old
   * unbounded findReviewsByUser's visible result set exactly. */
  async findSellerReviewsPaginated(params: {
    sellerId: string;
    page?: number;
    limit?: number;
    star?: number;
    positiveOnly?: boolean;
  }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 50) : 20;

    const where: Prisma.ReviewWhereInput = {
      targetUserId: params.sellerId,
      reviewType: { in: [ReviewType.SELLER_REVIEW, ReviewType.PRODUCT_REVIEW] },
      deletedAt: null,
      isVisible: true,
    };
    if (params.star) {
      where.ratings = { some: { overall: params.star } };
    } else if (params.positiveOnly) {
      where.ratings = { some: { overall: { gte: 4 } } };
    }

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: REVIEW_LIST_INCLUDE,
      }),
      this.prisma.review.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  /** Rating distribution (count per 1-5 star value) for a seller's valid,
   * visible reviews - a single grouped aggregate query, not N queries. */
  async getRatingDistribution(sellerId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        targetUserId: sellerId,
        reviewType: { in: [ReviewType.SELLER_REVIEW, ReviewType.PRODUCT_REVIEW] },
        deletedAt: null,
        isVisible: true,
      },
      select: { ratings: { select: { overall: true } } },
    });

    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of reviews) {
      const overall = review.ratings[0]?.overall;
      if (overall && overall >= 1 && overall <= 5) {
        distribution[overall as 1 | 2 | 3 | 4 | 5]++;
      }
    }
    return distribution;
  }

  async findAllReviews(filters?: {
    isVisible?: boolean;
    reviewType?: ReviewType;
    search?: string;
    reportedOnly?: boolean;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.ReviewWhereInput = { deletedAt: null };
    if (filters?.isVisible !== undefined) where.isVisible = filters.isVisible;
    if (filters?.reviewType !== undefined) where.reviewType = filters.reviewType;
    if (filters?.search) {
      where.content = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters?.reportedOnly) {
      const reportedIds = await this.prisma.report.findMany({
        where: { targetType: 'REVIEW', deletedAt: null },
        select: { targetId: true },
        distinct: ['targetId'],
      });
      where.id = { in: reportedIds.map((r) => r.targetId) };
    }

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: filters?.skip,
        take: filters?.take,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: { select: { id: true, email: true, firstName: true, lastName: true } },
          targetUser: { select: { id: true, email: true, firstName: true, lastName: true } },
          product: { select: { id: true, title: true } },
          ratings: true,
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { items, total };
  }

  /** Report rows filed against this specific review - surfaced on the
   * admin review detail view. */
  async getReportsForReview(reviewId: string) {
    return this.prisma.report.findMany({
      where: { targetType: 'REVIEW', targetId: reviewId, deletedAt: null },
      include: { reporter: { select: { id: true, firstName: true, lastName: true, email: true } }, reason: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsertReaction(reviewId: string, userId: string, type: string) {
    return this.prisma.reviewReaction.upsert({
      where: { reviewId_userId_type: { reviewId, userId, type } },
      update: {},
      create: { reviewId, userId, type },
    });
  }

  async deleteReaction(reviewId: string, userId: string, type: string) {
    return this.prisma.reviewReaction.delete({
      where: { reviewId_userId_type: { reviewId, userId, type } },
    }).catch(() => null);
  }

  async findReviewsByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, deletedAt: null, isVisible: true },
      orderBy: { createdAt: 'desc' },
      include: REVIEW_LIST_INCLUDE,
    });
  }

  async getReviewRatingsForUser(userId: string, reviewType?: ReviewType) {
    const where: Prisma.ReviewWhereInput = {
      targetUserId: userId,
      deletedAt: null,
      isVisible: true,
    };
    if (reviewType) where.reviewType = reviewType;

    return this.prisma.review.findMany({
      where,
      include: { ratings: true },
    });
  }

  async getReviewRatingsForProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, deletedAt: null, isVisible: true },
      include: { ratings: true },
    });
  }

  // --- Review Tags ---
  async findActiveTags() {
    return this.prisma.reviewTag.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  async findTagsByIds(ids: string[]) {
    return this.prisma.reviewTag.findMany({ where: { id: { in: ids }, isActive: true } });
  }

  // --- Seller Responses ---
  async createResponse(reviewId: string, sellerId: string, content: string) {
    return this.prisma.reviewResponse.create({ data: { reviewId, sellerId, content } });
  }

  async updateResponse(reviewId: string, content: string) {
    return this.prisma.reviewResponse.update({
      where: { reviewId },
      data: { content, editedAt: new Date() },
    });
  }

  async findResponseByReviewId(reviewId: string) {
    return this.prisma.reviewResponse.findUnique({ where: { reviewId } });
  }

  // --- Rating Eligibility (pending ratings) ---
  async findEligibilityById(id: string) {
    return this.prisma.ratingEligibility.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        product: { select: { id: true, title: true, slug: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } } },
      },
    });
  }

  async findPendingEligibilitiesForBuyer(buyerId: string) {
    return this.prisma.ratingEligibility.findMany({
      where: { buyerId, status: RatingEligibilityStatus.PENDING, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        product: { select: { id: true, title: true, slug: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } } },
      },
    });
  }

  async expireStaleEligibilities(): Promise<number> {
    const result = await this.prisma.ratingEligibility.updateMany({
      where: { status: RatingEligibilityStatus.PENDING, expiresAt: { lt: new Date() } },
      data: { status: RatingEligibilityStatus.EXPIRED },
    });
    return result.count;
  }
}
