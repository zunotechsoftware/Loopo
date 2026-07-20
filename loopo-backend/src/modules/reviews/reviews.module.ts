import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReviewsController } from './controllers/reviews.controller';
import { AdminReviewsController } from './controllers/admin-reviews.controller';
import { ReviewsService } from './services/reviews.service';
import { ReviewsRepository } from './repositories/reviews.repository';
import { PrismaModule } from '../../shared/database/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      { name: 'rating-recalculation' },
      { name: 'trust-score-calculation' },
      { name: 'notification' },
    ),
  ],
  controllers: [ReviewsController, AdminReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
