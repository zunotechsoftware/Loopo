import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisAnalyticsStrategy } from '../strategies/redis-analytics.strategy';

@Injectable()
export class AnalyticsAggregationService {
  private readonly logger = new Logger(AnalyticsAggregationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisStrategy: RedisAnalyticsStrategy,
  ) {}

  async aggregateDailyMetrics(dateStr?: string) {
    // If no date provided, aggregate for yesterday
    const targetDateStr = dateStr || this.getYesterdayDateString();
    const targetDate = new Date(targetDateStr);
    
    this.logger.log(`Starting aggregation for date: ${targetDateStr}`);

    await this.aggregateUserMetrics(targetDateStr, targetDate);
    await this.aggregateProductMetrics(targetDateStr, targetDate);
    await this.aggregateSearchMetrics(targetDateStr, targetDate);
    await this.aggregatePaymentMetrics(targetDateStr, targetDate);
    await this.aggregateChatMetrics(targetDateStr, targetDate);
    await this.aggregateNotificationMetrics(targetDateStr, targetDate);
    await this.aggregateReviewMetrics(targetDateStr, targetDate);
    await this.aggregateCategoryMetrics(targetDateStr, targetDate);
    await this.updatePlatformStatistics();

    this.logger.log(`Completed aggregation for date: ${targetDateStr}`);
  }

  private getYesterdayDateString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  private async aggregateUserMetrics(dateStr: string, date: Date) {
    try {
      const metrics = await this.redisStrategy.getMetrics('user', 'global', dateStr);
      if (Object.keys(metrics).length === 0) return;

      await this.prisma.dailyUserMetric.upsert({
        where: { date },
        update: {
          newUsers: { increment: parseInt(metrics.newUsers || '0', 10) },
          activeUsers: { increment: parseInt(metrics.activeUsers || '0', 10) },
          verifiedUsers: { increment: parseInt(metrics.verifiedUsers || '0', 10) },
          churnedUsers: { increment: parseInt(metrics.churnedUsers || '0', 10) },
          kycApprovals: { increment: parseInt(metrics.kycApprovals || '0', 10) },
          kycRejections: { increment: parseInt(metrics.kycRejections || '0', 10) },
        },
        create: {
          date,
          newUsers: parseInt(metrics.newUsers || '0', 10),
          activeUsers: parseInt(metrics.activeUsers || '0', 10),
          verifiedUsers: parseInt(metrics.verifiedUsers || '0', 10),
          churnedUsers: parseInt(metrics.churnedUsers || '0', 10),
          kycApprovals: parseInt(metrics.kycApprovals || '0', 10),
          kycRejections: parseInt(metrics.kycRejections || '0', 10),
        },
      });

      await this.redisStrategy.deleteMetrics('user', 'global', dateStr);
    } catch (e) {
      this.logger.error(`Error aggregating user metrics`, e);
    }
  }

  private async aggregateProductMetrics(dateStr: string, date: Date) {
    try {
      const keys = await this.redisStrategy.getKeysByDomainAndDate('product', dateStr);
      for (const key of keys) {
        const productId = this.redisStrategy.parseIdentifierFromKey(key, 'product', dateStr);
        const metrics = await this.redisStrategy.getMetrics('product', productId, dateStr);
        
        await this.prisma.dailyProductMetric.upsert({
          where: { date_productId: { date, productId } },
          update: {
            views: { increment: parseInt(metrics.views || '0', 10) },
            favorites: { increment: parseInt(metrics.favorites || '0', 10) },
            shares: { increment: parseInt(metrics.shares || '0', 10) },
            chatRequests: { increment: parseInt(metrics.chatRequests || '0', 10) },
          },
          create: {
            date,
            productId,
            views: parseInt(metrics.views || '0', 10),
            favorites: parseInt(metrics.favorites || '0', 10),
            shares: parseInt(metrics.shares || '0', 10),
            chatRequests: parseInt(metrics.chatRequests || '0', 10),
          },
        });

        // Also update the aggregated statistics table
        await this.prisma.productStatistics.upsert({
          where: { productId },
          update: {
            viewsTotal: { increment: parseInt(metrics.views || '0', 10) },
            favoritesCount: { increment: parseInt(metrics.favorites || '0', 10) },
            chatsCreated: { increment: parseInt(metrics.chatRequests || '0', 10) },
          },
          create: {
            productId,
            viewsTotal: parseInt(metrics.views || '0', 10),
            favoritesCount: parseInt(metrics.favorites || '0', 10),
            chatsCreated: parseInt(metrics.chatRequests || '0', 10),
          }
        });

        await this.redisStrategy.deleteMetrics('product', productId, dateStr);
      }
    } catch (e) {
      this.logger.error(`Error aggregating product metrics`, e);
    }
  }

