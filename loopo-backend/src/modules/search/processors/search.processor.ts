import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';

@Processor('search-analytics')
@Injectable()
export class SearchAnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(SearchAnalyticsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing search analytics job ${job.id}...`);
    const { userId, query, filters, resultsCount, ipAddress, userAgent } = job.data;

    if (!query || query.trim() === '') return;

    const trimmedQuery = query.trim().toLowerCase();

    // 1. Create DB search log
    await this.prisma.searchLog.create({
      data: {
        userId,
        query: trimmedQuery,
        filters: filters ? (filters as any) : undefined,
        resultsCount,
        ipAddress,
        userAgent,
      },
    });

    // 2. Increments PopularSearch count
    await this.prisma.popularSearch.upsert({
      where: { query: trimmedQuery },
      update: {
        searchCount: { increment: 1 },
      },
      create: {
        query: trimmedQuery,
        searchCount: 1,
      },
    });

    // 3. Update SearchStatistics
    await this.prisma.searchStatistics.upsert({
      where: { query: trimmedQuery },
      update: {
        dailySearchCount: { increment: 1 },
        weeklySearchCount: { increment: 1 },
        monthlySearchCount: { increment: 1 },
      },
      create: {
        query: trimmedQuery,
        dailySearchCount: 1,
        weeklySearchCount: 1,
        monthlySearchCount: 1,
      },
    });

    // 4. Save recent searches per user (up to 10 entries)
    if (userId) {
      const recent = await this.prisma.recentSearch.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // Avoid duplicate consecutive query records
      if (recent.length === 0 || recent[0].query !== trimmedQuery) {
        await this.prisma.recentSearch.create({
          data: { userId, query: trimmedQuery },
        });

        // Delete old history entries if over 10
        if (recent.length >= 10) {
          const idsToDelete = recent.slice(9).map((r) => r.id);
          await this.prisma.recentSearch.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }
      }
    }

    return { success: true };
  }
}

@Processor('trending-calculation')
@Injectable()
export class TrendingCalculationProcessor extends WorkerHost {
  private readonly logger = new Logger(TrendingCalculationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log('Calculating trending keywords list...');

    // Queries top 10 popular searches
    const stats = await this.prisma.popularSearch.findMany({
      orderBy: { searchCount: 'desc' },
      take: 10,
    });

    const trending = stats.map((s) => s.query);

    // Save list to Redis
    await this.redisService.set('search:trending', JSON.stringify(trending), 3600); // 1 hour cache
    this.logger.log('Trending keywords cache list compiled and synced.');

    return { trendingCount: trending.length };
  }
}

@Processor('recommendation-refresh')
@Injectable()
export class RecommendationRefreshProcessor extends WorkerHost {
  private readonly logger = new Logger(RecommendationRefreshProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log('Refreshing recommendations index logs...');
    // In production we can refresh popular recommendations list caches
    return { success: true };
  }
}

@Processor('cache-refresh')
@Injectable()
export class CacheRefreshProcessor extends WorkerHost {
  private readonly logger = new Logger(CacheRefreshProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log('Flushing stale listings search caches...');
    return { success: true };
  }
}
