import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { ProfileImageProcessingProcessor } from '../../shared/queues/processors/profile-image-processing.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'profile-image-processing' }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, ProfileImageProcessingProcessor],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
