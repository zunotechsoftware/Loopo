import { Module } from '@nestjs/common';
import { NotificationSettingsController } from './controllers/notification-settings.controller';
import { NotificationSettingsService } from './services/notification-settings.service';
import { NotificationSettingsRepository } from './repositories/notification-settings.repository';

@Module({
  controllers: [NotificationSettingsController],
  providers: [NotificationSettingsService, NotificationSettingsRepository],
  exports: [NotificationSettingsService, NotificationSettingsRepository],
})
export class NotificationSettingsModule {}
