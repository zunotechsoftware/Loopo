import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { RespondReviewDto } from '../dto/respond-review.dto';
import { ReportReviewDto } from '../dto/report-review.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReviewType, RatingEligibilityStatus } from '@prisma/client';
import { UserNotificationsService } from '../../user-notifications/services/user-notifications.service';
import { ReportsService } from '../../reports/services/reports.service';
import { S3Service } from '../../../shared/services/s3.service';

const REVIEW_EDIT_WINDOW_DAYS = 7;

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    @InjectQueue('rating-recalculation') private readonly ratingQueue: Queue,
    @InjectQueue('trust-score-calculation') private readonly trustQueue: Queue,
    private readonly userNotifications: UserNotificationsService,
    private readonly reportsService: ReportsService,
    private readonly s3Service: S3Service,
  ) {}

  private async triggerRecalculation(targetUserId: string | null, reviewType: ReviewType, productId?: string | null) {
    if (targetUserId) {
      await this.ratingQueue.add('recalculate-user', { userId: targetUserId, reviewType });
      await this.trustQueue.add('recalculate-trust', { userId: targetUserId });
    }
    if (productId) {
      await this.ratingQueue.add('recalculate-product', { productId });
    }
  }

  async createReview(userId: string, dto: CreateReviewDto) {
    this.logger.log(`User ${userId} creating ${dto.reviewType} review`);

    // Whitespace-only content ("   ") is treated the same as no content at
    // all - optional, but never stored as a meaningless string.
    const trimmedContent = dto.content?.trim();

    let targetUserId = dto.targetUserId || null;
    let productId = dto.productId || null;
    let eligibilityId: string | null = null;
    let isVerified = false;

    if (dto.reviewType === ReviewType.SELLER_REVIEW) {
      // The entire point of this feature: a buyer cannot rate a seller by
      // just supplying a targetUserId - eligibility must come from a real,
      // server-created RatingEligibility row (see ProductsService.
      // markSoldWithBuyer), and every field below is resolved from THAT
      // database record, never trusted from the request body.
      if (!dto.eligibilityId) {
        throw new BadRequestException('A seller review requires a valid rating eligibility (eligibilityId).');
      }
      const eligibility = await this.reviewsRepository.findEligibilityById(dto.eligibilityId);
      if (!eligibility) {
        throw new NotFoundException('Rating eligibility not found');
      }
      if (eligibility.buyerId !== userId) {
        throw new ForbiddenException('This rating invitation does not belong to you');
      }
      if (eligibility.status === RatingEligibilityStatus.COMPLETED) {
        throw new BadRequestException('You have already submitted a rating for this transaction');
      }
      if (eligibility.status === RatingEligibilityStatus.CANCELLED) {
        throw new BadRequestException('This rating invitation is no longer valid');
      }
      if (eligibility.status === RatingEligibilityStatus.EXPIRED || eligibility.expiresAt < new Date()) {
        throw new BadRequestException('This rating invitation has expired');
      }

      targetUserId = eligibility.sellerId;
      productId = eligibility.productId;
      eligibilityId = eligibility.id;
      isVerified = true;
    } else {
      // Pre-existing behaviour for other review types, unchanged.
      if (dto.targetUserId && dto.targetUserId === userId) {
        throw new BadRequestException('You cannot review yourself');
      }
      if (dto.paymentId) {
        const payment = await this.reviewsRepository.prisma.payment.findFirst({
          where: { id: dto.paymentId, userId, status: 'SUCCESS' },
        });
        if (payment) isVerified = true;
      }
    }

    if (targetUserId === userId) {
      throw new ForbiddenException('You cannot review yourself');
    }

    // Duplicate prevention (pre-existing constraint, still applies
    // regardless of path): one review per (reviewer, product, reviewType).
    if (productId) {
      const existing = await this.reviewsRepository.findReviewByUnique(userId, productId, dto.reviewType);
      if (existing) {
        throw new BadRequestException('You have already submitted a review for this product with this review type');
      }
    }

    // Tags: validated against real, active ReviewTag rows - a client can't
    // invent a tag id or attach an inactive/retired one.
    let validTagIds: string[] = [];
    if (dto.tagIds && dto.tagIds.length > 0) {
      const tags = await this.reviewsRepository.findTagsByIds(dto.tagIds);
      validTagIds = tags.map((t) => t.id);
    }

    const editableUntil = new Date();
    editableUntil.setDate(editableUntil.getDate() + REVIEW_EDIT_WINDOW_DAYS);

    let review;
    try {
      review = await this.reviewsRepository.createReviewWithDetails({
        review: {
          reviewerId: userId,
          targetUserId,
          productId,
          paymentId: dto.paymentId || null,
          eligibilityId,
          reviewType: dto.reviewType as ReviewType,
          title: dto.title || null,
          content: trimmedContent || null,
          isVerified,
          editableUntil,
        },
        rating: {
          overall: dto.rating.overall,
          communication: dto.rating.communication ?? null,
          responseTime: dto.rating.responseTime ?? null,
          productAccuracy: dto.rating.productAccuracy ?? null,
          deliveryExperience: dto.rating.deliveryExperience ?? null,
          behaviour: dto.rating.behaviour ?? null,
          valueForMoney: dto.rating.valueForMoney ?? null,
          wouldRecommend: dto.rating.wouldRecommend ?? null,
        },
        tagIds: validTagIds,
        photos: dto.photos,
      });
    } catch (err: any) {
      // Unique constraint on reviews.eligibilityId - two concurrent submit
      // requests for the same pending rating can both pass the status
      // check above, but only one can ever win this insert.
      if (err?.code === 'P2002') {
        throw new BadRequestException('This transaction has already been rated');
      }
      throw err;
    }

    await this.triggerRecalculation(targetUserId, dto.reviewType, productId);

    if (targetUserId) {
      const reviewerName = `${review.reviewer?.firstName || ''} ${review.reviewer?.lastName || ''}`.trim() || 'A buyer';
      await this.userNotifications.notifyUser(targetUserId, {
        type: 'NEW_REVIEW_RECEIVED',
        title: 'You received a new review',
        message: `${reviewerName} left you a ${dto.rating.overall}-star review.`,
        link: `/seller/${targetUserId}/reviews`,
        metadata: { reviewId: review.id },
      });
    }

    return this.reviewsRepository.findReviewById(review.id);
  }

  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    if (review.reviewerId !== userId) throw new ForbiddenException('You can only edit your own reviews');

    if (review.editableUntil && new Date() > review.editableUntil) {
      throw new BadRequestException('Review edit window has expired');
    }

    await this.reviewsRepository.updateReview(reviewId, {
      title: dto.title ?? undefined,
      content: dto.content !== undefined ? (dto.content?.trim() || null) : undefined,
    });

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
      await this.triggerRecalculation(review.targetUserId, review.reviewType, review.productId);
    }

    return this.reviewsRepository.findReviewById(reviewId);
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    if (review.reviewerId !== userId) throw new ForbiddenException('You can only delete your own reviews');

    await this.reviewsRepository.softDeleteReview(reviewId);
    await this.triggerRecalculation(review.targetUserId, review.reviewType, review.productId);

    return { success: true };
  }

  async getReviewById(id: string) {
    const review = await this.reviewsRepository.findReviewById(id);
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  /** Dedicated seller Reviews page: paginated + filterable by star/positive.
   * Server-side filtering/pagination throughout - never loads the full set
   * into the browser to filter client-side. */
  async getSellerReviews(sellerId: string, params: { page?: number; limit?: number; star?: number; positiveOnly?: boolean }) {
    return this.reviewsRepository.findSellerReviewsPaginated({ sellerId, ...params });
  }

  async getRatingDistribution(sellerId: string) {
    return this.reviewsRepository.getRatingDistribution(sellerId);
  }

  async getProductReviews(productId: string) {
    return this.reviewsRepository.findReviewsByProduct(productId);
  }

  async getReviewTags() {
    return this.reviewsRepository.findActiveTags();
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

  // --- Report a review (reuses the real complaint/report infrastructure -
  // this used to just call addReaction(userId, id, 'REPORT'), silently
  // discarding the reason and never creating a real Report row at all). ---
  async reportReview(userId: string, reviewId: string, dto: ReportReviewDto) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');

    return this.reportsService.createReport(userId, {
      targetType: 'REVIEW' as any,
      targetId: reviewId,
      reasonCode: dto.reasonCode,
      customReason: dto.customReason,
      details: dto.details,
    });
  }

  // --- Seller Responses ---
  async respondToReview(sellerId: string, reviewId: string, dto: RespondReviewDto) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    // The server derives "is this really the reviewed seller" from the
    // review's own targetUserId - a buyer (or any other seller) can never
    // respond as someone else by just calling this with a different id,
    // since there's no sellerId taken from the request body at all.
    if (review.targetUserId !== sellerId) {
      throw new ForbiddenException('Only the seller being reviewed can respond to this review');
    }

    const existing = await this.reviewsRepository.findResponseByReviewId(reviewId);
    if (existing) {
      throw new BadRequestException('You have already responded to this review. Use the update endpoint to edit it.');
    }

    const response = await this.reviewsRepository.createResponse(reviewId, sellerId, dto.content);

    await this.userNotifications.notifyUser(review.reviewerId, {
      type: 'SELLER_RESPONDED_TO_REVIEW',
      title: 'Seller responded to your review',
      message: 'The seller you reviewed has posted a response.',
      link: `/seller/${sellerId}/reviews`,
      metadata: { reviewId },
    });

    return response;
  }

  async updateResponse(sellerId: string, reviewId: string, dto: RespondReviewDto) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    if (review.targetUserId !== sellerId) {
      throw new ForbiddenException('Only the seller being reviewed can edit a response to this review');
    }

    const existing = await this.reviewsRepository.findResponseByReviewId(reviewId);
    if (!existing) throw new NotFoundException('No response exists yet for this review');
    if (existing.sellerId !== sellerId) {
      throw new ForbiddenException('You can only edit your own response');
    }

    return this.reviewsRepository.updateResponse(reviewId, dto.content);
  }

  // --- Review photo uploads (reuses the existing S3 presigned-upload
  // infrastructure, same pattern as KYC/listing images) ---
  async generatePhotoUploadUrl(userId: string, fileName: string, fileType: string) {
    return this.s3Service.generatePresignedUploadUrl(userId, fileName, 'review_photos', fileType);
  }

  // --- Admin ---
  async adminGetAllReviews(params: {
    skip?: number;
    take?: number;
    reviewType?: ReviewType;
    isVisible?: boolean;
    search?: string;
    reportedOnly?: boolean;
  }) {
    return this.reviewsRepository.findAllReviews(params);
  }

  async adminGetReviewById(reviewId: string) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    const reports = await this.reviewsRepository.getReportsForReview(reviewId);
    return { ...review, reports };
  }

  async adminHideReview(reviewId: string) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    const updated = await this.reviewsRepository.updateReview(reviewId, { isVisible: false });
    // Previously missing entirely: a hidden review kept counting toward the
    // seller's rating until something else happened to trigger a
    // recalculation (e.g. a new review coming in) - moderation had no
    // immediate effect on reputation at all.
    await this.triggerRecalculation(review.targetUserId, review.reviewType, review.productId);
    return updated;
  }

  async adminRestoreReview(reviewId: string) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    const updated = await this.reviewsRepository.restoreReview(reviewId);
    await this.triggerRecalculation(review.targetUserId, review.reviewType, review.productId);
    return updated;
  }

  async adminDeleteReview(reviewId: string) {
    const review = await this.reviewsRepository.findReviewById(reviewId);
    if (!review) throw new NotFoundException('Review not found');

    await this.reviewsRepository.softDeleteReview(reviewId);
    await this.triggerRecalculation(review.targetUserId, review.reviewType, review.productId);

    return { success: true };
  }

  // --- Pending ratings (buyer-facing) ---
  async getMyPendingRatings(buyerId: string) {
    return this.reviewsRepository.findPendingEligibilitiesForBuyer(buyerId);
  }

  async getPendingRatingById(buyerId: string, id: string) {
    const eligibility = await this.reviewsRepository.findEligibilityById(id);
    if (!eligibility) throw new NotFoundException('Rating invitation not found');
    if (eligibility.buyerId !== buyerId) {
      // Don't leak whether this id exists for a different buyer at all.
      throw new NotFoundException('Rating invitation not found');
    }
    return eligibility;
  }

  // --- Expiry (invoked by RatingEligibilityScheduler) ---
  async expireStaleEligibilities() {
    return this.reviewsRepository.expireStaleEligibilities();
  }
}
