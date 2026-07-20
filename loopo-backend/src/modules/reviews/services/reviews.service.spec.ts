import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { getQueueToken } from '@nestjs/bullmq';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReviewType } from '@prisma/client';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let repository: jest.Mocked<ReviewsRepository>;
  let ratingQueue: { add: jest.Mock };
  let trustQueue: { add: jest.Mock };
  let notificationQueue: { add: jest.Mock };

  const mockReview = {
    id: 'review-id-1',
    reviewerId: 'user-id-1',
    targetUserId: 'seller-id-1',
    productId: 'product-id-1',
    paymentId: null,
    reviewType: ReviewType.SELLER_REVIEW,
    title: 'Great seller',
    content: 'Very responsive and accurate.',
    isVerified: false,
    isVisible: true,
    editableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ratings: [{ overall: 5 }],
    reactions: [],
    reviewer: { id: 'user-id-1', email: 'buyer@test.com' },
    targetUser: { id: 'seller-id-1', email: 'seller@test.com' },
    product: null,
  };

  beforeEach(async () => {
    ratingQueue = { add: jest.fn().mockResolvedValue(undefined) };
    trustQueue = { add: jest.fn().mockResolvedValue(undefined) };
    notificationQueue = { add: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: ReviewsRepository,
          useValue: {
            findReviewByUnique: jest.fn(),
            createReview: jest.fn(),
            createRating: jest.fn(),
            updateRating: jest.fn(),
            findReviewById: jest.fn(),
            updateReview: jest.fn(),
            softDeleteReview: jest.fn(),
            restoreReview: jest.fn(),
            findReviewsByUser: jest.fn(),
            findReviewsByProduct: jest.fn(),
            findAllReviews: jest.fn(),
            upsertReaction: jest.fn(),
            deleteReaction: jest.fn(),
            prisma: {
              payment: { findFirst: jest.fn() },
            },
          },
        },
        { provide: getQueueToken('rating-recalculation'), useValue: ratingQueue },
        { provide: getQueueToken('trust-score-calculation'), useValue: trustQueue },
        { provide: getQueueToken('notification'), useValue: notificationQueue },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    repository = module.get(ReviewsRepository);
  });

  describe('createReview', () => {
    it('should throw if reviewer is the same as target user (self-review)', async () => {
      await expect(
        service.createReview('user-id-1', {
          reviewType: 'SELLER_REVIEW' as any,
          targetUserId: 'user-id-1',
          content: 'Great!',
          rating: { overall: 5 },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if duplicate review exists', async () => {
      (repository.findReviewByUnique as jest.Mock).mockResolvedValue(mockReview);
      await expect(
        service.createReview('user-id-1', {
          reviewType: 'SELLER_REVIEW' as any,
          targetUserId: 'seller-id-1',
          productId: 'product-id-1',
          content: 'Great!',
          rating: { overall: 5 },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a review and queue recalculations', async () => {
      (repository.findReviewByUnique as jest.Mock).mockResolvedValue(null);
      (repository.prisma.payment.findFirst as jest.Mock).mockResolvedValue(null);
      (repository.createReview as jest.Mock).mockResolvedValue({ id: 'review-id-1' });
      (repository.createRating as jest.Mock).mockResolvedValue({});
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);

      const result = await service.createReview('user-id-1', {
        reviewType: 'SELLER_REVIEW' as any,
        targetUserId: 'seller-id-1',
        productId: 'product-id-1',
        content: 'Great seller!',
        rating: { overall: 5 },
      });

      expect(repository.createReview).toHaveBeenCalled();
      expect(repository.createRating).toHaveBeenCalled();
      expect(ratingQueue.add).toHaveBeenCalledWith('recalculate-user', expect.objectContaining({ userId: 'seller-id-1' }));
      expect(trustQueue.add).toHaveBeenCalledWith('recalculate-trust', { userId: 'seller-id-1' });
      expect(notificationQueue.add).toHaveBeenCalled();
      expect(result).toEqual(mockReview);
    });
  });

  describe('updateReview', () => {
    it('should throw if review not found', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(null);
      await expect(service.updateReview('user-id-1', 'review-id-1', { content: 'Updated' }))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw if user is not the reviewer', async () => {
      (repository.findReviewById as jest.Mock).mockResolvedValue(mockReview);
      await expect(service.updateReview('other-user', 'review-id-1', { content: 'Updated' }))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw if edit window has expired', async () => {
      const expiredReview = { ...mockReview, editableUntil: new Date(Date.now() - 1000) };
      (repository.findReviewById as jest.Mock).mockResolvedValue(expiredReview);
      await expect(service.updateReview('user-id-1', 'review-id-1', { content: 'Updated' }))
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

      const result = await service.addReaction('user-id-2', 'review-id-1', 'HELPFUL');
      expect(repository.upsertReaction).toHaveBeenCalledWith('review-id-1', 'user-id-2', 'HELPFUL');
    });
  });
});
