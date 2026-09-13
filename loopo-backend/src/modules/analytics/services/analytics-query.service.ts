import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { AnalyticsQueryDto, AnalyticsTimeframe } from '../dto/analytics.dto';
import { PaymentStatus, ProductStatus } from '@prisma/client';

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

  /**
   * Live summary metrics for the admin analytics overview cards.
   *
   * Deliberately computed directly from the raw tables (User, Product,
   * Payment, SearchLog) rather than from the DailyUserMetric/DailyProductMetric/
   * DailyPaymentMetric rollup tables getAdminDashboard() uses: those rollups
   * are populated by a scheduled aggregation job and are empty until that job
   * has actually run at least once (e.g. a fresh environment), which would
   * make every summary card silently show nothing. Live counts are always
   * correct, at the cost of being heavier queries at scale - fine for an
   * admin-only, low-traffic overview page.
   */
  async getAdminSummary(dto: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(dto);

    const [
      totalUsers,
      approvedCount,
      revenueAgg,
      successfulPaymentCount,
      searchQueries,
      rejectedCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count({ where: { status: ProductStatus.APPROVED } }),
      this.prisma.payment.aggregate({
        _sum: { netAmount: true },
        where: { status: PaymentStatus.SUCCESS, createdAt: { gte: start, lte: end } },
      }),
      this.prisma.payment.count({
        where: { status: PaymentStatus.SUCCESS, createdAt: { gte: start, lte: end } },
      }),
      this.prisma.searchLog.count({ where: { createdAt: { gte: start, lte: end } } }),
      this.prisma.product.count({ where: { status: ProductStatus.REJECTED } }),
    ]);

    const monthlyRevenue = revenueAgg._sum.netAmount || 0;
    const avgOrderValue = successfulPaymentCount > 0 ? monthlyRevenue / successfulPaymentCount : 0;
    const moderationDecisions = approvedCount + rejectedCount;
    const moderationRate = moderationDecisions > 0 ? (approvedCount / moderationDecisions) * 100 : 0;

    return {
      period: { start, end },
      totalUsers,
      activeListings: approvedCount,
      monthlyRevenue,
      avgOrderValue,
      searchQueries,
      moderationRate,
    };
  }

  /** Real user signups grouped by day, for the admin "User Growth" chart. */
  async getUserGrowth(dto: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(dto);

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const byDay = new Map<string, number>();
    for (const u of users) {
      const day = u.createdAt.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) || 0) + 1);
    }

    let runningTotal = 0;
    const series = Array.from(byDay.entries()).map(([date, newUsers]) => {
      runningTotal += newUsers;
      return { date, newUsers, totalUsers: runningTotal };
    });

    return { period: { start, end }, series };
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
