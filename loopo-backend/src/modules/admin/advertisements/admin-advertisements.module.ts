import { Module } from '@nestjs/common';
import { AdminAdvertisementsController } from './admin-advertisements.controller';
import { AdminAdvertisementsService } from './admin-advertisements.service';

@Module({
  controllers: [AdminAdvertisementsController],
  providers: [AdminAdvertisementsService],
})
export class AdminAdvertisementsModule {}
