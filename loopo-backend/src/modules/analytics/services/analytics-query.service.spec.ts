import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsQueryService } from './analytics-query.service';
import { PrismaService } from '../../../shared/database/prisma.service';
import { AnalyticsTimeframe } from '../dto/analytics.dto';

describe('AnalyticsQueryService', () => {
  let service: AnalyticsQueryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsQueryService,
        {
          provide: PrismaService,
          useValue: {
            dailyUserMetric: { aggregate: jest.fn() },
            dailyProductMetric: { aggregate: jest.fn(), findMany: jest.fn() },
            dailyPaymentMetric: { aggregate: jest.fn(), findMany: jest.fn() },
            dailySearchMetric: { findMany: jest.fn() },
            dailyCategoryMetric: { findMany: jest.fn() },
            platformStatistic: { findFirst: jest.fn() },
            productStatistics: { findUnique: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsQueryService>(AnalyticsQueryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAdminDashboard', () => {
    it('should aggregate metrics and return dashboard data', async () => {
      const mockPeriod = { start: expect.any(Date), end: expect.any(Date) };
      (prisma.dailyUserMetric.aggregate as jest.Mock).mockResolvedValue({ _sum: { newUsers: 10 } });
      (prisma.dailyProductMetric.aggregate as jest.Mock).mockResolvedValue({ _sum: { views: 100 } });
      (prisma.dailyPaymentMetric.aggregate as jest.Mock).mockResolvedValue({ _sum: { totalRevenue: 500 } });
      (prisma.platformStatistic.findFirst as jest.Mock).mockResolvedValue({ totalUsers: 1000 });

      const result = await service.getAdminDashboard({ timeframe: AnalyticsTimeframe.WEEK });

      expect(result).toBeDefined();
      expect(result.users).toEqual({ newUsers: 10 });
      expect(result.products).toEqual({ views: 100 });
      expect(result.payments).toEqual({ totalRevenue: 500 });
      expect(result.platform).toEqual({ totalUsers: 1000 });
      expect(prisma.dailyUserMetric.aggregate).toHaveBeenCalled();
    });
  });

  describe('getProductAnalytics', () => {
    it('should return product metrics and overall stats', async () => {
      const mockId = 'product-id';
      (prisma.dailyProductMetric.findMany as jest.Mock).mockResolvedValue([{ views: 5 }]);
      (prisma.productStatistics.findUnique as jest.Mock).mockResolvedValue({ viewsTotal: 10 });

      const result = await service.getProductAnalytics(mockId, { timeframe: AnalyticsTimeframe.TODAY });
      
      expect(result).toBeDefined();
      expect(result.dailyMetrics.length).toBe(1);
      expect(result.overallStats).toEqual({ viewsTotal: 10 });
    });
  });
});
