import { Injectable, Logger, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { SubscriptionsRepository } from '../repositories/subscriptions.repository';
import { PaymentsService } from '../../payments/services/payments.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SubscribeDto } from '../dto/subscribe.dto';
import { SubscriptionDuration, PaymentStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    private readonly redisService: RedisService,
    public readonly configService: ConfigService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    @InjectQueue('subscription-expiry') private readonly expiryQueue: Queue,
  ) {}

  async getPlans() {
    const cacheKey = 'subscription:plans';
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const plans = await this.subscriptionsRepository.findAllPlans();
    await this.redisService.set(cacheKey, JSON.stringify(plans), 3600); // 1 hour TTL
    return plans;
  }

  async subscribe(userId: string, dto: SubscribeDto, ipAddress?: string, userAgent?: string) {
    this.logger.log(`User ${userId} requested subscription to plan ${dto.planId}`);

    const plan = await this.subscriptionsRepository.findPlanById(dto.planId);
    if (!plan || !plan.isActive) {
      throw new BadRequestException('Requested subscription plan is invalid or inactive');
    }

    // Call PaymentsService to initialize a payment transaction
    return this.paymentsService.createPayment(
      userId,
      {
        amount: plan.price,
        currency: plan.currency,
        provider: dto.provider,
        couponCode: dto.couponCode,
        subscriptionPlanId: plan.id,
      },
      ipAddress,
      userAgent,
    );
  }

  async activateSubscription(userId: string, planId: string, paymentId?: string) {
    this.logger.log(`Activating subscription plan ${planId} for user ${userId}`);

    const plan = await this.subscriptionsRepository.findPlanById(planId);
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // 1. Calculate duration and expiration date
    const startDate = new Date();
    const endDate = new Date();
    if (plan.duration === SubscriptionDuration.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.duration === SubscriptionDuration.QUARTERLY) {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (plan.duration === SubscriptionDuration.YEARLY) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // 2. Create actual Subscription record
    const subscription = await this.subscriptionsRepository.createSubscription({
      userId,
      planId,
      status: 'ACTIVE',
      provider: paymentId ? 'STRIPE' : 'LOCAL', // default or lookup based on payment
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
      cancelAtPeriodEnd: false,
    });

    // 3. Update or create the UserSubscription limits profile
    const features = plan.features || {
      maxListings: 5,
      featuredListings: 0,
      boostCredits: 0,
      imageLimits: 5,
      videoUpload: false,
      prioritySupport: false,
      analyticsAccess: false,
      chatLimits: 100,
    };

    await this.subscriptionsRepository.updateUserSubscription(userId, {
      subscriptionId: subscription.id,
      planId: plan.id,
      maxListings: features.maxListings,
      featuredListings: features.featuredListings,
      boostCredits: features.boostCredits,
      imageLimits: features.imageLimits,
      videoUpload: features.videoUpload,
      prioritySupport: features.prioritySupport,
      analyticsAccess: features.analyticsAccess,
      chatLimits: features.chatLimits,
      expiresAt: endDate,
    }).catch(async (err) => {
      // Create if record does not exist yet (upsert)
      await this.subscriptionsRepository.createUserSubscription({
        userId,
        subscriptionId: subscription.id,
        planId: plan.id,
        maxListings: features.maxListings,
        featuredListings: features.featuredListings,
        boostCredits: features.boostCredits,
        imageLimits: features.imageLimits,
        videoUpload: features.videoUpload,
        prioritySupport: features.prioritySupport,
        analyticsAccess: features.analyticsAccess,
        chatLimits: features.chatLimits,
        expiresAt: endDate,
      });
    });

    // 4. Update the User Subscription limits in Redis Cache
    const cacheKey = `user:subscription:limits:${userId}`;
    const cachedLimits = {
      planName: plan.name,
      maxListings: features.maxListings,
      featuredListings: features.featuredListings,
      boostCredits: features.boostCredits,
      imageLimits: features.imageLimits,
      videoUpload: features.videoUpload,
      prioritySupport: features.prioritySupport,
      analyticsAccess: features.analyticsAccess,
      chatLimits: features.chatLimits,
      expiresAt: endDate,
    };
    await this.redisService.set(cacheKey, JSON.stringify(cachedLimits), 900); // 15 mins TTL

    // 5. Add subscription expiry job to BullMQ
    const msToExpiry = endDate.getTime() - startDate.getTime();
    await this.expiryQueue.add(
      'check-expiry',
      { userId, subscriptionId: subscription.id },
      { delay: msToExpiry },
    );

    // 6. Notify user
    await this.notificationQueue.add('push-notification', {
      userId,
      title: 'Subscription Activated',
      body: `Your ${plan.name} plan is now active until ${endDate.toDateString()}.`,
    });

    return subscription;
  }

  async getCurrentSubscription(userId: string) {
    const cacheKey = `user:subscription:limits:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const userSub = await this.subscriptionsRepository.findActiveUserSubscription(userId);
    if (!userSub) {
      // Default Free Tier setup
      const freePlan = await this.subscriptionsRepository.findPlanByName('Free');
      const features = freePlan?.features || {
        maxListings: 5,
        featuredListings: 0,
        boostCredits: 0,
        imageLimits: 5,
        videoUpload: false,
        prioritySupport: false,
        analyticsAccess: false,
        chatLimits: 100,
      };

      const defaultFree = {
        planName: 'Free',
        maxListings: features.maxListings,
        featuredListings: features.featuredListings,
        boostCredits: features.boostCredits,
        imageLimits: features.imageLimits,
        videoUpload: features.videoUpload,
        prioritySupport: features.prioritySupport,
        analyticsAccess: features.analyticsAccess,
        chatLimits: features.chatLimits,
        expiresAt: null,
      };

      await this.redisService.set(cacheKey, JSON.stringify(defaultFree), 900);
      return defaultFree;
    }

    const payload = {
      planName: userSub.plan.name,
      maxListings: userSub.maxListings,
      featuredListings: userSub.featuredListings,
      boostCredits: userSub.boostCredits,
      imageLimits: userSub.imageLimits,
      videoUpload: userSub.videoUpload,
      prioritySupport: userSub.prioritySupport,
      analyticsAccess: userSub.analyticsAccess,
      chatLimits: userSub.chatLimits,
      expiresAt: userSub.expiresAt,
    };

    await this.redisService.set(cacheKey, JSON.stringify(payload), 900);
    return payload;
  }

  async cancelSubscription(userId: string) {
    this.logger.log(`User ${userId} requested subscription cancellation`);

    const userSub = await this.subscriptionsRepository.findActiveUserSubscription(userId);
    if (!userSub || !userSub.subscriptionId) {
      throw new BadRequestException('You do not have an active paid subscription');
    }

    // Set cancel at period end in database
    await this.subscriptionsRepository.updateSubscription(userSub.subscriptionId, {
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
    });

    // Notify user
    await this.notificationQueue.add('push-notification', {
      userId,
      title: 'Subscription Cancelled',
      body: 'Your subscription will not renew, but will remain active until the end of your billing cycle.',
    });

    return { success: true, message: 'Subscription set to cancel at period end' };
  }

  async expireSubscription(userId: string, subscriptionId: string) {
    this.logger.log(`Expiring subscription ${subscriptionId} for user ${userId}`);

    const subscription = await this.subscriptionsRepository.findSubscriptionById(subscriptionId);
    if (!subscription) return;

    if (subscription.status === 'EXPIRED') return;

    // Check if cancellation is requested or manual renewal didn't happen
    await this.subscriptionsRepository.updateSubscription(subscriptionId, {
      status: 'EXPIRED',
    });

    // Fall back the UserSubscription limits to Free Tier
    const freePlan = await this.subscriptionsRepository.findPlanByName('Free');
    const features = freePlan?.features || {
      maxListings: 5,
      featuredListings: 0,
      boostCredits: 0,
      imageLimits: 5,
      videoUpload: false,
      prioritySupport: false,
      analyticsAccess: false,
      chatLimits: 100,
    };

    if (freePlan) {
      await this.subscriptionsRepository.updateUserSubscription(userId, {
        subscriptionId: null,
        planId: freePlan.id,
        maxListings: features.maxListings,
        featuredListings: features.featuredListings,
        boostCredits: features.boostCredits,
        imageLimits: features.imageLimits,
        videoUpload: features.videoUpload,
        prioritySupport: features.prioritySupport,
        analyticsAccess: features.analyticsAccess,
        chatLimits: features.chatLimits,
        expiresAt: null,
      });
    } else {
      // In case Free Plan is not seeded yet, delete active paid subscription link
      await this.subscriptionsRepository.deleteUserSubscription(userId).catch(() => {});
    }

    // Invalidate Redis limits cache
    await this.redisService.del(`user:subscription:limits:${userId}`);

    // Send push notification
    await this.notificationQueue.add('push-notification', {
      userId,
      title: 'Subscription Expired',
      body: 'Your paid subscription has expired. Your limits have been reverted to the Free tier.',
    });
  }
}
