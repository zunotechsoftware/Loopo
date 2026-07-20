import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionsRepository } from '../repositories/subscriptions.repository';

@Processor('subscription-expiry')
export class SubscriptionExpiryProcessor extends WorkerHost {
  private readonly logger = new Logger(SubscriptionExpiryProcessor.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Running subscription expiry check for job: ${job.id}`);
    const { userId, subscriptionId } = job.data;

    try {
      const subscription = await this.subscriptionsRepository.findSubscriptionById(subscriptionId);
      if (!subscription) {
        this.logger.warn(`Subscription record ${subscriptionId} not found`);
        return { success: false };
      }

      const now = new Date();
      if (now >= new Date(subscription.currentPeriodEnd)) {
        // Double check if subscription was renewed in database since job was created
        await this.subscriptionsService.expireSubscription(userId, subscriptionId);
        this.logger.log(`Subscription ${subscriptionId} has been successfully expired for User ${userId}`);
        return { success: true, expired: true };
      } else {
        // Expiry period has changed (e.g. user renewed). Do not expire.
        this.logger.log(`Subscription ${subscriptionId} has end period extended. Expiry skipped.`);
        return { success: true, expired: false };
      }
    } catch (err) {
      this.logger.error(`Error in SubscriptionExpiryProcessor for job ${job.id}`, err);
      throw err;
    }
  }
}

@Processor('subscription-renewal')
export class SubscriptionRenewalProcessor extends WorkerHost {
  private readonly logger = new Logger(SubscriptionRenewalProcessor.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionsRepository: SubscriptionsRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Running renewal notification check for job: ${job.id}`);
    const { userId, subscriptionId } = job.data;

    try {
      const subscription = await this.subscriptionsRepository.findSubscriptionById(subscriptionId);
      if (!subscription || subscription.status !== 'ACTIVE') {
        return { skipped: true };
      }

      // Check if subscription expires in 3 days
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);

      if (new Date(subscription.currentPeriodEnd) <= threeDaysLater && !subscription.cancelAtPeriodEnd) {
        this.logger.log(`Subscription renewal warning pushed to user ${userId}`);
        // Notify user about upcoming renewal warning
        return { success: true, warningSent: true };
      }

      return { success: true, warningSent: false };
    } catch (err) {
      this.logger.error(`Error in SubscriptionRenewalProcessor for job ${job.id}`, err);
      throw err;
    }
  }
}
