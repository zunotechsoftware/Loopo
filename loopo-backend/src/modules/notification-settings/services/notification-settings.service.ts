import { Injectable } from '@nestjs/common';
import { NotificationSettingsRepository } from '../repositories/notification-settings.repository';
import { RedisService } from '../../../shared/redis/redis.service';
import { UpdateNotificationSettingsDto } from '../dto/notification-settings.dto';

@Injectable()
export class NotificationSettingsService {
  constructor(
    private readonly repository: NotificationSettingsRepository,
    private readonly redisService: RedisService,
  ) {}

  private getCacheKey(userId: string): string {
    return `user:notification-settings:${userId}`;
  }

  async getSettings(userId: string) {
    const cacheKey = this.getCacheKey(userId);

    // Try to get from Redis cache
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.error('Redis error getting notification settings:', err);
    }

    // Cache miss: query Database
    let settings = await this.repository.findByUserId(userId);
    if (!settings) {
      // Auto-create default settings if none exist
      settings = await this.repository.create(userId);
    }

    // Save to Redis cache
    try {
      await this.redisService.set(cacheKey, JSON.stringify(settings), 86400); // 24 hour TTL
    } catch (err) {
      console.error('Redis error setting notification settings:', err);
    }

    return settings;
  }

  async updateSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    const cacheKey = this.getCacheKey(userId);

    // Fetch existing or initialize
    let settings = await this.repository.findByUserId(userId);
    if (!settings) {
      await this.repository.create(userId);
    }

    const updated = await this.repository.update(userId, dto);

    // Invalidate Redis cache
    try {
      await this.redisService.del(cacheKey);
    } catch (err) {
      console.error('Redis error deleting notification settings cache:', err);
    }

    return updated;
  }
}
