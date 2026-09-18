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

  /** Real listing counts by category, for the admin "Products" tab. */
  async getListingsByCategory() {
    const grouped = await this.prisma.product.groupBy({
      by: ['categoryId'],
      _count: { _all: true },
      where: { deletedAt: null },
    });

    const categoryIds = grouped.map((g) => g.categoryId).filter(Boolean) as string[];
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(categories.map((c) => [c.id, c.name]));

    return grouped
      .map((g) => ({ name: nameById.get(g.categoryId) || 'Uncategorized', value: g._count._all }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Real monthly revenue, for the admin "Revenue" tab. Split into
   * subscriptions vs. everything else (listing boosts, featured
   * placements, direct product payments) based on which FK is set on
   * the Payment row - there's no explicit "type" column.
   */
  async getRevenueBreakdown(dto: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(dto);

    const payments = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.SUCCESS, createdAt: { gte: start, lte: end } },
      select: { netAmount: true, subscriptionId: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const byMonth = new Map<string, { revenue: number; subscriptions: number; other: number }>();
    for (const p of payments) {
      const month = p.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const bucket = byMonth.get(month) || { revenue: 0, subscriptions: 0, other: 0 };
      bucket.revenue += p.netAmount;
      if (p.subscriptionId) bucket.subscriptions += p.netAmount;
      else bucket.other += p.netAmount;
      byMonth.set(month, bucket);
    }

    const series = Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }));

    return { period: { start, end }, series };
  }

  /** Real revenue by product category, for the admin "Revenue" tab's pie chart. */
  async getRevenueByCategory(dto: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(dto);

    const payments = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.SUCCESS, createdAt: { gte: start, lte: end }, productId: { not: null } },
      select: { netAmount: true, product: { select: { category: { select: { name: true } } } } },
    });

    const byCategory = new Map<string, number>();
    for (const p of payments) {
      const name = p.product?.category?.name || 'Uncategorized';
      byCategory.set(name, (byCategory.get(name) || 0) + p.netAmount);
    }

    return Array.from(byCategory.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * Real moderation activity by month, for the admin "Moderation" tab.
   * Uses Complaint as the source of truth (there's real seeded data there);
   * "escalated" is approximated as HIGH/URGENT priority complaints, since
   * ComplaintStatus has no distinct ESCALATED state.
   */
  async getModerationOverview(dto: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(dto);

    const complaints = await this.prisma.complaint.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, status: true, priority: true },
      orderBy: { createdAt: 'asc' },
    });

    const byMonth = new Map<string, { reports: number; resolved: number; escalated: number }>();
    for (const c of complaints) {
      const month = c.createdAt.toISOString().slice(0, 7);
      const bucket = byMonth.get(month) || { reports: 0, resolved: 0, escalated: 0 };
      bucket.reports += 1;
      if (c.status === 'RESOLVED' || c.status === 'CLOSED') bucket.resolved += 1;
      if (c.priority === 'HIGH' || c.priority === 'URGENT') bucket.escalated += 1;
      byMonth.set(month, bucket);
    }

    const series = Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }));

    return { period: { start, end }, series };
  }
}
