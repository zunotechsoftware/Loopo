import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReviewsService } from '../services/reviews.service';

// Relies on ScheduleModule.forRoot() already being registered once app-wide
// via AnalyticsModule - deliberately not re-imported here, same convention
// as ProductsScheduler, to avoid double-registering cron discovery.
@Injectable()
export class RatingEligibilityScheduler {
  private readonly logger = new Logger(RatingEligibilityScheduler.name);

  constructor(private readonly reviewsService: ReviewsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async expireStaleEligibilities() {
    try {
      const count = await this.reviewsService.expireStaleEligibilities();
      if (count > 0) {
        this.logger.log(`Expired ${count} stale rating eligibilities`);
      }
    } catch (error) {
      this.logger.error('Failed to expire stale rating eligibilities', error as Error);
    }
  }
}
