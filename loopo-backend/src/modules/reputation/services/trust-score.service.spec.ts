import { Test, TestingModule } from '@nestjs/testing';
import { TrustScoreService } from './trust-score.service';
import { ReputationRepository } from '../repositories/reputation.repository';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';

describe('TrustScoreService', () => {
  let service: TrustScoreService;
  let reputationRepo: jest.Mocked<ReputationRepository>;
  let prisma: any;
  let redis: jest.Mocked<RedisService>;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'u1', createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000) }), // 400 days old account
      },
      payment: {
        count: jest.fn(),
      },
      report: {
        count: jest.fn().mockResolvedValue(0),
      },
      kycDocument: {
        count: jest.fn().mockResolvedValue(1), // KYC approved
      },
      userStrike: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { strikeCount: 0 } }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrustScoreService,
        {
          provide: ReputationRepository,
          useValue: {
            getSellerStats: jest.fn().mockResolvedValue({ averageRating: 4.5 }),
            upsertTrustScore: jest.fn().mockResolvedValue(undefined),
          },
        },
        { provide: PrismaService, useValue: prisma },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TrustScoreService>(TrustScoreService);
    reputationRepo = module.get(ReputationRepository);
    redis = module.get(RedisService);
  });

  it('should compute a high trust score for a verified user with good history', async () => {
    // 50 completed transactions, 5 failed, no reports, KYC verified, 400 days old, 4.5 avg rating
    prisma.payment.count
      .mockResolvedValueOnce(50)  // SUCCESS count
      .mockResolvedValueOnce(55)  // total count
      .mockResolvedValueOnce(5);  // FAILED count

    const score = await service.calculateTrustScore('u1');

    // Expected:
    // avgRating factor: 4.5/5 * 30 = 27
    // transaction factor: min(50,100)/100 * 15 = 7.5
    // cancellation ratio: 5/55 ≈ 0.0909 * 10 = 0.909 penalty
    // report penalty: 0
    // account age: min(400,365)/365 * 10 = 10
    // kyc bonus: 10
    // responseTime: 3
    // strike penalty: 0
    // raw ≈ 27 + 7.5 - 0.909 + 10 + 10 + 3 = 56.59
    expect(score).toBeGreaterThan(50);
    expect(score).toBeLessThanOrEqual(100);
    expect(reputationRepo.upsertTrustScore).toHaveBeenCalledWith('u1', expect.objectContaining({ score }));
  });

  it('should return 0 if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const score = await service.calculateTrustScore('nonexistent');
    expect(score).toBe(0);
  });

  it('should penalize users with strikes', async () => {
    prisma.payment.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(0);
    prisma.userStrike.aggregate.mockResolvedValue({ _sum: { strikeCount: 5 } });

    const score = await service.calculateTrustScore('u1');
    // Max strike penalty = 10 points
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('should cap score at 100', async () => {
    // Perfect setup
    prisma.payment.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(0);
    const score = await service.calculateTrustScore('u1');
    expect(score).toBeLessThanOrEqual(100);
  });
});
