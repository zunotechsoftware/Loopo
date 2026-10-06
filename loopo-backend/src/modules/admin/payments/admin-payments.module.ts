import { Module } from '@nestjs/common';
import { AdminPaymentsController } from './admin-payments.controller';
import { AdminPaymentsService } from './admin-payments.service';
import { PaymentsModule } from '../../payments/payments.module';

@Module({
  // PaymentsModule is imported so refunds go through the real,
  // gateway-calling PaymentsService.processRefund() instead of the
  // DB-only mock that used to live directly in AdminPaymentsService.
  imports: [PaymentsModule],
  controllers: [AdminPaymentsController],
  providers: [AdminPaymentsService],
  exports: [AdminPaymentsService],
})
export class AdminPaymentsModule {}
