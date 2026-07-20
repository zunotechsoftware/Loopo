import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsRepository } from '../repositories/subscriptions.repository';
import { PaymentsService } from '../../payments/services/payments.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { SubscriptionDuration } from '@prisma/client';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let repository: jest.Mocked<any>;
  let redisService: jest.Mocked<any>;
  let paymentsService: jest.Mocked<any>;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job_id' }),
  };

  beforeEach(async () => {
    const mockSubscriptionsRepository = {
      findPlanById: jest.fn(),
      findPlanByName: jest.fn(),
      findAllPlans: jest.fn(),
      createSubscription: jest.fn(),
      updateSubscription: jest.fn(),
      findSubscriptionById: jest.fn(),
      findActiveUserSubscription: jest.fn(),
      createUserSubscription: jest.fn(),
      updateUserSubscription: jest.fn(),
      deleteUserSubscription: jest.fn(),
    };

    const mockPaymentsService = {
      createPayment: jest.fn(),
    };

    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: SubscriptionsRepository, useValue: mockSubscriptionsRepository },
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: RedisService, useValue: mockRedisService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock_value'),
          },
        },
        { provide: getQueueToken('notification'), useValue: mockQueue },
        { provide: getQueueToken('subscription-expiry'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    repository = module.get(SubscriptionsRepository);
    redisService = module.get(RedisService);
    paymentsService = module.get(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPlans', () => {
    it('should return cached plans if present', async () => {
      const mockPlans = [{ id: 'plan-1', name: 'Premium' }];
      redisService.get.mockResolvedValue(JSON.stringify(mockPlans));

      const res = await service.getPlans();
      expect(res).toEqual(mockPlans);
      expect(redisService.get).toHaveBeenCalledWith('subscription:plans');
      expect(repository.findAllPlans).not.toHaveBeenCalled();
    });

    it('should fetch plans from DB and cache them if cache is empty', async () => {
      const mockPlans = [{ id: 'plan-1', name: 'Premium' }];
      redisService.get.mockResolvedValue(null);
      repository.findAllPlans.mockResolvedValue(mockPlans);

      const res = await service.getPlans();
      expect(res).toEqual(mockPlans);
      expect(repository.findAllPlans).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledWith('subscription:plans', JSON.stringify(mockPlans), 3600);
    });
  });

  describe('activateSubscription', () => {
    it('should calculate end date, save DB record, and set limits cache', async () => {
      const mockPlan = {
        id: 'plan-1',
        name: 'Basic',
        price: 499,
        duration: SubscriptionDuration.MONTHLY,
        features: {
          maxListings: 20,
          featuredListings: 2,
          boostCredits: 1,
          imageLimits: 8,
          videoUpload: false,
          prioritySupport: false,
          analyticsAccess: false,
          chatLimits: 300,
        },
      };

      repository.findPlanById.mockResolvedValue(mockPlan);
      repository.createSubscription.mockResolvedValue({ id: 'sub-1' });
      repository.updateUserSubscription.mockResolvedValue({});

      const res = await service.activateSubscription('user-1', 'plan-1', 'pay-1');

      expect(res.id).toBe('sub-1');
      expect(repository.createSubscription).toHaveBeenCalled();
      expect(repository.updateUserSubscription).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalledWith(
        'user:subscription:limits:user-1',
        expect.stringContaining('Basic'),
        900,
      );
      expect(mockQueue.add).toHaveBeenCalledWith('check-expiry', expect.any(Object), expect.any(Object));
    });
  });

  describe('expireSubscription', () => {
    it('should revert user subscription features to Free tier', async () => {
      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-1',
        planId: 'plan-1',
        currentPeriodEnd: new Date(Date.now() - 1000), // in the past
        status: 'ACTIVE',
      };
      
      repository.findSubscriptionById.mockResolvedValue(mockSubscription);
      
      const mockFreePlan = {
        id: 'free-plan-id',
        name: 'Free',
        features: { maxListings: 5 },
      };
      repository.findPlanByName.mockResolvedValue(mockFreePlan);
      
      await service.expireSubscription('user-1', 'sub-1');

      expect(repository.updateSubscription).toHaveBeenCalledWith('sub-1', { status: 'EXPIRED' });
      expect(repository.updateUserSubscription).toHaveBeenCalledWith('user-1', expect.objectContaining({
        planId: 'free-plan-id',
      }));
      expect(redisService.del).toHaveBeenCalledWith('user:subscription:limits:user-1');
    });
  });
});