  private async aggregateSearchMetrics(dateStr: string, date: Date) {
    try {
      const keys = await this.redisStrategy.getKeysByDomainAndDate('search', dateStr);
      for (const key of keys) {
        const query = this.redisStrategy.parseIdentifierFromKey(key, 'search', dateStr);
        const metrics = await this.redisStrategy.getMetrics('search', query, dateStr);
        
        await this.prisma.dailySearchMetric.upsert({
          where: { date_query: { date, query } },
          update: {
            searchCount: { increment: parseInt(metrics.searchCount || '0', 10) },
            zeroResults: { increment: parseInt(metrics.zeroResults || '0', 10) },
          },
          create: {
            date,
            query,
            searchCount: parseInt(metrics.searchCount || '0', 10),
            zeroResults: parseInt(metrics.zeroResults || '0', 10),
          },
        });

        await this.redisStrategy.deleteMetrics('search', query, dateStr);
      }
    } catch (e) {
      this.logger.error(`Error aggregating search metrics`, e);
    }
  }

  private async aggregatePaymentMetrics(dateStr: string, date: Date) {
    try {
      const metrics = await this.redisStrategy.getMetrics('payment', 'global', dateStr);
      if (Object.keys(metrics).length === 0) return;

      await this.prisma.dailyPaymentMetric.upsert({
        where: { date },
        update: {
          totalRevenue: { increment: parseFloat(metrics.totalRevenue || '0') },
          subscriptions: { increment: parseInt(metrics.subscriptions || '0', 10) },
          boostPurchases: { increment: parseInt(metrics.boostPurchases || '0', 10) },
          featuredPurchases: { increment: parseInt(metrics.featuredPurchases || '0', 10) },
          refunds: { increment: parseInt(metrics.refunds || '0', 10) },
        },
        create: {
          date,
          totalRevenue: parseFloat(metrics.totalRevenue || '0'),
          subscriptions: parseInt(metrics.subscriptions || '0', 10),
          boostPurchases: parseInt(metrics.boostPurchases || '0', 10),
          featuredPurchases: parseInt(metrics.featuredPurchases || '0', 10),
          refunds: parseInt(metrics.refunds || '0', 10),
        },
      });

      await this.redisStrategy.deleteMetrics('payment', 'global', dateStr);
    } catch (e) {
      this.logger.error(`Error aggregating payment metrics`, e);
    }
  }

  private async aggregateChatMetrics(dateStr: string, date: Date) {
    try {
      const metrics = await this.redisStrategy.getMetrics('chat', 'global', dateStr);
      if (Object.keys(metrics).length === 0) return;

      await this.prisma.dailyChatMetric.upsert({
        where: { date },
        update: {
          messagesSent: { increment: parseInt(metrics.messagesSent || '0', 10) },
          conversationsStarted: { increment: parseInt(metrics.conversationsStarted || '0', 10) },
        },
        create: {
          date,
          messagesSent: parseInt(metrics.messagesSent || '0', 10),
          conversationsStarted: parseInt(metrics.conversationsStarted || '0', 10),
        },
      });

      await this.redisStrategy.deleteMetrics('chat', 'global', dateStr);
    } catch (e) {
      this.logger.error(`Error aggregating chat metrics`, e);
    }
  }

