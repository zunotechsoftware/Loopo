import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReviewType } from '@prisma/client';

const REVIEW_EDIT_WINDOW_DAYS = 7;

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    @InjectQueue('rating-recalculation') private readonly ratingQueue: Queue,
    @InjectQueue('trust-score-calculation') private readonly trustQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    this.logger.log(`User ${userId} creating ${dto.reviewType} review`);

    // 1. Self-review prevention
    if (dto.targetUserId && dto.targetUserId === userId) {
      throw new BadRequestException('You cannot review yourself');
    }

    // 2. Duplicate prevention
    if (dto.productId) {
      const existing = await this.reviewsRepository.findReviewByUnique(
        userId, dto.productId, dto.reviewType as ReviewType,
      );
      if (existing) {
        throw new BadRequestException('You have already submitted a review for this product with this review type');
      }
    }

    // 3. Verify completed transaction if paymentId provided
    let isVerified = false;
    if (dto.paymentId) {
      const payment = await this.reviewsRepository.prisma.payment.findFirst({
        where: { id: dto.paymentId, userId, status: 'SUCCESS' },
      });
      if (payment) {
        isVerified = true;
      }
    }

    // 4. Create review
    const editableUntil = new Date();
    editableUntil.setDate(editableUntil.getDate() + REVIEW_EDIT_WINDOW_DAYS);

    const review = await this.reviewsRepository.createReview({
      reviewerId: userId,
      targetUserId: dto.targetUserId || null,
      productId: dto.productId || null,
      paymentId: dto.paymentId || null,
      reviewType: dto.reviewType as ReviewType,
      title: dto.title || null,
      content: dto.content,
      isVerified,
      editableUntil,
    });

    // 5. Create rating
    await this.reviewsRepository.createRating({
      reviewId: review.id,
      overall: dto.rating.overall,
      communication: dto.rating.communication ?? null,
      responseTime: dto.rating.responseTime ?? null,
      productAccuracy: dto.rating.productAccuracy ?? null,
      deliveryExperience: dto.rating.deliveryExperience ?? null,
      behaviour: dto.rating.behaviour ?? null,
      valueForMoney: dto.rating.valueForMoney ?? null,
      wouldRecommend: dto.rating.wouldRecommend ?? null,
    });

    // 6. Queue async recalculations
    if (dto.targetUserId) {
      await this.ratingQueue.add('recalculate-user', { userId: dto.targetUserId, reviewType: dto.reviewType });
      await this.trustQueue.add('recalculate-trust', { userId: dto.targetUserId });
    }
    if (dto.productId) {
      await this.ratingQueue.add('recalculate-product', { productId: dto.productId });
    }

    // 7. Notify target user
    if (dto.targetUserId) {
      await this.notificationQueue.add('push-notification', {
        userId: dto.targetUserId,
        title: 'New Review Received',
        body: `You received a ${dto.rating.overall}-star review.`,
      });
    }

    return this.reviewsRepository.findReviewById(review.id);
  }

  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    if (review.reviewerId !== userId) throw new ForbiddenException('You can only edit your own reviews');

    // Check edit window
    if (review.editableUntil && new Date() > review.editableUntil) {
      throw new BadRequestException('Review edit window has expired');
    }

    // Update review text
    const updated = await this.reviewsRepository.updateReview(reviewId, {
      title: dto.title ?? undefined,
      content: dto.content ?? undefined,
    });

    // Update rating if provided
    if (dto.rating) {
      await this.reviewsRepository.updateRating(reviewId, {
        overall: dto.rating.overall,
        communication: dto.rating.communication ?? undefined,
        responseTime: dto.rating.responseTime ?? undefined,
        productAccuracy: dto.rating.productAccuracy ?? undefined,
        deliveryExperience: dto.rating.deliveryExperience ?? undefined,
        behaviour: dto.rating.behaviour ?? undefined,
        valueForMoney: dto.rating.valueForMoney ?? undefined,
        wouldRecommend: dto.rating.wouldRecommend ?? undefined,
      });

      // Re-trigger recalculations
      if (review.targetUserId) {
        await this.ratingQueue.add('recalculate-user', { userId: review.targetUserId, reviewType: review.reviewType });
        await this.trustQueue.add('recalculate-trust', { userId: review.targetUserId });
      }
      if (review.productId) {
        await this.ratingQueue.add('recalculate-product', { productId: review.productId });
      }
    }

    return this.reviewsRepository.findReviewById(reviewId);
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    if (review.reviewerId !== userId) throw new ForbiddenException('You can only delete your own reviews');

    await this.reviewsRepository.softDeleteReview(reviewId);

    // Recalculate
    if (review.targetUserId) {
      await this.ratingQueue.add('recalculate-user', { userId: review.targetUserId, reviewType: review.reviewType });
      await this.trustQueue.add('recalculate-trust', { userId: review.targetUserId });
    }

    return { success: true };
  }

  async getReviewById(id: string) {
    const review = await this.reviewsRepository.findReviewById(id);
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async getUserReviews(userId: string) {
    return this.reviewsRepository.findReviewsByUser(userId);
  }

  async getProductReviews(productId: string) {
    return this.reviewsRepository.findReviewsByProduct(productId);
  }

  // --- Reactions ---
  async addReaction(userId: string, reviewId: string, type: string) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');

    return this.reviewsRepository.upsertReaction(reviewId, userId, type);
  }

  async removeReaction(userId: string, reviewId: string, type: string) {
    return this.reviewsRepository.deleteReaction(reviewId, userId, type);
  }

  // --- Admin ---
  async adminGetAllReviews() {
    return this.reviewsRepository.findAllReviews();
  }

  async adminHideReview(reviewId: string) {
    return this.reviewsRepository.updateReview(reviewId, { isVisible: false });
  }

  async adminRestoreReview(reviewId: string) {
    return this.reviewsRepository.restoreReview(reviewId);
  }

  async adminDeleteReview(reviewId: string) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');

    await this.reviewsRepository.softDeleteReview(reviewId);

    if (review.targetUserId) {
      await this.ratingQueue.add('recalculate-user', { userId: review.targetUserId, reviewType: review.reviewType });
    }

    return { success: true };
  }
}
