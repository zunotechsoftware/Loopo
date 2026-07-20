import { Injectable, Logger } from '@nestjs/common';
import { ReputationRepository } from '../repositories/reputation.repository';
import { ReviewsRepository } from '../../reviews/repositories/reviews.repository';
import { RedisService } from '../../../shared/redis/redis.service';
import { ReviewType } from '@prisma/client';

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  constructor(
    private readonly reputationRepository: ReputationRepository,
    private readonly reviewsRepository: ReviewsRepository,
    private readonly redisService: RedisService,
  ) {}

  async recalculateUserStats(userId: string, reviewType: string) {
    this.logger.log(`Recalculating stats for user ${userId}, type ${reviewType}`);

    if (reviewType === 'SELLER_REVIEW' || reviewType === 'PRODUCT_REVIEW' || reviewType === 'TRANSACTION_REVIEW') {
      await this.recalculateSellerStats(userId);
    }
    if (reviewType === 'BUYER_REVIEW') {
      await this.recalculateBuyerStats(userId);
    }

    await this.recalculateReputationScore(userId);
  }

  async recalculateSellerStats(userId: string) {
    const reviews = await this.reviewsRepository.getReviewRatingsForUser(userId, ReviewType.SELLER_REVIEW);
    const productReviews = await this.reviewsRepository.getReviewRatingsForUser(userId, ReviewType.PRODUCT_REVIEW);
    const allReviews = [...reviews, ...productReviews];

    if (allReviews.length === 0) {
      await this.reputationRepository.upsertSellerStats(userId, {
        averageRating: 0, totalReviews: 0, positivePercent: 0, negativePercent: 0, recentTrend: 0,
      });
      await this.redisService.del(`reputation:seller:${userId}`);
      return;
    }

    const ratings = allReviews.map((r) => r.ratings[0]?.overall || 0).filter((r) => r > 0);
    const total = ratings.length;
    const avg = ratings.reduce((sum, r) => sum + r, 0) / total;
    const positive = ratings.filter((r) => r >= 4).length;
    const negative = ratings.filter((r) => r <= 2).length;

    // Recent trend: last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReviews = allReviews.filter((r) => r.createdAt >= thirtyDaysAgo);
    const recentRatings = recentReviews.map((r) => r.ratings[0]?.overall || 0).filter((r) => r > 0);
    const recentTrend = recentRatings.length > 0
      ? recentRatings.reduce((sum, r) => sum + r, 0) / recentRatings.length
      : avg;

    const stats = {
      averageRating: Math.round(avg * 100) / 100,
      totalReviews: total,
      positivePercent: Math.round((positive / total) * 10000) / 100,
      negativePercent: Math.round((negative / total) * 10000) / 100,
      recentTrend: Math.round(recentTrend * 100) / 100,
    };

    await this.reputationRepository.upsertSellerStats(userId, stats);
    await this.redisService.set(`reputation:seller:${userId}`, JSON.stringify(stats), 900);
  }

  async recalculateBuyerStats(userId: string) {
    const reviews = await this.reviewsRepository.getReviewRatingsForUser(userId, ReviewType.BUYER_REVIEW);

    if (reviews.length === 0) {
      await this.reputationRepository.upsertBuyerStats(userId, {
        averageRating: 0, totalReviews: 0, positivePercent: 0, negativePercent: 0,
      });
      await this.redisService.del(`reputation:buyer:${userId}`);
      return;
    }

    const ratings = reviews.map((r) => r.ratings[0]?.overall || 0).filter((r) => r > 0);
    const total = ratings.length;
    const avg = ratings.reduce((sum, r) => sum + r, 0) / total;
    const positive = ratings.filter((r) => r >= 4).length;
    const negative = ratings.filter((r) => r <= 2).length;

    const stats = {
      averageRating: Math.round(avg * 100) / 100,
      totalReviews: total,
      positivePercent: Math.round((positive / total) * 10000) / 100,
      negativePercent: Math.round((negative / total) * 10000) / 100,
    };

    await this.reputationRepository.upsertBuyerStats(userId, stats);
    await this.redisService.set(`reputation:buyer:${userId}`, JSON.stringify(stats), 900);
  }

  async recalculateReputationScore(userId: string) {
    const sellerStats = await this.reputationRepository.getSellerStats(userId);
    const buyerStats = await this.reputationRepository.getBuyerStats(userId);

    const sellerScore = sellerStats ? (sellerStats.averageRating / 5) * 100 : 0;
    const buyerScore = buyerStats ? (buyerStats.averageRating / 5) * 100 : 0;
    const overallScore = sellerScore > 0 && buyerScore > 0
      ? (sellerScore * 0.7 + buyerScore * 0.3)
      : sellerScore > 0 ? sellerScore : buyerScore;

    const kycDocs = await this.reputationRepository.prisma.kycDocument.findMany({
      where: { userId, status: 'APPROVED' },
    });
    const kycVerified = kycDocs.length > 0;
    const verifiedBadge = overallScore >= 75 && kycVerified;

    await this.reputationRepository.upsertReputationScore(userId, {
      sellerScore: Math.round(sellerScore * 100) / 100,
      buyerScore: Math.round(buyerScore * 100) / 100,
      overallScore: Math.round(overallScore * 100) / 100,
      verifiedBadge,
    });
  }

  async getUserRating(userId: string) {
    // Try cache first
    const cached = await this.redisService.get(`reputation:seller:${userId}`);
    if (cached) {
      const sellerStats = JSON.parse(cached);
      const reputation = await this.reputationRepository.getReputationScore(userId);
      const trust = await this.reputationRepository.getTrustScore(userId);
      return { sellerStats, reputation, trust };
    }

    const sellerStats = await this.reputationRepository.getSellerStats(userId);
    const buyerStats = await this.reputationRepository.getBuyerStats(userId);
    const reputation = await this.reputationRepository.getReputationScore(userId);
    const trust = await this.reputationRepository.getTrustScore(userId);

    return { sellerStats, buyerStats, reputation, trust };
  }

  async getProductRating(productId: string) {
    const cached = await this.redisService.get(`reputation:product:${productId}`);
    if (cached) return JSON.parse(cached);

    const reviews = await this.reviewsRepository.getReviewRatingsForProduct(productId);
    const ratings = reviews.map((r) => r.ratings[0]?.overall || 0).filter((r) => r > 0);

    if (ratings.length === 0) return { averageRating: 0, totalReviews: 0 };

    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const result = {
      averageRating: Math.round(avg * 100) / 100,
      totalReviews: ratings.length,
    };

    await this.redisService.set(`reputation:product:${productId}`, JSON.stringify(result), 600);
    return result;
  }
}
