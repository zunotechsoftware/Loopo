import { Test, TestingModule } from '@nestjs/testing';
import { InteractionsService } from './interactions.service';
import { PrismaService } from '../../../shared/database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InteractionsService Unit Tests', () => {
  let service: InteractionsService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      product: { findFirst: jest.fn(), update: jest.fn() },
      favorite: { create: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
      productStatistics: { upsert: jest.fn(), update: jest.fn() },
      wishlist: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), updateMany: jest.fn(), findMany: jest.fn() },
      wishlistItem: { create: jest.fn(), deleteMany: jest.fn() },
      recentlyViewed: { upsert: jest.fn(), findMany: jest.fn(), deleteMany: jest.fn() },
      $transaction: jest.fn((promises) => Promise.all(promises)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteractionsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<InteractionsService>(InteractionsService);
  });

  describe('Favorites Management', () => {
    it('should add to favorites and increment listing stats on success', async () => {
      prismaMock.product.findFirst.mockResolvedValue({ id: 'p-1', title: 'Car' });
      prismaMock.favorite.create.mockResolvedValue({ userId: 'u-1', productId: 'p-1' });

      const res = await service.addFavorite('u-1', 'p-1');

      expect(res.success).toBe(true);
      expect(prismaMock.favorite.create).toHaveBeenCalled();
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('should fail if product ID is not found', async () => {
      prismaMock.product.findFirst.mockResolvedValue(null);

      await expect(service.addFavorite('u-1', 'invalid-p')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Wishlist Management', () => {
    it('should throw BadRequestException if user attempts to delete the default wishlist', async () => {
      prismaMock.wishlist.findFirst.mockResolvedValue({ id: 'w-1', name: 'Default', isDefault: true });

      await expect(service.deleteWishlist('u-1', 'w-1')).rejects.toThrow(BadRequestException);
    });

    it('should add item to wishlist successfully', async () => {
      prismaMock.wishlist.findFirst.mockResolvedValue({ id: 'w-1', name: 'Dream Cars' });
      prismaMock.product.findFirst.mockResolvedValue({ id: 'p-1', title: 'BMW' });
      prismaMock.wishlistItem.create.mockResolvedValue({ wishlistId: 'w-1', productId: 'p-1' });

      const res = await service.addItemToWishlist('u-1', 'w-1', 'p-1');

      expect(res.success).toBe(true);
      expect(prismaMock.wishlistItem.create).toHaveBeenCalledWith({
        data: { wishlistId: 'w-1', productId: 'p-1' },
      });
    });
  });

  describe('Recently Viewed Tracking', () => {
    it('should delete older history entries if viewed list exceeds 20 elements limit', async () => {
      prismaMock.recentlyViewed.findMany.mockResolvedValue(
        Array(25).fill(null).map((_, i) => ({ id: `h-${i}`, productId: `p-${i}` }))
      );

      await service.recordRecentlyViewed('u-1', 'p-new');

      expect(prismaMock.recentlyViewed.upsert).toHaveBeenCalled();
      expect(prismaMock.recentlyViewed.deleteMany).toHaveBeenCalled(); // Capping triggered
    });
  });
});
