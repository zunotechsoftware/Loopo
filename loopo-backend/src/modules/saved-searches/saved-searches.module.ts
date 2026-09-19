import { Module } from '@nestjs/common';
import { SavedSearchesController } from './controllers/saved-searches.controller';
import { SavedSearchesService } from './services/saved-searches.service';
import { UserNotificationsModule } from '../user-notifications/user-notifications.module';

@Module({
  imports: [UserNotificationsModule],
  controllers: [SavedSearchesController],
  providers: [SavedSearchesService],
  exports: [SavedSearchesService],
})
export class SavedSearchesModule {}
