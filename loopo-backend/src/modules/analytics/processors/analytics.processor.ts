import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ANALYTICS_QUEUE, EVENTS } from '../constants/analytics.constants';
import { RedisAnalyticsStrategy } from '../strategies/redis-analytics.strategy';

@Processor(ANALYTICS_QUEUE)
export class AnalyticsProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalyticsProcessor.name);

  constructor(private readonly redisStrategy: RedisAnalyticsStrategy) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing analytics job ${job.name} [${job.id}]`);
    const { data } = job;

    try {
      switch (job.name) {
        case EVENTS.USER_REGISTERED:
          await this.redisStrategy.incrementMetric('user', 'global', 'newUsers');
          break;
        case EVENTS.USER_LOGGED_IN:
          await this.redisStrategy.incrementMetric('user', 'global', 'activeUsers');
          break;
        case EVENTS.PRODUCT_VIEWED:
          if (data.productId) {
            await this.redisStrategy.incrementMetric('product', data.productId, 'views');
            if (data.categoryId) {
              await this.redisStrategy.incrementMetric('category', data.categoryId, 'views');
            }
          }
          break;
        case EVENTS.PRODUCT_FAVORITED:
          if (data.productId) {
            await this.redisStrategy.incrementMetric('product', data.productId, 'favorites');
          }
          break;
        case EVENTS.PRODUCT_SHARED:
          if (data.productId) {
            await this.redisStrategy.incrementMetric('product', data.productId, 'shares');
          }
          break;
        case EVENTS.SEARCH_PERFORMED:
          if (data.query) {
            await this.redisStrategy.incrementMetric('search', data.query, 'searchCount');
            if (data.resultsCount === 0) {
              await this.redisStrategy.incrementMetric('search', data.query, 'zeroResults');
            }
          }
          break;
        case EVENTS.CHAT_STARTED:
          await this.redisStrategy.incrementMetric('chat', 'global', 'conversationsStarted');
          if (data.productId) {
            await this.redisStrategy.incrementMetric('product', data.productId, 'chatRequests');
          }
          break;
        case EVENTS.MESSAGE_SENT:
          await this.redisStrategy.incrementMetric('chat', 'global', 'messagesSent');
          break;
        case EVENTS.PAYMENT_COMPLETED:
          if (data.amount) {
            await this.redisStrategy.incrementMetric('payment', 'global', 'totalRevenue', data.amount);
          }
          if (data.type === 'SUBSCRIPTION') {
            await this.redisStrategy.incrementMetric('payment', 'global', 'subscriptions');
          } else if (data.type === 'BOOST') {
            await this.redisStrategy.incrementMetric('payment', 'global', 'boostPurchases');
          } else if (data.type === 'FEATURED') {
            await this.redisStrategy.incrementMetric('payment', 'global', 'featuredPurchases');
          }
          break;
        case EVENTS.NOTIFICATION_SENT:
          if (data.type === 'EMAIL') {
            await this.redisStrategy.incrementMetric('notification', 'global', 'emailsSent');
          } else if (data.type === 'PUSH') {
            await this.redisStrategy.incrementMetric('notification', 'global', 'pushDelivered');
          } else if (data.type === 'SMS') {
            await this.redisStrategy.incrementMetric('notification', 'global', 'smsDelivered');
          }
          break;
        case EVENTS.REVIEW_CREATED:
          await this.redisStrategy.incrementMetric('review', 'global', 'totalReviews');
          break;
        default:
          this.logger.warn(`Unknown analytics event: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process analytics job ${job.name}`, error);
      throw error;
    }
  }
}
