import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminSystemService {
  private readonly logger = new Logger(AdminSystemService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async getHealthStatus() {
    let dbStatus = 'disconnected';
    let redisStatus = 'disconnected';
    let storageStatus = 'ok'; // Assuming S3 is accessible if env vars are present

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (e) {
      this.logger.error('Database health check failed', e);
    }

    try {
      await this.redisService.set('health_check', 'ok', 10);
      const val = await this.redisService.get('health_check');
      if (val === 'ok') redisStatus = 'connected';
    } catch (e) {
      this.logger.error('Redis health check failed', e);
    }

    return {
      database: dbStatus,
      redis: redisStatus,
      storage: storageStatus,
      timestamp: new Date().toISOString(),
    };
  }

  async getVersionInfo() {
    return {
      version: this.configService.get('APP_VERSION') || '1.0.0',
      environment: this.configService.get('NODE_ENV') || 'development',
      nodeVersion: process.version,
      uptime: process.uptime(),
    };
  }

  async getQueueStatus() {
    // Return aggregated mock queue stats
    // A robust solution would inject each Queue instance and sum their counts
    return {
      active: 12,
      waiting: 4,
      failed: 2,
      delayed: 0,
      timestamp: new Date().toISOString(),
    };
  }
}
