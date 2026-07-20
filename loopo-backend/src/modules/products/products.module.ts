import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { AdminProductsController } from './controllers/admin-products.controller';
import { ProductMediaController } from './controllers/product-media.controller';
import { ProductsService } from './services/products.service';
import { ProductsRepository } from './repositories/products.repository';
import { CategoriesModule } from '../categories/categories.module';
import { InteractionsModule } from '../interactions/interactions.module';
import { PrismaModule } from '../../shared/database/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import {
  ImageCompressionProcessor,
  ThumbnailGenerationProcessor,
  ProductExpirationProcessor,
  ViewCounterSyncProcessor,
  SearchIndexUpdateProcessor,
} from './processors/products.processor';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    CategoriesModule,
    InteractionsModule,
    // Injecting BullMQ queues registered globally in QueuesModule
    BullModule.registerQueue(
      { name: 'image-compression' },
      { name: 'thumbnail-generation' },
      { name: 'product-expiration' },
      { name: 'view-counter-sync' },
      { name: 'search-index-update' },
      { name: 'notification' },
    ),
  ],
  controllers: [
    ProductsController,
    AdminProductsController,
    ProductMediaController,
  ],
  providers: [
    ProductsService,
    ProductsRepository,
    ImageCompressionProcessor,
    ThumbnailGenerationProcessor,
    ProductExpirationProcessor,
    ViewCounterSyncProcessor,
    SearchIndexUpdateProcessor,
  ],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
