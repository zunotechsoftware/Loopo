import { Module } from '@nestjs/common';
import { UserNotificationsService } from './services/user-notifications.service';
import { UserNotificationsController } from './controllers/user-notifications.controller';

/** No `imports` needed: PrismaModule and SocketEmitterModule are both
 * @Global(), so PrismaService/SocketEmitterService are already injectable
 * here without adding either as a dependency. Keeping this module import-free
 * is what lets ProductsModule and the admin NotificationsModule both depend
 * on this one without any risk of a cycle. */
@Module({
  controllers: [UserNotificationsController],
  providers: [UserNotificationsService],
  exports: [UserNotificationsService],
})
export class UserNotificationsModule {}
