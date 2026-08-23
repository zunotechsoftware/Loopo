import { Module } from '@nestjs/common';
import { BrandsController } from './controllers/brands.controller';
import { BrandsService } from './services/brands.service';
import { BrandsRepository } from './repositories/brands.repository';
import { PrismaModule } from '../../shared/database/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [BrandsController],
  providers: [BrandsService, BrandsRepository],
  exports: [BrandsService, BrandsRepository],
})
export class BrandsModule {}
