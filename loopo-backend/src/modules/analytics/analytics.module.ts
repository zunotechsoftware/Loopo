import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { ANALYTICS_QUEUE } from './constants/analytics.constants';
import { RedisAnalyticsStrategy } from './strategies/redis-analytics.strategy';
import { AnalyticsProcessor } from './processors/analytics.processor';
import { AnalyticsListener } from './listeners/analytics.listener';
import { AnalyticsAggregationService } from './services/analytics-aggregation.service';
import { AnalyticsScheduler } from './schedulers/analytics.scheduler';
import { AnalyticsQueryService } from './services/analytics-query.service';
import {
  AdminAnalyticsController,
  ProductAnalyticsController,
  SearchAnalyticsController,
  CategoryAnalyticsController,
  PaymentAnalyticsController,
} from './controllers/analytics.controller';
import { PrismaModule } from '../../shared/database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RbacModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: ANALYTICS_QUEUE,
    }),
  ],
  controllers: [
    AdminAnalyticsController,
    ProductAnalyticsController,
    SearchAnalyticsController,
    CategoryAnalyticsController,
    PaymentAnalyticsController,
  ],
  providers: [
    RedisAnalyticsStrategy,
    AnalyticsProcessor,
    AnalyticsListener,
    AnalyticsAggregationService,
    AnalyticsScheduler,
    AnalyticsQueryService,
  ],
  exports: [RedisAnalyticsStrategy, AnalyticsQueryService],
})
export class AnalyticsModule {}
