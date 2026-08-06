import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { RecommendationsService } from './recommendations.service';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { getQueueToken } from '@nestjs/bullmq';
import { ISearchProvider } from '../interfaces/search.interface';
import { NotFoundException } from '@nestjs/common';

describe('Search & Recommendations Service Unit Tests', () => {
  let searchService: SearchService;
  let recsService: RecommendationsService;
  let searchProviderMock: jest.Mocked<ISearchProvider>;
  let prismaMock: any;
  let redisMock: any;
  let mockQueue: any;

  beforeEach(async () => {
    searchProviderMock = {
      search: jest.fn(),
      getSuggestions: jest.fn(),
    };

    prismaMock = {
      popularSearch: { findMany: jest.fn() },
      recentSearch: { findMany: jest.fn(), deleteMany: jest.fn() },
      recentlyViewed: { findMany: jest.fn() },
      product: { findFirst: jest.fn(), findMany: jest.fn() },
    };

    redisMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-id' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        RecommendationsService,
        { provide: 'SEARCH_PROVIDER', useValue: searchProviderMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: getQueueToken('search-analytics'), useValue: mockQueue },
      ],
    }).compile();

    searchService = module.get<SearchService>(SearchService);
    recsService = module.get<RecommendationsService>(RecommendationsService);
  });

  describe('Search Operations', () => {
    it('should return cached search results if present in Redis', async () => {
      const cachedResult = { items: [{ id: 'p-1', title: 'iPhone 15 cached' }], total: 1 };
      redisMock.get.mockResolvedValue(JSON.stringify(cachedResult));

      const res = await searchService.executeSearch('iPhone', {}, {});

      expect(res).toEqual(cachedResult);
      expect(searchProviderMock.search).not.toHaveBeenCalled();
    });

    it('should delegate search to the provider if not cached', async () => {
      redisMock.get.mockResolvedValue(null);
      const searchResult = { items: [{ id: 'p-2', title: 'iPhone 15 new' }], total: 1 };
      searchProviderMock.search.mockResolvedValue(searchResult);

      const res = await searchService.executeSearch('iPhone', {}, {});

      expect(res).toEqual(searchResult);
      expect(searchProviderMock.search).toHaveBeenCalledWith('iPhone', {}, {});
      expect(redisMock.set).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalled(); // Analytics queue triggered
    });
  });

  describe('Personalized Recommendations fallback workflow', () => {
    it('should fallback to city products and trending products if user profile has no history', async () => {
      prismaMock.recentlyViewed.findMany.mockResolvedValue([]); // No viewing history
      prismaMock.product.findMany
        .mockResolvedValueOnce([{ id: 'p-city', title: 'Listing in city' }]) // City match query
        .mockResolvedValueOnce([{ id: 'p-trend', title: 'Listing trending' }]); // Trending fallback query

      const res = await recsService.getPersonalizedRecommendations({
        userId: 'user-1',
        city: 'Mumbai',
        limit: 10,
      });

      expect(res.length).toBe(2);
      expect(res[0].id).toBe('p-city');
      expect(res[1].id).toBe('p-trend');
    });

    it('should throw NotFoundException on similar listings query of missing product ID', async () => {
      prismaMock.product.findFirst.mockResolvedValue(null);

      await expect(recsService.getSimilarProducts('missing-id')).rejects.toThrow(NotFoundException);
    });
  });
});
