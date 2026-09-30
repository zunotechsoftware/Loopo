import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ProductsScheduler {
  private readonly logger = new Logger(ProductsScheduler.name);

  constructor(@InjectQueue('product-expiration') private readonly expirationQueue: Queue) {}

  // ProductExpirationProcessor already implements a full scan-and-transition
  // (APPROVED -> EXPIRED past expiresAt), but nothing ever enqueued a job for
  // it to process - listings never actually auto-expired. Hourly keeps an
  // expired listing from lingering in public search for long without
  // hammering the DB. Relies on ScheduleModule.forRoot() already being
  // registered once app-wide via AnalyticsModule - deliberately not
  // re-imported here to avoid double-registering the cron discovery and
  // running this (and every other @Cron in the app) twice per tick.
  @Cron(CronExpression.EVERY_HOUR)
  async scheduleExpirationScan() {
    try {
      await this.expirationQueue.add('scan-expired-listings', {});
    } catch (error) {
      this.logger.error('Failed to enqueue listing expiration scan', error as Error);
    }
  }
}
