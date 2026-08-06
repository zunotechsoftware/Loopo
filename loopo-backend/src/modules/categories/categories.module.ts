import { Module } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { AttributesController } from './controllers/attributes.controller';
import { OptionsController } from './controllers/options.controller';
import { CategoriesService } from './services/categories.service';
import { AttributesService } from './services/attributes.service';
import { CategoriesRepository } from './repositories/categories.repository';
import { AttributesRepository } from './repositories/attributes.repository';
import { PrismaModule } from '../../shared/database/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [CategoriesController, AttributesController, OptionsController],
  providers: [
    CategoriesService,
    AttributesService,
    CategoriesRepository,
    AttributesRepository,
  ],
  exports: [CategoriesService, AttributesService, CategoriesRepository, AttributesRepository],
})
export class CategoriesModule {}
