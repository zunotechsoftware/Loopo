import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';

@Injectable()
export class AdminDashboardService {
  private readonly logger = new Logger(AdminDashboardService.name);
  private readonly CACHE_KEY = 'admin:dashboard:summary';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getDashboardSummary() {
    const cached = await this.redisService.get(this.CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const [
        totalUsers,
        newUsersToday,
        activeUsers, // Simplification: count users not suspended/deleted
        totalListings,
        pendingListings,
        approvedListings,
        rejectedListings,
        featuredListings,
        boostedListings,
        revenueData,
        subscriptions,
        reportsPending,
        kycPending,
      ] = await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.user.count({ where: { createdAt: { gte: today }, deletedAt: null } }),
        this.prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        this.prisma.product.count({ where: { deletedAt: null } }),
        this.prisma.product.count({ where: { status: 'PENDING', deletedAt: null } }),
        this.prisma.product.count({ where: { status: 'APPROVED', deletedAt: null } }),
        this.prisma.product.count({ where: { status: 'REJECTED', deletedAt: null } }),
        this.prisma.featuredProduct.count({ where: { isActive: true, endDate: { gt: new Date() } } }),
        this.prisma.boostedProduct.count({ where: { isActive: true, endDate: { gt: new Date() } } }),
        this.prisma.payment.aggregate({
          where: { status: 'SUCCESS' },
          _sum: { netAmount: true },
        }),
        this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        this.prisma.report.count({ where: { status: 'OPEN' } }),
        this.prisma.kycDocument.count({ where: { status: 'SUBMITTED' } }),
      ]);

      const summary = {
        totalUsers,
        newUsersToday,
        activeUsers,
        totalListings,
        pendingListings,
        approvedListings,
        rejectedListings,
        featuredListings,
        boostedListings,
        revenue: revenueData._sum.netAmount || 0,
        subscriptions,
        reportsPending,
        kycPending,
        unreadNotifications: 0, // Placeholder
        queueStatus: { active: 0, waiting: 0, failed: 0 }, // Placeholder, can be filled by QueueService
        redisStatus: 'Connected', // Placeholder
        storageUsage: '0 MB', // Placeholder
      };

      await this.redisService.set(this.CACHE_KEY, JSON.stringify(summary), 300); // Cache for 5 mins

      return summary;
    } catch (error) {
      this.logger.error('Failed to fetch admin dashboard summary', error);
      throw error;
    }
  }
}
