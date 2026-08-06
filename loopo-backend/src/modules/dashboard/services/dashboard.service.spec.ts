import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisAnalyticsStrategy } from '../../analytics/strategies/redis-analytics.strategy';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;
  let redisStrategy: RedisAnalyticsStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: {
            product: { findMany: jest.fn() },
            conversation: { findMany: jest.fn() },
            sellerStatistics: { findUnique: jest.fn() },
            userSubscription: { findUnique: jest.fn() },
            userBoost: { aggregate: jest.fn() },
            featuredProduct: { count: jest.fn() },
            boostedProduct: { count: jest.fn() },
            trustScore: { findUnique: jest.fn() },
          },
        },
        {
          provide: RedisAnalyticsStrategy,
          useValue: {
            getCachedDashboard: jest.fn(),
            setCachedDashboard: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
    redisStrategy = module.get<RedisAnalyticsStrategy>(RedisAnalyticsStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSellerDashboardSummary', () => {
    it('should return cached summary if available', async () => {
      const mockCached = { totalListings: 10 };
      (redisStrategy.getCachedDashboard as jest.Mock).mockResolvedValue(mockCached);

      const result = await service.getSellerDashboardSummary('user-id');
      expect(result).toEqual(mockCached);
      expect(prisma.product.findMany).not.toHaveBeenCalled();
    });

    it('should compute and return summary if not cached', async () => {
      (redisStrategy.getCachedDashboard as jest.Mock).mockResolvedValue(null);
      (prisma.product.findMany as jest.Mock).mockResolvedValue([
        { status: 'APPROVED', viewCount: 10, favoriteCount: 2, chatCount: 1 },
      ]);
      (prisma.conversation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.sellerStatistics.findUnique as jest.Mock).mockResolvedValue({ averageRating: 4.5 });
      (prisma.userSubscription.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.userBoost.aggregate as jest.Mock).mockResolvedValue({ _sum: { creditsGranted: 0, creditsUsed: 0 } });
      (prisma.featuredProduct.count as jest.Mock).mockResolvedValue(0);
      (prisma.boostedProduct.count as jest.Mock).mockResolvedValue(0);
      (prisma.trustScore.findUnique as jest.Mock).mockResolvedValue({ score: 80 });

      const result = await service.getSellerDashboardSummary('user-id');

      expect(result).toBeDefined();
      expect(result.totalListings).toBe(1);
      expect(result.activeListings).toBe(1);
      expect(result.totalViews).toBe(10);
      expect(result.sellerRating).toBe(4.5);
      expect(result.trustScore).toBe(80);
      expect(redisStrategy.setCachedDashboard).toHaveBeenCalledWith('user-id', expect.any(Object));
    });
  });
});
