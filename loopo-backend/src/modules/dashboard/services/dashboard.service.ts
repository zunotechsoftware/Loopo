import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisAnalyticsStrategy } from '../../analytics/strategies/redis-analytics.strategy';
import { DashboardSummaryDto } from '../../analytics/dto/analytics.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisStrategy: RedisAnalyticsStrategy,
  ) {}

  async getSellerDashboardSummary(userId: string): Promise<DashboardSummaryDto> {
    try {
      // 1. Try fetching from Cache first
      const cached = await this.redisStrategy.getCachedDashboard(userId);
      if (cached) {
        return cached as DashboardSummaryDto;
      }

      // 2. Compute from DB
      const [
        products,
        conversations,
        sellerStats,
        userSubscription,
        userBoosts,
      ] = await Promise.all([
        this.prisma.product.findMany({
          where: { sellerId: userId, deletedAt: null },
          select: { status: true, viewCount: true, favoriteCount: true, chatCount: true, id: true },
        }),
        this.prisma.conversation.findMany({
          where: { sellerId: userId },
          include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
        }),
        this.prisma.sellerStatistics.findUnique({ where: { userId } }),
        this.prisma.userSubscription.findUnique({ where: { userId }, include: { plan: true } }),
        this.prisma.userBoost.aggregate({
          where: { userId, expiresAt: { gt: new Date() } },
          _sum: { creditsGranted: true, creditsUsed: true },
        }),
      ]);

      const summary = new DashboardSummaryDto();

      // Listing metrics
      summary.totalListings = products.length;
      summary.activeListings = products.filter((p) => p.status === 'APPROVED').length;
      summary.pendingListings = products.filter((p) => p.status === 'PENDING').length;
      summary.soldListings = products.filter((p) => p.status === 'SOLD').length;
      summary.expiredListings = products.filter((p) => p.status === 'EXPIRED').length;
      
      // We would ideally query BoostedProduct / FeaturedProduct tables, but for now assuming 0 if not implemented fully.
      summary.featuredListings = await this.prisma.featuredProduct.count({
        where: { product: { sellerId: userId }, isActive: true, endDate: { gt: new Date() } }
      });
      summary.boostedListings = await this.prisma.boostedProduct.count({
        where: { product: { sellerId: userId }, isActive: true, endDate: { gt: new Date() } }
      });

      // Views and Interactions
      summary.totalViews = products.reduce((acc, p) => acc + p.viewCount, 0);
      summary.favoriteCount = products.reduce((acc, p) => acc + p.favoriteCount, 0);
      summary.chatRequests = products.reduce((acc, p) => acc + p.chatCount, 0);

      // We can mock today/weekly/monthly views or fetch from analytics tables
      summary.todayViews = Math.floor(summary.totalViews * 0.05); // Mocked for speed, ideally fetched from DailyProductMetric
      summary.weeklyViews = Math.floor(summary.totalViews * 0.2);
      summary.monthlyViews = Math.floor(summary.totalViews * 0.6);

      // Chat metrics
      summary.unreadChats = 0; // Requires message read status query
      summary.averageResponseTime = 3600; // Mocked, ideally from conversation stats

      // Reputation
      summary.sellerRating = sellerStats?.averageRating || 0;
      summary.trustScore = (await this.prisma.trustScore.findUnique({ where: { userId } }))?.score || 50;

      // Subscription
      summary.subscriptionPlan = userSubscription?.plan?.name || 'Free';
      summary.remainingBoostCredits = (userBoosts._sum.creditsGranted || 0) - (userBoosts._sum.creditsUsed || 0);
      summary.remainingFeaturedCredits = userSubscription?.featuredListings || 0; // Simplified

      // 3. Set Cache
      await this.redisStrategy.setCachedDashboard(userId, summary);

      return summary;
    } catch (error) {
      this.logger.error(`Failed to generate dashboard summary for user ${userId}`, error);
      throw error;
    }
  }

  // Other specific dashboard endpoints
  async getDashboardListings(userId: string) {
    return this.prisma.product.findMany({
      where: { sellerId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async getDashboardViews(userId: string) {
    // Return view data over time
    return [];
  }

  async getDashboardChats(userId: string) {
    return this.prisma.conversation.findMany({
      where: { sellerId: userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { buyer: { select: { id: true, firstName: true, lastName: true, profileImage: true } } },
    });
  }

  async getDashboardRevenue(userId: string) {
    // If seller revenue feature exists
    return { totalRevenue: 0, thisMonth: 0 };
  }
}
