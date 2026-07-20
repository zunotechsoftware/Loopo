import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { AnalyticsQueryDto, AnalyticsTimeframe } from '../dto/analytics.dto';

@Injectable()
export class AnalyticsQueryService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateRange(dto: AnalyticsQueryDto): { start: Date; end: Date } {
    if (dto.startDate && dto.endDate) {
      return { start: dto.startDate, end: dto.endDate };
    }

    const end = new Date();
    const start = new Date();

    switch (dto.timeframe) {
      case AnalyticsTimeframe.TODAY:
        start.setHours(0, 0, 0, 0);
        break;
      case AnalyticsTimeframe.WEEK:
        start.setDate(start.getDate() - 7);
        break;
      case AnalyticsTimeframe.MONTH:
        start.setMonth(start.getMonth() - 1);
        break;
      case AnalyticsTimeframe.YEAR:
        start.setFullYear(start.getFullYear() - 1);
        break;
      case AnalyticsTimeframe.ALL:
      default:
        start.setFullYear(2000); // effectively all time
        break;
    }

    return { start, end };
  }

  async getAdminDashboard(dto: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(dto);

    const [userMetrics, productMetrics, paymentMetrics, platformStats] = await Promise.all([
      this.prisma.dailyUserMetric.aggregate({
        _sum: { newUsers: true, activeUsers: true, churnedUsers: true },
        where: { date: { gte: start, lte: end } },
      }),
      this.prisma.dailyProductMetric.aggregate({
        _sum: { views: true, chatRequests: true },
        where: { date: { gte: start, lte: end } },
      }),
      this.prisma.dailyPaymentMetric.aggregate({
        _sum: { totalRevenue: true, subscriptions: true, boostPurchases: true },
        where: { date: { gte: start, lte: end } },
      }),
      this.prisma.platformStatistic.findFirst(),
    ]);

    return {
      period: { start, end },
      users: userMetrics._sum,
      products: productMetrics._sum,
      payments: paymentMetrics._sum,
      platform: platformStats,
    };
  }

  async getProductAnalytics(productId: string, dto: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(dto);

    const [dailyMetrics, overallStats] = await Promise.all([
      this.prisma.dailyProductMetric.findMany({
        where: { productId, date: { gte: start, lte: end } },
        orderBy: { date: 'asc' },
      }),
      this.prisma.productStatistics.findUnique({
        where: { productId },
      }),
    ]);

    return {
      period: { start, end },
      dailyMetrics,
      overallStats,
    };
  }

  async getSearchAnalytics(dto: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(dto);

    return this.prisma.dailySearchMetric.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { searchCount: 'desc' },
      take: 50,
    });
  }

  async getCategoryAnalytics(dto: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(dto);

    return this.prisma.dailyCategoryMetric.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { views: 'desc' },
    });
  }

  async getPaymentAnalytics(dto: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(dto);

    return this.prisma.dailyPaymentMetric.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });
  }
}