  private async aggregateNotificationMetrics(dateStr: string, date: Date) {
    try {
      const metrics = await this.redisStrategy.getMetrics('notification', 'global', dateStr);
      if (Object.keys(metrics).length === 0) return;

      await this.prisma.dailyNotificationMetric.upsert({
        where: { date },
        update: {
          emailsSent: { increment: parseInt(metrics.emailsSent || '0', 10) },
          pushDelivered: { increment: parseInt(metrics.pushDelivered || '0', 10) },
          smsDelivered: { increment: parseInt(metrics.smsDelivered || '0', 10) },
        },
        create: {
          date,
          emailsSent: parseInt(metrics.emailsSent || '0', 10),
          pushDelivered: parseInt(metrics.pushDelivered || '0', 10),
          smsDelivered: parseInt(metrics.smsDelivered || '0', 10),
        },
      });

      await this.redisStrategy.deleteMetrics('notification', 'global', dateStr);
    } catch (e) {
      this.logger.error(`Error aggregating notification metrics`, e);
    }
  }

  private async aggregateReviewMetrics(dateStr: string, date: Date) {
    try {
      const metrics = await this.redisStrategy.getMetrics('review', 'global', dateStr);
      if (Object.keys(metrics).length === 0) return;

      await this.prisma.dailyReviewMetric.upsert({
        where: { date },
        update: {
          totalReviews: { increment: parseInt(metrics.totalReviews || '0', 10) },
        },
        create: {
          date,
          totalReviews: parseInt(metrics.totalReviews || '0', 10),
        },
      });

      await this.redisStrategy.deleteMetrics('review', 'global', dateStr);
    } catch (e) {
      this.logger.error(`Error aggregating review metrics`, e);
    }
  }

  private async aggregateCategoryMetrics(dateStr: string, date: Date) {
    try {
      const keys = await this.redisStrategy.getKeysByDomainAndDate('category', dateStr);
      for (const key of keys) {
        const categoryId = this.redisStrategy.parseIdentifierFromKey(key, 'category', dateStr);
        const metrics = await this.redisStrategy.getMetrics('category', categoryId, dateStr);
        
        await this.prisma.dailyCategoryMetric.upsert({
          where: { date_categoryId: { date, categoryId } },
          update: {
            views: { increment: parseInt(metrics.views || '0', 10) },
            newListings: { increment: parseInt(metrics.newListings || '0', 10) },
            soldListings: { increment: parseInt(metrics.soldListings || '0', 10) },
          },
          create: {
            date,
            categoryId,
            views: parseInt(metrics.views || '0', 10),
            newListings: parseInt(metrics.newListings || '0', 10),
            soldListings: parseInt(metrics.soldListings || '0', 10),
          },
        });

        await this.redisStrategy.deleteMetrics('category', categoryId, dateStr);
      }
    } catch (e) {
      this.logger.error(`Error aggregating category metrics`, e);
    }
  }

  private async updatePlatformStatistics() {
    try {
      // Direct SQL or aggregations for overall platform stats
      const totalUsers = await this.prisma.user.count();
      const totalProducts = await this.prisma.product.count();
      
      const payments = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' }
      });
      
      const activeChats = await this.prisma.conversation.count(); // could filter by recent activity

      // Upsert PlatformStatistic (assuming we have one row)
      const existingStat = await this.prisma.platformStatistic.findFirst();
      
      if (existingStat) {
        await this.prisma.platformStatistic.update({
          where: { id: existingStat.id },
          data: {
            totalUsers,
            totalProducts,
            totalRevenue: payments._sum.amount || 0,
            activeChats,
          }
        });
      } else {
        await this.prisma.platformStatistic.create({
          data: {
            totalUsers,
            totalProducts,
            totalRevenue: payments._sum.amount || 0,
            activeChats,
          }
        });
      }
    } catch (e) {
      this.logger.error(`Error updating platform statistics`, e);
    }
  }
}
