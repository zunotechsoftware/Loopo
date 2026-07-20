import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../shared/database/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';
import { PaymentsController } from './controllers/payments.controller';
import { RefundsController } from './controllers/refunds.controller';
import { CouponsController } from './controllers/coupons.controller';
import { FeaturedController } from './controllers/featured.controller';
import { BoostController } from './controllers/boost.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentsRepository } from './repositories/payments.repository';
import { StripeProvider } from './services/stripe.provider';
import { RazorpayProvider } from './services/razorpay.provider';
import { PaypalProvider } from './services/paypal.provider';
import { PaymentProviderFactory } from './services/payment-provider.factory';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { WebhookProcessingProcessor, PaymentVerificationProcessor } from './processors/payments.processor';
import { InvoiceGenerationProcessor, ReceiptEmailProcessor } from './processors/billing.processor';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    forwardRef(() => SubscriptionsModule),
    BullModule.registerQueue(
      { name: 'notification' },
      { name: 'email' },
      { name: 'webhook-processing' },
      { name: 'payment-verification' },
      { name: 'invoice-generation' },
      { name: 'receipt-email' },
    ),
  ],
  controllers: [
    PaymentsController,
    RefundsController,
    CouponsController,
    FeaturedController,
    BoostController,
  ],
  providers: [
    PaymentsService,
    PaymentsRepository,
    StripeProvider,
    RazorpayProvider,
    PaypalProvider,
    PaymentProviderFactory,
    WebhookProcessingProcessor,
    PaymentVerificationProcessor,
    InvoiceGenerationProcessor,
    ReceiptEmailProcessor,
  ],
  exports: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
