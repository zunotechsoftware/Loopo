import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'sms' },
      { name: 'notification' },
      { name: 'profile-image-processing' },
      { name: 'thumbnail-generation' },
      { name: 'image-compression' },
      { name: 'product-expiration' },
      { name: 'view-counter-sync' },
      { name: 'search-index-update' },
      { name: 'search-analytics' },
      { name: 'trending-calculation' },
      { name: 'recommendation-refresh' },
      { name: 'cache-refresh' },
      { name: 'message-analytics' },
      { name: 'conversation-cleanup' },
      { name: 'webhook-processing' },
      { name: 'payment-verification' },
      { name: 'invoice-generation' },
      { name: 'receipt-email' },
      { name: 'subscription-expiry' },
      { name: 'subscription-renewal' },
      { name: 'evidence-processing' },
      { name: 'ai-moderation' },
      { name: 'report-notifications' },
      { name: 'escalation-jobs' },
      { name: 'rating-recalculation' },
      { name: 'trust-score-calculation' },
      { name: 'review-moderation' },
      { name: 'analytics-aggregation' },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
