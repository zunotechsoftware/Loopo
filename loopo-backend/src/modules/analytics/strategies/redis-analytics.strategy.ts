import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_ANALYTICS_PREFIX, CACHE_TTL_DASHBOARD } from '../constants/analytics.constants';

@Injectable()
export class RedisAnalyticsStrategy {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  private getKey(domain: string, identifier: string, dateStr: string): string {
    return `${REDIS_ANALYTICS_PREFIX}${domain}:${identifier}:${dateStr}`;
  }

  private getDateString(date: Date = new Date()): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // Generic increment
  async incrementMetric(domain: string, identifier: string, field: string, value: number = 1): Promise<void> {
    const key = this.getKey(domain, identifier, this.getDateString());
    await this.redis.hincrby(key, field, value);
    // Set expiry to 48 hours to ensure it lives long enough for the daily cron to pick it up
    await this.redis.expire(key, 48 * 3600);
  }

  // Get all fields for a specific domain, identifier, and date
  async getMetrics(domain: string, identifier: string, dateStr: string): Promise<Record<string, string>> {
    const key = this.getKey(domain, identifier, dateStr);
    return this.redis.hgetall(key);
  }

  // Delete metric key after successful aggregation
  async deleteMetrics(domain: string, identifier: string, dateStr: string): Promise<void> {
    const key = this.getKey(domain, identifier, dateStr);
    await this.redis.del(key);
  }

  // Get all keys for a domain pattern (for aggregation)
  async getKeysByDomainAndDate(domain: string, dateStr: string): Promise<string[]> {
    const pattern = `${REDIS_ANALYTICS_PREFIX}${domain}:*:${dateStr}`;
    // In production, consider using SCAN instead of KEYS if the dataset is massive
    return this.redis.keys(pattern);
  }

  // Parse identifier from key
  parseIdentifierFromKey(key: string, domain: string, dateStr: string): string {
    const prefix = `${REDIS_ANALYTICS_PREFIX}${domain}:`;
    const suffix = `:${dateStr}`;
    return key.replace(prefix, '').replace(suffix, '');
  }

  // Caching methods
  async getCachedDashboard(userId: string): Promise<any> {
    const data = await this.redis.get(`${REDIS_ANALYTICS_PREFIX}dashboard:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async setCachedDashboard(userId: string, data: any): Promise<void> {
    await this.redis.set(
      `${REDIS_ANALYTICS_PREFIX}dashboard:${userId}`,
      JSON.stringify(data),
      'EX',
      CACHE_TTL_DASHBOARD,
    );
  }

  async invalidateDashboardCache(userId: string): Promise<void> {
    await this.redis.del(`${REDIS_ANALYTICS_PREFIX}dashboard:${userId}`);
  }
}
