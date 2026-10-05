import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { UserNotificationsService } from '../../user-notifications/services/user-notifications.service';
import { ReportsService } from '../../reports/services/reports.service';
import { S3Service } from '../../../shared/services/s3.service';
import { getQueueToken } from '@nestjs/bullmq';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReviewType, RatingEligibilityStatus } from '@prisma/client';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let repository: jest.Mocked<ReviewsRepository>;
  let userNotifications: { notifyUser: jest.Mock };
  let reportsService: { createReport: jest.Mock };
  let s3Service: { generatePresignedUploadUrl: jest.Mock };
  let ratingQueue: { add: jest.Mock };
  let trustQueue: { add: jest.Mock };

  const mockReview = {
    id: 'review-id-1',
    reviewerId: 'user-id-1',
    targetUserId: 'seller-id-1',
    productId: 'product-id-1',
    paymentId: null,
    eligibilityId: 'eligibility-id-1',
    reviewType: ReviewType.SELLER_REVIEW,
    title: 'Great seller',
    content: 'Very responsive and accurate.',
    isVerified: true,
    isVisible: true,
    editableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ratings: [{ overall: 5 }],
    reactions: [],
    tags: [],
    photos: [],
    response: null,
    reviewer: { id: 'user-id-1', firstName: 'Buyer', lastName: 'One' },
    targetUser: { id: 'seller-id-1', email: 'seller@test.com' },
    product: null,
  };

  const mockEligibility = {
    id: 'eligibility-id-1',
    buyerId: 'user-id-1',
    sellerId: 'seller-id-1',
    productId: 'product-id-1',
    orderId: 'order-id-1',
    status: RatingEligibilityStatus.PENDING,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };

  beforeEach(async () => {
    ratingQueue = { add: jest.fn().mockResolvedValue(undefined) };
    trustQueue = { add: jest.fn().mockResolvedValue(undefined) };
    userNotifications = { notifyUser: jest.fn().mockResolvedValue(undefined) };
    reportsService = { createReport: jest.fn().mockResolvedValue({ id: 'report-id-1' }) };
    s3Service = { generatePresignedUploadUrl: jest.fn().mockResolvedValue({ uploadUrl: 'url', fileKey: 'key', fileUrl: 'file-url' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: ReviewsRepository,
          useValue: {
            findReviewByUnique: jest.fn(),
            createReviewWithDetails: jest.fn(),
            updateRating: jest.fn(),
            findReviewById: jest.fn(),
            updateReview: jest.fn(),
            softDeleteReview: jest.fn(),
            restoreReview: jest.fn(),
            findSellerReviewsPaginated: jest.fn(),
            getRatingDistribution: jest.fn(),
            findReviewsByProduct: jest.fn(),
            findAllReviews: jest.fn(),
            getReportsForReview: jest.fn(),
            upsertReaction: jest.fn(),
            deleteReaction: jest.fn(),
            findActiveTags: jest.fn(),
            findTagsByIds: jest.fn().mockResolvedValue([]),
            createResponse: jest.fn(),
            updateResponse: jest.fn(),
            findResponseByReviewId: jest.fn(),
            findEligibilityById: jest.fn(),
            findPendingEligibilitiesForBuyer: jest.fn(),
            expireStaleEligibilities: jest.fn(),
            prisma: {
              payment: { findFirst: jest.fn() },
            },
          },
        },
        { provide: getQueueToken('rating-recalculation'), useValue: ratingQueue },
        { provide: getQueueToken('trust-score-calculation'), useValue: trustQueue },
        { provide: UserNotificationsService, useValue: userNotifications },
        { provide: ReportsService, useValue: reportsService },
        { provide: S3Service, useValue: s3Service },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    repository = module.get(ReviewsRepository);
  });

  describe('createReview - eligibility gating (SELLER_REVIEW)', () => {
    it('should throw if no eligibilityId is provided', async () => {
      await expect(
        service.createReview('user-id-1', {
          reviewType: 'SELLER_REVIEW' as any,
          content: 'Great!',
          rating: { overall: 5 },
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if the eligibility does not exist', async () => {
      (repository.findEligibilityById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createReview('user-id-1', {
          reviewType: 'SELLER_REVIEW' as any,
          eligibilityId: 'eligibility-id-1',
          rating: { overall: 5 },
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if the eligibility belongs to a different buyer (IDOR)', async () => {
      (repository.findEligibilityById as jest.Mock).mockResolvedValue({ ...mockEligibility, buyerId: 'someone-else' });
      await expect(
        service.createReview('user-id-1', {
          reviewType: 'SELLER_REVIEW' as any,
          eligibilityId: 'eligibility-id-1',
          rating: { overall: 5 },
        } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw if the eligibility has already been completed (duplicate)', async () => {
      (repository.findEligibilityById as jest.Mock).mockResolvedValue({
        ...mockEligibility,
        status: RatingEligibilityStatus.COMPLETED,
      });
      await expect(
        service.createReview('user-id-1', {
          reviewType: 'SELLER_REVIEW' as any,
          eligibilityId: 'eligibility-id-1',
          rating: { overall: 5 },
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if the eligibility has expired', async () => {
      (repository.findEligibilityById as jest.Mock).mockResolvedValue({
        ...mockEligibility,
        status: RatingEligibilityStatus.EXPIRED,
      });
      await expect(
        service.createReview('user-id-1', {
          reviewType: 'SELLER_REVIEW' as any,
          eligibilityId: 'eligibility-id-1',
          rating: { overall: 5 },
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject a client-supplied targetUserId/isVerified - these are derived from the eligibility, never trusted from the body', async () => {
      (repository.findEligibilityById as jest.Mock).mockResolvedValue(mockEligibility);
      (repository.findReviewByUnique as jest.Mock).mockResolvedValue(null);
      (repository.createReviewWithDetails as jest.Mock).mockResolvedValue(mockReview);
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);

      await service.createReview('user-id-1', {
        reviewType: 'SELLER_REVIEW' as any,
        eligibilityId: 'eligibility-id-1',
        targetUserId: 'a-completely-different-user', // attacker-supplied, must be ignored
        rating: { overall: 5 },
      } as any);

      const callArg = (repository.createReviewWithDetails as jest.Mock).mock.calls[0][0];
      expect(callArg.review.targetUserId).toBe(mockEligibility.sellerId);
      expect(callArg.review.productId).toBe(mockEligibility.productId);
      expect(callArg.review.isVerified).toBe(true);
    });

    it('should create a verified review and trigger recalculation + notification', async () => {
      (repository.findEligibilityById as jest.Mock).mockResolvedValue(mockEligibility);
      (repository.findReviewByUnique as jest.Mock).mockResolvedValue(null);
      (repository.createReviewWithDetails as jest.Mock).mockResolvedValue(mockReview);
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);

      const result = await service.createReview('user-id-1', {
        reviewType: 'SELLER_REVIEW' as any,
        eligibilityId: 'eligibility-id-1',
        content: 'Great seller!',
        rating: { overall: 5 },
      } as any);

      expect(repository.createReviewWithDetails).toHaveBeenCalled();
      expect(ratingQueue.add).toHaveBeenCalledWith('recalculate-user', expect.objectContaining({ userId: 'seller-id-1' }));
      expect(trustQueue.add).toHaveBeenCalledWith('recalculate-trust', { userId: 'seller-id-1' });
      expect(userNotifications.notifyUser).toHaveBeenCalledWith('seller-id-1', expect.any(Object));
      expect(result).toEqual(mockReview);
    });

    it('should translate a unique-constraint race (concurrent duplicate submission) into a friendly error', async () => {
      (repository.findEligibilityById as jest.Mock).mockResolvedValue(mockEligibility);
      (repository.findReviewByUnique as jest.Mock).mockResolvedValue(null);
      (repository.createReviewWithDetails as jest.Mock).mockRejectedValue({ code: 'P2002' });

      await expect(
        service.createReview('user-id-1', {
          reviewType: 'SELLER_REVIEW' as any,
          eligibilityId: 'eligibility-id-1',
          rating: { overall: 5 },
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createReview - self-rating prevention', () => {
    it('should throw if the eligibility seller somehow equals the buyer', async () => {
      (repository.findEligibilityById as jest.Mock).mockResolvedValue({
        ...mockEligibility,
        sellerId: 'user-id-1',
      });
      await expect(
        service.createReview('user-id-1', {
          reviewType: 'SELLER_REVIEW' as any,
          eligibilityId: 'eligibility-id-1',
          rating: { overall: 5 },
        } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw for non-eligibility review types if reviewer targets themselves', async () => {
      await expect(
        service.createReview('user-id-1', {
          reviewType: 'PRODUCT_REVIEW' as any,
          targetUserId: 'user-id-1',
          productId: 'product-id-1',
          rating: { overall: 5 },
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createReview - duplicate prevention (non-eligibility path)', () => {
    it('should throw if a review already exists for (reviewer, product, reviewType)', async () => {
      (repository.findReviewByUnique as jest.Mock).mockResolvedValue(mockReview);
      await expect(
        service.createReview('user-id-1', {
          reviewType: 'PRODUCT_REVIEW' as any,
          targetUserId: 'seller-id-1',
          productId: 'product-id-1',
          rating: { overall: 5 },
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateReview', () => {
    it('should throw if review not found', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(null);
      await expect(service.updateReview('user-id-1', 'review-id-1', { content: 'Updated' } as any))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw if user is not the reviewer', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);
      await expect(service.updateReview('other-user', 'review-id-1', { content: 'Updated' } as any))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw if edit window has expired', async () => {
      const expiredReview = { ...mockReview, editableUntil: new Date(Date.now() - 1000) };
      (repository.findReviewById as jest.Mock).mockResolvedValue(expiredReview);
      await expect(service.updateReview('user-id-1', 'review-id-1', { content: 'Updated' } as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteReview', () => {
    it('should soft delete and queue recalculation', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);
      (repository.softDeleteReview as jest.Mock).mockResolvedValue(undefined);

      const result = await service.deleteReview('user-id-1', 'review-id-1');
      expect(repository.softDeleteReview).toHaveBeenCalledWith('review-id-1');
      expect(ratingQueue.add).toHaveBeenCalledWith('recalculate-user', expect.objectContaining({ userId: 'seller-id-1' }));
      expect(result).toEqual({ success: true });
    });
  });

  describe('addReaction', () => {
    it('should add reaction to review', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);
      (repository.upsertReaction as jest.Mock).mockResolvedValue({ id: 'reaction-1' });

      await service.addReaction('user-id-2', 'review-id-1', 'HELPFUL');
      expect(repository.upsertReaction).toHaveBeenCalledWith('review-id-1', 'user-id-2', 'HELPFUL');
    });
  });

  describe('reportReview', () => {
    it('should throw if the review does not exist', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.reportReview('user-id-2', 'review-id-1', { reasonCode: 'FAKE_REVIEW', details: 'Looks fake' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delegate to the real ReportsService with targetType REVIEW', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);
      await service.reportReview('user-id-2', 'review-id-1', { reasonCode: 'FAKE_REVIEW', details: 'Looks fake' });

      expect(reportsService.createReport).toHaveBeenCalledWith('user-id-2', expect.objectContaining({
        targetType: 'REVIEW',
        targetId: 'review-id-1',
        reasonCode: 'FAKE_REVIEW',
      }));
    });
  });

  describe('respondToReview - seller-only authorization', () => {
    it('should throw if the responder is not the reviewed seller', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);
      await expect(
        service.respondToReview('not-the-seller', 'review-id-1', { content: 'Thanks!' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow the reviewed seller to respond once', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);
      (repository.findResponseByReviewId as jest.Mock).mockResolvedValue(null);
      (repository.createResponse as jest.Mock).mockResolvedValue({ id: 'response-1', content: 'Thanks!' });

      await service.respondToReview('seller-id-1', 'review-id-1', { content: 'Thanks!' });
      expect(repository.createResponse).toHaveBeenCalledWith('review-id-1', 'seller-id-1', 'Thanks!');
      expect(userNotifications.notifyUser).toHaveBeenCalledWith('user-id-1', expect.any(Object));
    });

    it('should reject a second response (must use update instead)', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);
      (repository.findResponseByReviewId as jest.Mock).mockResolvedValue({ id: 'response-1', sellerId: 'seller-id-1' });

      await expect(
        service.respondToReview('seller-id-1', 'review-id-1', { content: 'Again!' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('admin moderation - reputation impact', () => {
    it('adminHideReview should hide the review and trigger recalculation', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);
      (repository.updateReview as jest.Mock).mockResolvedValue({ ...mockReview, isVisible: false });

      await service.adminHideReview('review-id-1');
      expect(repository.updateReview).toHaveBeenCalledWith('review-id-1', { isVisible: false });
      expect(ratingQueue.add).toHaveBeenCalledWith('recalculate-user', expect.objectContaining({ userId: 'seller-id-1' }));
    });

    it('adminRestoreReview should restore the review and trigger recalculation', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);
      (repository.restoreReview as jest.Mock).mockResolvedValue({ ...mockReview, isVisible: true });

      await service.adminRestoreReview('review-id-1');
      expect(repository.restoreReview).toHaveBeenCalledWith('review-id-1');
      expect(ratingQueue.add).toHaveBeenCalledWith('recalculate-user', expect.objectContaining({ userId: 'seller-id-1' }));
    });
  });

  describe('getPendingRatingById', () => {
    it('should not leak an eligibility that belongs to a different buyer', async () => {
      (repository.findEligibilityById as jest.Mock).mockResolvedValue(mockEligibility);
      await expect(service.getPendingRatingById('someone-else', 'eligibility-id-1')).rejects.toThrow(NotFoundException);
    });

    it('should return the eligibility when it belongs to the requesting buyer', async () => {
      (repository.findEligibilityById as jest.Mock).mockResolvedValue(mockEligibility);
      const result = await service.getPendingRatingById('user-id-1', 'eligibility-id-1');
      expect(result).toEqual(mockEligibility);
    });
  });
});
