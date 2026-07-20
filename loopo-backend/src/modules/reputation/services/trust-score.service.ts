import { Injectable, Logger } from '@nestjs/common';
import { ReputationRepository } from '../repositories/reputation.repository';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';

@Injectable()
export class TrustScoreService {
  private readonly logger = new Logger(TrustScoreService.name);

  constructor(
    private readonly reputationRepository: ReputationRepository,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async calculateTrustScore(userId: string): Promise<number> {
    this.logger.log(`Calculating trust score for user ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (!user) return 0;

    // 1. Average Rating Factor (weight: 30)
    const sellerStats = await this.reputationRepository.getSellerStats(userId);
    const avgRating = sellerStats?.averageRating || 0;
    const averageRatingFactor = (avgRating / 5) * 30;

    // 2. Completed Transactions Factor (weight: 15)
    const completedTxns = await this.prisma.payment.count({
      where: { userId, status: 'SUCCESS' },
    });
    const transactionFactor = (Math.min(completedTxns, 100) / 100) * 15;

    // 3. Cancellation Penalty (weight: 10)
    const totalTxns = await this.prisma.payment.count({ where: { userId } });
    const cancelledTxns = await this.prisma.payment.count({
      where: { userId, status: 'FAILED' },
    });
    const cancelledRatio = totalTxns > 0 ? cancelledTxns / totalTxns : 0;
    const cancellationPenalty = cancelledRatio * 10;

    // 4. Reports Penalty (weight: 10)
    const reportsReceived = await this.prisma.report.count({
      where: { targetId: userId, targetType: 'USER', deletedAt: null },
    });
    const reportPenalty = (Math.min(reportsReceived, 10) / 10) * 10;

    // 5. Account Age Factor (weight: 10)
    const accountAgeDays = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    const accountAgeFactor = (Math.min(accountAgeDays, 365) / 365) * 10;

    // 6. KYC Bonus (weight: 10)
    const kycApproved = await this.prisma.kycDocument.count({
      where: { userId, status: 'APPROVED' },
    });
    const kycBonus = kycApproved > 0 ? 10 : 0;

    // 7. Response Time Factor (weight: 5) — based on chat response patterns
    // Simplified: use average message response time if available
    const responseTimeFactor = 3; // Default moderate score, can be enhanced with chat analytics

    // 8. Strike Penalty (weight: 10)
    const strikesAggregate = await this.prisma.userStrike.aggregate({
      where: { userId },
      _sum: { strikeCount: true },
    });
    const strikeCount = strikesAggregate._sum.strikeCount || 0;
    const strikePenalty = (Math.min(strikeCount, 5) / 5) * 10;

    // Composite Trust Score
    const rawScore = averageRatingFactor
      + transactionFactor
      - cancellationPenalty
      - reportPenalty
      + accountAgeFactor
      + kycBonus
      + responseTimeFactor
      - strikePenalty;

    const score = Math.max(0, Math.min(100, Math.round(rawScore * 100) / 100));

    // Persist
    await this.reputationRepository.upsertTrustScore(userId, {
      score,
      averageRatingFactor: Math.round(averageRatingFactor * 100) / 100,
      transactionFactor: Math.round(transactionFactor * 100) / 100,
      cancellationPenalty: Math.round(cancellationPenalty * 100) / 100,
      reportPenalty: Math.round(reportPenalty * 100) / 100,
      accountAgeFactor: Math.round(accountAgeFactor * 100) / 100,
      kycBonus,
      responseTimeFactor,
      strikePenalty: Math.round(strikePenalty * 100) / 100,
    });

    // Cache
    await this.redisService.set(`reputation:trust:${userId}`, JSON.stringify({ score }), 900);

    this.logger.log(`Trust score for ${userId}: ${score}`);
    return score;
  }
}
