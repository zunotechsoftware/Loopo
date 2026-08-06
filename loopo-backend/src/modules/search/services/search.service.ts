import { Injectable, Inject, Logger } from '@nestjs/common';
import { ISearchProvider, SearchFilters, PaginationOptions } from '../interfaces/search.interface';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject('SEARCH_PROVIDER') private readonly searchProvider: ISearchProvider,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @InjectQueue('search-analytics') private readonly searchAnalyticsQueue: Queue,
  ) {}

  async executeSearch(
    query: string,
    filters: SearchFilters,
    pagination: PaginationOptions,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // 1. Generate clean cache key from search parameters
    const filterHash = crypto
      .createHash('md5')
      .update(JSON.stringify({ filters, pagination }))
      .digest('hex');
    const cacheKey = `search:results:${query || 'all'}:${filterHash}`;

    // 2. Fetch cache
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for search query: "${query}"`);
        return JSON.parse(cached);
      }
    } catch (err) {}

    // 3. Execute Search via provider strategy
    const results = await this.searchProvider.search(query || '', filters, pagination);

    // 4. Save to Redis Cache (5 minutes TTL for high performance under heavy load)
    try {
      await this.redisService.set(cacheKey, JSON.stringify(results), 300);
    } catch (err) {}

    // 5. Asynchronously log search analytics (decoupled using BullMQ)
    await this.searchAnalyticsQueue.add('log-search', {
      userId,
      query: query || '',
      filters,
      resultsCount: results.total,
      ipAddress,
      userAgent,
    });

    return results;
  }

  async getSuggestions(query: string) {
    const cacheKey = `search:suggestions:${query.toLowerCase()}`;
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err) {}

    const suggestions = await this.searchProvider.getSuggestions(query);

    try {
      await this.redisService.set(cacheKey, JSON.stringify(suggestions), 1800); // 30 mins TTL
    } catch (err) {}

    return suggestions;
  }

  async getTrendingSearches() {
    const cacheKey = 'search:trending';
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err) {}

    // Fallback: query DB for most popular queries in last 7 days
    const stats = await this.prisma.popularSearch.findMany({
      orderBy: { searchCount: 'desc' },
      take: 10,
    });
    const trending = stats.map((s) => s.query);

    try {
      await this.redisService.set(cacheKey, JSON.stringify(trending), 3600); // 1 hour TTL
    } catch (err) {}

    return trending;
  }

  // --- Recent Searches (History Management) ---

  async getRecentSearches(userId: string) {
    return this.prisma.recentSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10, // Max 10 recent searches
    });
  }

  async clearRecentSearches(userId: string) {
    await this.prisma.recentSearch.deleteMany({
      where: { userId },
    });
    return { success: true };
  }

  async deleteOneRecentSearch(userId: string, id: string) {
    await this.prisma.recentSearch.deleteMany({
      where: { id, userId },
    });
    return { success: true };
  }
}
