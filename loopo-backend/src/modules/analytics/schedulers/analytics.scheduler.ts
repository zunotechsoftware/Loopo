import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticsAggregationService } from '../services/analytics-aggregation.service';

@Injectable()
export class AnalyticsScheduler {
  private readonly logger = new Logger(AnalyticsScheduler.name);

  constructor(private readonly aggregationService: AnalyticsAggregationService) {}

  // Run at 00:05 every day to aggregate the previous day's metrics
  @Cron('5 0 * * *')
  async handleDailyAggregation() {
    this.logger.log('Starting daily analytics aggregation job...');
    try {
      await this.aggregationService.aggregateDailyMetrics();
      this.logger.log('Daily analytics aggregation completed successfully.');
    } catch (error) {
      this.logger.error('Failed to complete daily analytics aggregation', error);
    }
  }

  // Optionally, run hourly aggregations to keep dashboards more up to date if needed
  // @Cron(CronExpression.EVERY_HOUR)
  // async handleHourlyAggregation() { ... }
}
