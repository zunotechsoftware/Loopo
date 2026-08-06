import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from '../repositories/payments.repository';
import { PaymentProviderFactory } from './payment-provider.factory';
import { RedisService } from '../../../shared/redis/redis.service';
import { SubscriptionsService } from '../../subscriptions/services/subscriptions.service';
import { getQueueToken } from '@nestjs/bullmq';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentStatus, CouponType } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let repository: jest.Mocked<any>;
  let providerFactory: jest.Mocked<any>;
  let redisService: jest.Mocked<any>;
  let subscriptionsService: jest.Mocked<any>;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job_id' }),
  };

  const mockProvider = {
    createPayment: jest.fn(),
    verifyPayment: jest.fn(),
    refundPayment: jest.fn(),
    verifyWebhookSignature: jest.fn(),
  };

  beforeEach(async () => {
    const mockPaymentsRepository = {
      findProviderByCode: jest.fn(),
      createPayment: jest.fn(),
      updatePayment: jest.fn(),
      findPaymentById: jest.fn(),
      createTransaction: jest.fn(),
      createCouponRedemption: jest.fn(),
      incrementCouponUsage: jest.fn(),
      findCouponByCode: jest.fn(),
      getUserCouponRedemptionsCount: jest.fn(),
      findFeaturedPackageById: jest.fn(),
      findFeaturedPackages: jest.fn(),
      findBoostPackageById: jest.fn(),
      createUserBoost: jest.fn(),
      createAuditLog: jest.fn(),
      prisma: {
        product: { update: jest.fn() },
        featuredProduct: { create: jest.fn() },
        userSubscription: { updateMany: jest.fn() },
        coupon: { findUnique: jest.fn() },
      },
    };

    const mockProviderFactory = {
      getProvider: jest.fn().mockReturnValue(mockProvider),
    };

    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const mockSubscriptionsService = {
      activateSubscription: jest.fn(),
      configService: {
        get: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: mockPaymentsRepository },
        { provide: PaymentProviderFactory, useValue: mockProviderFactory },
        { provide: RedisService, useValue: mockRedisService },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
        { provide: getQueueToken('notification'), useValue: mockQueue },
        { provide: getQueueToken('email'), useValue: mockQueue },
        { provide: getQueueToken('webhook-processing'), useValue: mockQueue },
        { provide: getQueueToken('invoice-generation'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    repository = module.get(PaymentsRepository);
    providerFactory = module.get(PaymentProviderFactory);
    redisService = module.get(RedisService);
    subscriptionsService = module.get(SubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should throw BadRequestException if payment provider is not active', async () => {
      repository.findProviderByCode.mockResolvedValue(null);

      await expect(
        service.createPayment('user-1', {
          amount: 100,
          currency: 'INR',
          provider: 'INVALID',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully create payment intent via Stripe provider', async () => {
      const mockProviderRecord = { id: 'prov-1', code: 'STRIPE', name: 'Stripe', isActive: true };
      repository.findProviderByCode.mockResolvedValue(mockProviderRecord);
      
      const mockPaymentRecord = { id: 'pay-1', amount: 100, status: 'PENDING' };
      repository.createPayment.mockResolvedValue(mockPaymentRecord);

      mockProvider.createPayment.mockResolvedValue({
        success: true,
        providerPaymentId: 'pi_123',
        clientSecret: 'secret_123',
        status: 'PENDING',
        rawResponse: {},
      });

      repository.updatePayment.mockResolvedValue({
        id: 'pay-1',
        providerPaymentId: 'pi_123',
        status: PaymentStatus.PENDING,
      });

      const res = await service.createPayment('user-1', {
        amount: 100,
        currency: 'INR',
        provider: 'STRIPE',
      });

      expect(res.paymentId).toBe('pay-1');
      expect(res.clientSecret).toBe('secret_123');
      expect(repository.createPayment).toHaveBeenCalled();
      expect(mockProvider.createPayment).toHaveBeenCalled();
    });

    it('should apply percentage coupon correctly', async () => {
      const mockProviderRecord = { id: 'prov-1', code: 'STRIPE', name: 'Stripe', isActive: true };
      repository.findProviderByCode.mockResolvedValue(mockProviderRecord);

      const mockCoupon = {
        id: 'coupon-1',
        code: 'WELCOME10',
        type: CouponType.PERCENTAGE,
        value: 10,
        isActive: true,
        usageCount: 0,
        usageLimit: 100,
        perUserLimit: 1,
        minPurchase: 50,
      };
      repository.findCouponByCode.mockResolvedValue(mockCoupon);
      repository.getUserCouponRedemptionsCount.mockResolvedValue(0);

      repository.createPayment.mockImplementation((data) => ({
        id: 'pay-1',
        ...data,
      }));

      mockProvider.createPayment.mockResolvedValue({
        success: true,
        providerPaymentId: 'pi_123',
        status: 'PENDING',
        rawResponse: {},
      });

      repository.updatePayment.mockImplementation((id, data) => ({
        id,
        ...data,
      }));

      const res = await service.createPayment('user-1', {
        amount: 100,
        currency: 'INR',
        provider: 'STRIPE',
        couponCode: 'WELCOME10',
      });

      expect(res.discountAmount).toBe(10);
      expect(res.netAmount).toBe(90);
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully and trigger fulfillments', async () => {
      const mockPayment = {
        id: 'pay-1',
        userId: 'user-1',
        amount: 100,
        netAmount: 100,
        status: PaymentStatus.PENDING,
        provider: { code: 'STRIPE' },
        providerPaymentId: 'pi_123',
        providerOrderId: null,
        featuredPackageId: 'feat-pkg-1',
        productId: 'prod-1',
        user: { email: 'user@example.com', firstName: 'John' },
      };
      
      repository.findPaymentById.mockResolvedValue(mockPayment);
      
      mockProvider.verifyPayment.mockResolvedValue({
        success: true,
        providerPaymentId: 'pi_123',
        status: 'SUCCESS',
        rawResponse: {},
      });

      repository.findFeaturedPackageById.mockResolvedValue({
        id: 'feat-pkg-1',
        durationDays: 7,
      });

      const res = await service.verifyPayment('user-1', {
        paymentId: 'pay-1',
      });

      expect(res.success).toBe(true);
      expect(res.status).toBe('SUCCESS');
      expect(repository.updatePayment).toHaveBeenCalledWith('pay-1', {
        status: PaymentStatus.SUCCESS,
        providerPaymentId: 'pi_123',
        providerOrderId: null,
      });
      // Verification of featured activation
      expect(repository.prisma.featuredProduct.create).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalledWith('push-notification', expect.any(Object));
    });
  });
});
