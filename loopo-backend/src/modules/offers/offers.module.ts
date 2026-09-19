import { Module } from '@nestjs/common';
import { OffersController } from './controllers/offers.controller';
import { OffersService } from './services/offers.service';
import { UserNotificationsModule } from '../user-notifications/user-notifications.module';

@Module({
  imports: [UserNotificationsModule],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
