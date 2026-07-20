import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ReputationService } from '../services/reputation.service';
import { TrustScoreService } from '../services/trust-score.service';

@Processor('rating-recalculation')
export class RatingRecalculationProcessor extends WorkerHost {
  private readonly logger = new Logger(RatingRecalculationProcessor.name);

  constructor(private readonly reputationService: ReputationService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing job: ${job.name}, data: ${JSON.stringify(job.data)}`);

    if (job.name === 'recalculate-user') {
      const { userId, reviewType } = job.data;
      await this.reputationService.recalculateUserStats(userId, reviewType);
    }

    if (job.name === 'recalculate-product') {
      const { productId } = job.data;
      // Invalidate cache so next read triggers fresh computation
      await this.reputationService.getProductRating(productId);
    }
  }
}

@Processor('trust-score-calculation')
export class TrustScoreCalculationProcessor extends WorkerHost {
  private readonly logger = new Logger(TrustScoreCalculationProcessor.name);

  constructor(private readonly trustScoreService: TrustScoreService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing trust score job: ${job.name}, data: ${JSON.stringify(job.data)}`);

    if (job.name === 'recalculate-trust') {
      const { userId } = job.data;
      await this.trustScoreService.calculateTrustScore(userId);
    }
  }
}
