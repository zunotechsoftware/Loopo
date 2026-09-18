import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { PrismaModule } from '../../shared/database/prisma.module';
import { UserNotificationsModule } from '../user-notifications/user-notifications.module';

@Module({
  imports: [PrismaModule, UserNotificationsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
