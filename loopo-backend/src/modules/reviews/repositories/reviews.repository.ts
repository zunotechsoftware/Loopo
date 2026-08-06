import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma, ReviewType } from '@prisma/client';

@Injectable()
export class ReviewsRepository {
  constructor(public readonly prisma: PrismaService) {}

  async createReview(data: Prisma.ReviewUncheckedCreateInput) {
    return this.prisma.review.create({ data, include: { ratings: true } });
  }

  async createRating(data: Prisma.ReviewRatingUncheckedCreateInput) {
    return this.prisma.reviewRating.create({ data });
  }

  async updateRating(reviewId: string, data: Prisma.ReviewRatingUncheckedUpdateInput) {
    return this.prisma.reviewRating.update({ where: { reviewId }, data });
  }

  async findReviewById(id: string) {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: { select: { id: true, email: true, firstName: true, lastName: true, profileImage: true } },
        targetUser: { select: { id: true, email: true, firstName: true, lastName: true } },
        product: { select: { id: true, title: true, slug: true } },
        ratings: true,
        reactions: true,
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

  async findReviewsByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { targetUserId: userId, deletedAt: null, isVisible: true },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        ratings: true,
        reactions: true,
      },
    });
  }

  async findReviewsByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, deletedAt: null, isVisible: true },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        ratings: true,
        reactions: true,
      },
    });
  }

  async findAllReviews(filters?: { isVisible?: boolean }) {
    const where: Prisma.ReviewWhereInput = { deletedAt: null };
    if (filters?.isVisible !== undefined) where.isVisible = filters.isVisible;

    return this.prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { id: true, email: true } },
        targetUser: { select: { id: true, email: true } },
        product: { select: { id: true, title: true } },
        ratings: true,
      },
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
}
