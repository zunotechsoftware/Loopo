import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReputationRepository {
  constructor(public readonly prisma: PrismaService) {}

  async upsertSellerStats(userId: string, data: {
    averageRating: number; totalReviews: number; positivePercent: number; negativePercent: number; recentTrend: number;
  }) {
    return this.prisma.sellerStatistics.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async upsertBuyerStats(userId: string, data: {
    averageRating: number; totalReviews: number; positivePercent: number; negativePercent: number;
  }) {
    return this.prisma.buyerStatistics.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async upsertReputationScore(userId: string, data: {
    sellerScore: number; buyerScore: number; overallScore: number; verifiedBadge: boolean;
  }) {
    return this.prisma.reputationScore.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async upsertTrustScore(userId: string, data: Omit<Prisma.TrustScoreUncheckedCreateInput, 'userId'>) {
    return this.prisma.trustScore.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async getSellerStats(userId: string) {
    return this.prisma.sellerStatistics.findUnique({ where: { userId } });
  }

  async getBuyerStats(userId: string) {
    return this.prisma.buyerStatistics.findUnique({ where: { userId } });
  }

  async getReputationScore(userId: string) {
    return this.prisma.reputationScore.findUnique({ where: { userId } });
  }

  async getTrustScore(userId: string) {
    return this.prisma.trustScore.findUnique({ where: { userId } });
  }
}
