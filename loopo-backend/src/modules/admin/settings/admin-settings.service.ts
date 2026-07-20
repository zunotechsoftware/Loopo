import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { UpdateSystemSettingDto, BulkUpdateSettingsDto } from './dto/system-settings.dto';

@Injectable()
export class AdminSettingsService {
  private readonly CACHE_KEY_PREFIX = 'system_setting:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getAllSettings(group?: string) {
    const where = group ? { group } : {};
    return this.prisma.systemSetting.findMany({ where });
  }

  async getSettingByKey(key: string) {
    const cached = await this.redisService.get(`${this.CACHE_KEY_PREFIX}${key}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    await this.redisService.set(
      `${this.CACHE_KEY_PREFIX}${key}`,
      JSON.stringify(setting),
      3600, // Cache for 1 hour
    );

    return setting;
  }

  async updateSetting(userId: string, dto: UpdateSystemSettingDto) {
    const setting = await this.prisma.systemSetting.upsert({
      where: { key: dto.key },
      update: {
        value: dto.value,
        group: dto.group,
        isPublic: dto.isPublic,
        description: dto.description,
        updatedBy: userId,
      },
      create: {
        key: dto.key,
        value: dto.value,
        group: dto.group || 'GENERAL',
        isPublic: dto.isPublic || false,
        description: dto.description,
        updatedBy: userId,
      },
    });

    // Invalidate cache
    await this.redisService.del(`${this.CACHE_KEY_PREFIX}${dto.key}`);

    return setting;
  }

  async bulkUpdateSettings(userId: string, dto: BulkUpdateSettingsDto) {
    const updatedSettings: any[] = [];
    for (const setting of dto.settings) {
      const updated = await this.updateSetting(userId, setting);
      updatedSettings.push(updated);
    }
    return updatedSettings;
  }
}
