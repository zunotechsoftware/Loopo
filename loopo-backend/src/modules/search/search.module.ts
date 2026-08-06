import { Module } from '@nestjs/common';
import { SearchController } from './controllers/search.controller';
import { RecommendationsController } from './controllers/recommendations.controller';
import { SearchService } from './services/search.service';
import { RecommendationsService } from './services/recommendations.service';
import { PostgresSearchProvider } from './providers/postgres-search.provider';
import { PrismaModule } from '../../shared/database/prisma.module';
import { RedisModule } from '../../shared/redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import {
  SearchAnalyticsProcessor,
  TrendingCalculationProcessor,
  RecommendationRefreshProcessor,
  CacheRefreshProcessor,
} from './processors/search.processor';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    // Injecting BullMQ queues registered globally in QueuesModule
    BullModule.registerQueue(
      { name: 'search-analytics' },
      { name: 'trending-calculation' },
      { name: 'recommendation-refresh' },
      { name: 'cache-refresh' },
    ),
  ],
  controllers: [SearchController, RecommendationsController],
  providers: [
    SearchService,
    RecommendationsService,
    {
      provide: 'SEARCH_PROVIDER',
      useClass: PostgresSearchProvider,
    },
    SearchAnalyticsProcessor,
    TrendingCalculationProcessor,
    RecommendationRefreshProcessor,
    CacheRefreshProcessor,
  ],
  exports: [SearchService, RecommendationsService, 'SEARCH_PROVIDER'],
})
export class SearchModule {}
