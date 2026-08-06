import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../shared/database/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionsRepository } from './repositories/subscriptions.repository';
import { PaymentsModule } from '../payments/payments.module';
import { SubscriptionExpiryProcessor, SubscriptionRenewalProcessor } from './processors/subscriptions.processor';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    forwardRef(() => PaymentsModule),
    BullModule.registerQueue(
      { name: 'notification' },
      { name: 'subscription-expiry' },
      { name: 'subscription-renewal' },
    ),
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsRepository,
    SubscriptionExpiryProcessor,
    SubscriptionRenewalProcessor,
  ],
  exports: [SubscriptionsService, SubscriptionsRepository],
})
export class SubscriptionsModule {}
