import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsRepository } from '../repositories/payments.repository';
import { PaymentProviderFactory } from './payment-provider.factory';
import { RedisService } from '../../../shared/redis/redis.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';
import { CreateRefundDto } from '../dto/create-refund.dto';
import { SubscriptionsService } from '../../subscriptions/services/subscriptions.service';
import { PaymentStatus, RefundStatus, CouponType } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly providerFactory: PaymentProviderFactory,
    private readonly redisService: RedisService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('webhook-processing') private readonly webhookQueue: Queue,
    @InjectQueue('invoice-generation') private readonly invoiceQueue: Queue,
    @Inject(forwardRef(() => SubscriptionsService))
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async createPayment(userId: string, dto: CreatePaymentDto, ipAddress?: string, userAgent?: string) {
    this.logger.log(`Initiating payment for user: ${userId}, amount: ${dto.amount} ${dto.currency}`);

    // 1. Resolve payment provider
    const providerRecord = await this.paymentsRepository.findProviderByCode(dto.provider);
    if (!providerRecord || !providerRecord.isActive) {
      throw new BadRequestException(`Payment provider ${dto.provider} is disabled or invalid`);
    }

    // 2. Validate Coupon and Apply Discount if present
    let discountAmount = 0;
    let netAmount = dto.amount;
    let couponId: string | null = null;

    if (dto.couponCode) {
      const coupon = await this.validateCouponInternal(dto.couponCode, dto.amount, userId);
      couponId = coupon.id;

      if (coupon.type === CouponType.PERCENTAGE) {
        discountAmount = (dto.amount * coupon.value) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = coupon.value;
      }

      netAmount = Math.max(0, dto.amount - discountAmount);
    }

    // 3. Create payment record in DB first to get an ID for metadata
    const payment = await this.paymentsRepository.createPayment({
      userId,
      providerId: providerRecord.id,
      amount: dto.amount,
      currency: dto.currency,
      status: PaymentStatus.PENDING,
      subscriptionId: dto.subscriptionPlanId ? undefined : null, // Will map subscription record later
      featuredPackageId: dto.featuredPackageId || null,
      boostPackageId: dto.boostPackageId || null,
      productId: dto.productId || null,
      couponId,
      discountAmount,
      netAmount,
      ipAddress,
      userAgent,
    });

    // 4. Create payment on Provider gateway
    const provider = this.providerFactory.getProvider(dto.provider);
    const providerResponse = await provider.createPayment(netAmount, dto.currency, {
      paymentId: payment.id,
      userId,
      subscriptionPlanId: dto.subscriptionPlanId || '',
      featuredPackageId: dto.featuredPackageId || '',
      boostPackageId: dto.boostPackageId || '',
      productId: dto.productId || '',
    });

    if (!providerResponse.success) {
      await this.paymentsRepository.updatePayment(payment.id, {
        status: PaymentStatus.FAILED,
      });
      throw new InternalServerErrorException('Failed to initiate transaction on payment gateway');
    }

    // 5. Update payment record with provider order/payment details
    const updatedPayment = await this.paymentsRepository.updatePayment(payment.id, {
      providerPaymentId: providerResponse.providerPaymentId || null,
      providerOrderId: providerResponse.providerOrderId || null,
      status: (providerResponse.status as PaymentStatus) || PaymentStatus.PENDING,
      metadata: providerResponse.rawResponse as any,
    });

    // 6. Log audit trail
    await this.paymentsRepository.createAuditLog({
      userId,
      action: 'PAYMENT_INITIATED',
      entity: 'Payment',
      entityId: payment.id,
      ipAddress,
      userAgent,
      newValues: { paymentId: payment.id, amount: dto.amount, netAmount } as any,
    });

    return {
      paymentId: updatedPayment.id,
      providerPaymentId: updatedPayment.providerPaymentId,
      providerOrderId: updatedPayment.providerOrderId,
      clientSecret: providerResponse.clientSecret,
      netAmount,
      discountAmount,
    };
  }

  async verifyPayment(userId: string, dto: VerifyPaymentDto, ipAddress?: string, userAgent?: string) {
    this.logger.log(`Verifying payment ID: ${dto.paymentId} for user: ${userId}`);

    const payment = await this.paymentsRepository.findPaymentById(dto.paymentId);
    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('Unauthorized payment verification request');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { success: true, status: payment.status };
    }

    // Resolve provider interface
    const provider = this.providerFactory.getProvider(payment.provider.code);
    const verificationResponse = await provider.verifyPayment(
      dto.providerPaymentId || payment.providerPaymentId || '',
      dto.providerOrderId || payment.providerOrderId || '',
      dto.signature,
    );

    if (verificationResponse.success) {
      // 1. Transaction succeeded!
      await this.paymentsRepository.updatePayment(payment.id, {
        status: PaymentStatus.SUCCESS,
        providerPaymentId: verificationResponse.providerPaymentId || payment.providerPaymentId,
        providerOrderId: verificationResponse.providerOrderId || payment.providerOrderId,
      });

      // 2. Write payment transaction record
      await this.paymentsRepository.createTransaction({
        paymentId: payment.id,
        transactionType: 'CHARGE',
        amount: payment.netAmount,
        status: 'succeeded',
        providerTransactionId: verificationResponse.providerPaymentId || payment.providerPaymentId,
        rawResponse: verificationResponse.rawResponse as any,
      });

      // 3. Redeem coupon if applicable
      if (payment.couponId) {
        await this.paymentsRepository.createCouponRedemption({
          couponId: payment.couponId,
          userId: payment.userId,
          paymentId: payment.id,
        });
        await this.paymentsRepository.incrementCouponUsage(payment.couponId);
        // Invalidate coupon caches
        const coupon = await this.paymentsRepository.prisma.coupon.findUnique({ where: { id: payment.couponId } });
        if (coupon) {
          const cacheKeyPattern = `coupon:validate:${coupon.code}:*`;
          // We can delete pattern keys or rely on TTL
          await this.redisService.del(`coupon:validate:${coupon.code}:${payment.amount}:${payment.userId}`);
        }
      }

      // 4. Activate Products Features / Subscriptions / Boosts
      await this.fulfillPurchase(payment);

      // 5. Send push notification & trigger invoice/receipt background workers
      await this.notificationQueue.add('push-notification', {
        userId: payment.userId,
        title: 'Payment Successful',
        body: `Your payment of ${payment.currency} ${payment.netAmount} was completed successfully.`,
      });

      await this.invoiceQueue.add('generate-invoice', { paymentId: payment.id });
      await this.emailQueue.add('send-receipt', {
        email: payment.user.email,
        firstName: payment.user.firstName,
        paymentId: payment.id,
        amount: payment.netAmount,
        currency: payment.currency,
      });

      // 6. Audit logging
      await this.paymentsRepository.createAuditLog({
        userId,
        action: 'PAYMENT_VERIFIED_SUCCESS',
        entity: 'Payment',
        entityId: payment.id,
        ipAddress,
        userAgent,
        newValues: { status: 'SUCCESS' } as any,
      });

      return { success: true, status: 'SUCCESS' };
    } else {
      // Verification failed
      await this.paymentsRepository.updatePayment(payment.id, {
        status: PaymentStatus.FAILED,
      });

      await this.notificationQueue.add('push-notification', {
        userId: payment.userId,
        title: 'Payment Failed',
        body: `Your payment of ${payment.currency} ${payment.netAmount} could not be processed.`,
      });

      await this.paymentsRepository.createAuditLog({
        userId,
        action: 'PAYMENT_VERIFIED_FAILED',
        entity: 'Payment',
        entityId: payment.id,
        ipAddress,
        userAgent,
        newValues: { status: 'FAILED' } as any,
      });

      return { success: false, status: 'FAILED' };
    }
  }

  async getPaymentHistory(userId: string) {
    return this.paymentsRepository.findPaymentsByUser(userId);
  }

  async getPaymentById(userId: string, id: string) {
    const payment = await this.paymentsRepository.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.userId !== userId) {
      throw new BadRequestException('Unauthorized check on payment record');
    }
    return payment;
  }

  async applyCoupon(userId: string, dto: ApplyCouponDto) {
    // Check validation from cache first
    const cacheKey = `coupon:validate:${dto.code}:${dto.amount}:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const coupon = await this.validateCouponInternal(dto.code, dto.amount, userId);

    let discountAmount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = (dto.amount * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.value;
    }

    const finalAmount = Math.max(0, dto.amount - discountAmount);

    const result = {
      couponId: coupon.id,
      code: coupon.code,
      discountAmount,
      finalAmount,
    };

    // Cache the outcome for 5 mins
    await this.redisService.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  async processRefund(adminUserId: string, dto: CreateRefundDto, ipAddress?: string, userAgent?: string) {
    this.logger.log(`Admin ${adminUserId} triggering refund for Payment: ${dto.paymentId}`);

    const payment = await this.paymentsRepository.findPaymentById(dto.paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCESS && payment.status !== PaymentStatus.PARTIALLY_REFUNDED) {
      throw new BadRequestException('Payment is not refundable in its current state');
    }

    if (dto.amount > payment.netAmount) {
      throw new BadRequestException('Refund amount exceeds the net charged amount');
    }

    // 1. Resolve Provider
    const provider = this.providerFactory.getProvider(payment.provider.code);
    const refundRes = await provider.refundPayment(
      payment.providerPaymentId || '',
      dto.amount,
      dto.reason,
    );

    if (!refundRes.success) {
      throw new InternalServerErrorException('Refund declined by payment gateway provider');
    }

    // 2. Create Refund Record in database
    const refund = await this.paymentsRepository.createRefund({
      paymentId: payment.id,
      amount: dto.amount,
      reason: dto.reason || null,
      status: RefundStatus.SUCCESS,
      providerRefundId: refundRes.providerRefundId || null,
      rawResponse: refundRes.rawResponse as any,
      createdById: adminUserId,
    });

    // 3. Update payment record status
    const isFullRefund = dto.amount === payment.netAmount;
    await this.paymentsRepository.updatePayment(payment.id, {
      status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
    });

    // 4. Log transactions
    await this.paymentsRepository.createTransaction({
      paymentId: payment.id,
      transactionType: 'REFUND',
      amount: dto.amount,
      status: 'succeeded',
      providerTransactionId: refundRes.providerRefundId,
      rawResponse: refundRes.rawResponse as any,
    });

    // 5. Audit Logging
    await this.paymentsRepository.createAuditLog({
      userId: adminUserId,
      action: 'ADMIN_REFUND_SUCCESS',
      entity: 'Payment',
      entityId: payment.id,
      ipAddress,
      userAgent,
      newValues: { refundId: refund.id, amount: dto.amount } as any,
    });

    return refund;
  }

  async getRefundHistory() {
    return this.paymentsRepository.findRefunds();
  }

  async handleWebhook(providerCode: string, rawBody: string, headers: Record<string, any>) {
    this.logger.log(`Received webhook webhook signature from: ${providerCode}`);

    // Verify webhook signature
    const provider = this.providerFactory.getProvider(providerCode);
    const webhookSecret = this.configService.get<string>(`${providerCode}_WEBHOOK_SECRET`) || '';
    
    const isValid = provider.verifyWebhookSignature(rawBody, headers, webhookSecret);
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature verification');
    }

    // Parse event payload
    const payload = JSON.parse(rawBody);
    let providerEventId: string | null = null;
    let eventType = 'unknown';

    if (providerCode === 'STRIPE') {
      providerEventId = payload.id;
      eventType = payload.type;
    } else if (providerCode === 'RAZORPAY') {
      providerEventId = payload.account_id;
      eventType = payload.event;
    } else if (providerCode === 'PAYPAL') {
      providerEventId = payload.id;
      eventType = payload.event_type;
    }

    // 1. Idempotency check
    if (providerEventId) {
      const existing = await this.paymentsRepository.findWebhookLogByProviderEvent(providerCode, providerEventId);
      if (existing) {
        this.logger.log(`Webhook already logged/processed: ${providerCode} event ID: ${providerEventId}`);
        return { duplicate: true };
      }
    }

    // 2. Save webhook event log
    const webhookLog = await this.paymentsRepository.createWebhookLog({
      provider: providerCode,
      providerEventId,
      eventType,
      payload: payload as any,
      status: 'PENDING',
    });

    // 3. Queue webhook event processing asynchronously using BullMQ
    await this.webhookQueue.add('process-webhook', {
      webhookLogId: webhookLog.id,
      provider: providerCode,
      eventType,
    });

    return { queued: true, webhookLogId: webhookLog.id };
  }

  // Helper method: apply business logic post payment completion
  private async fulfillPurchase(payment: any) {
    const prisma = this.paymentsRepository.prisma;

    // Feature purchase A: subscription activation
    // If this payment has custom metadata or plan attributes mapping subscription
    const metadataObj: any = payment.metadata || {};
    const subscriptionPlanId = metadataObj.subscriptionPlanId || null;

    if (subscriptionPlanId) {
      await this.subscriptionsService.activateSubscription(payment.userId, subscriptionPlanId, payment.id);
    }

    // Feature purchase B: featured package highlight
    if (payment.featuredPackageId && payment.productId) {
      const featuredPackage = await this.paymentsRepository.findFeaturedPackageById(payment.featuredPackageId);
      if (featuredPackage) {
        const durationDays = featuredPackage.durationDays;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);

        // Update product featured expiry
        await prisma.product.update({
          where: { id: payment.productId },
          data: {
            featuredUntil: endDate,
          },
        });

        // Insert record in featured product ads
        await prisma.featuredProduct.create({
          data: {
            productId: payment.productId,
            packageId: featuredPackage.id,
            durationDays,
            startDate,
            endDate,
            isActive: true,
          },
        });

        this.logger.log(`Fulfill: Activated Featured Listing for Product ${payment.productId}`);
      }
    }

    // Feature purchase C: boost package activation
    if (payment.boostPackageId) {
      const boostPackage = await this.paymentsRepository.findBoostPackageById(payment.boostPackageId);
      if (boostPackage) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + boostPackage.durationDays);

        // Insert user boosts record
        await this.paymentsRepository.createUserBoost({
          userId: payment.userId,
          packageId: boostPackage.id,
          creditsGranted: boostPackage.creditAmount,
          expiresAt,
        });

        // Update active user subscription credits
        await prisma.userSubscription.updateMany({
          where: { userId: payment.userId },
          data: {
            boostCredits: {
              increment: boostPackage.creditAmount,
            },
          },
        });

        this.logger.log(`Fulfill: Granted ${boostPackage.creditAmount} Boost Credits to user ${payment.userId}`);
      }
    }
  }

  private async validateCouponInternal(code: string, purchaseAmount: number, userId: string) {
    const coupon = await this.paymentsRepository.findCouponByCode(code);
    if (!coupon) {
      throw new BadRequestException('Discount coupon is invalid, inactive, or does not exist');
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon total usage limit reached');
    }

    if (coupon.minPurchase !== null && purchaseAmount < coupon.minPurchase) {
      throw new BadRequestException(`Coupon requires a minimum purchase amount of ${coupon.minPurchase}`);
    }

    const userRedemptions = await this.paymentsRepository.getUserCouponRedemptionsCount(userId, coupon.id);
    if (userRedemptions >= coupon.perUserLimit) {
      throw new BadRequestException('You have reached the maximum allowed redemptions for this coupon');
    }

    return coupon;
  }

  // Get direct access to NestJS Config Service inside class
  private get configService(): ConfigService {
    return this.subscriptionsService.configService;
  }
}
