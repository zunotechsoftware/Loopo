import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReputationController } from './controllers/reputation.controller';
import { ReputationService } from './services/reputation.service';
import { TrustScoreService } from './services/trust-score.service';
import { ReputationRepository } from './repositories/reputation.repository';
import { RatingRecalculationProcessor, TrustScoreCalculationProcessor } from './processors/reputation.processor';
import { ReviewsModule } from '../reviews/reviews.module';
import { PrismaModule } from '../../shared/database/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ReviewsModule,
    BullModule.registerQueue(
      { name: 'rating-recalculation' },
      { name: 'trust-score-calculation' },
    ),
  ],
  controllers: [ReputationController],
  providers: [
    ReputationService,
    TrustScoreService,
    ReputationRepository,
    RatingRecalculationProcessor,
    TrustScoreCalculationProcessor,
  ],
  exports: [ReputationService, TrustScoreService, ReputationRepository],
})
export class ReputationModule {}
