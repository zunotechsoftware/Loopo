import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReviewsController } from './controllers/reviews.controller';
import { AdminReviewsController } from './controllers/admin-reviews.controller';
import { ReviewsService } from './services/reviews.service';
import { ReviewsRepository } from './repositories/reviews.repository';
import { PrismaModule } from '../../shared/database/prisma.module';
import { ReportsModule } from '../reports/reports.module';
import { UserNotificationsModule } from '../user-notifications/user-notifications.module';
import { RatingEligibilityListener } from './listeners/rating-eligibility.listener';
import { RatingEligibilityScheduler } from './schedulers/rating-eligibility.scheduler';

// S3Service is injected directly without an explicit import: S3Module is
// @Global() (see shared/services/s3.module.ts), same as PrismaModule's
// underlying PrismaService.
@Module({
  imports: [
    PrismaModule,
    ReportsModule,
    UserNotificationsModule,
    BullModule.registerQueue(
      { name: 'rating-recalculation' },
      { name: 'trust-score-calculation' },
      { name: 'notification' },
    ),
  ],
  controllers: [ReviewsController, AdminReviewsController],
  providers: [ReviewsService, ReviewsRepository, RatingEligibilityListener, RatingEligibilityScheduler],
  exports: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
