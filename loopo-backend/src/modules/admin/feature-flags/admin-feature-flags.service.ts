import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { UpdateFeatureFlagDto, BulkUpdateFeatureFlagsDto } from './dto/feature-flag.dto';

@Injectable()
export class AdminFeatureFlagsService {
  private readonly CACHE_KEY_PREFIX = 'feature_flag:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getAllFeatureFlags() {
    return this.prisma.featureFlag.findMany();
  }

  async getFeatureFlagByKey(key: string) {
    const cached = await this.redisService.get(`${this.CACHE_KEY_PREFIX}${key}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) {
      throw new NotFoundException(`Feature flag ${key} not found`);
    }

    await this.redisService.set(
      `${this.CACHE_KEY_PREFIX}${key}`,
      JSON.stringify(flag),
      3600, // 1 hour
    );

    return flag;
  }

  async updateFeatureFlag(userId: string, dto: UpdateFeatureFlagDto) {
    const flag = await this.prisma.featureFlag.upsert({
      where: { key: dto.key },
      update: {
        name: dto.name,
        description: dto.description,
        isEnabled: dto.isEnabled,
        updatedBy: userId,
      },
      create: {
        key: dto.key,
        name: dto.name || dto.key,
        description: dto.description,
        isEnabled: dto.isEnabled,
        updatedBy: userId,
      },
    });

    await this.redisService.del(`${this.CACHE_KEY_PREFIX}${dto.key}`);
    return flag;
  }

  async bulkUpdateFeatureFlags(userId: string, dto: BulkUpdateFeatureFlagsDto) {
    const updatedFlags: any[] = [];
    for (const flagDto of dto.flags) {
      const updated = await this.updateFeatureFlag(userId, flagDto);
      updatedFlags.push(updated);
    }
    return updatedFlags;
  }
}
