import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RedisService } from '../../../shared/redis/redis.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getSimilarProducts(productId: string, limit = 6) {
    const cacheKey = `recommendations:similar:${productId}`;
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err) {}

    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException(`Listing with ID ${productId} not found`);
    }

    // Similar query matches items under same category, active status, excluding itself
    const similar = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        status: ProductStatus.APPROVED,
        id: { not: productId },
        deletedAt: null,
      },
      include: {
        location: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    try {
      await this.redisService.set(cacheKey, JSON.stringify(similar), 3600); // 1 hour TTL
    } catch (err) {}

    return similar;
  }

  async getPersonalizedRecommendations(params: { userId?: string; city?: string; limit?: number }) {
    const { userId, city, limit = 10 } = params;
    const cacheKey = `recommendations:personalized:${userId || 'anon'}:${city || 'none'}`;

    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err) {}

    let recommended: any[] = [];

    // 1. If user is logged-in, fetch recent categories browsed from recently_viewed history
    if (userId) {
      const history = await this.prisma.recentlyViewed.findMany({
        where: { userId },
        include: {
          product: true,
        },
        orderBy: { viewedAt: 'desc' },
        take: 5,
      });

      if (history.length > 0) {
        const categoryIds = Array.from(new Set(history.map((h) => h.product.categoryId)));
        recommended = await this.prisma.product.findMany({
          where: {
            categoryId: { in: categoryIds },
            status: ProductStatus.APPROVED,
            deletedAt: null,
            // Exclude items they already viewed
            id: { notIn: history.map((h) => h.productId) },
          },
          include: {
            location: true,
            images: { orderBy: { sortOrder: 'asc' } },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        });
      }
    }

    // 2. Proximity/City-based recommended listings fallback
    if (recommended.length < limit && city) {
      const cityProducts = await this.prisma.product.findMany({
        where: {
          status: ProductStatus.APPROVED,
          deletedAt: null,
          location: {
            city: { equals: city, mode: 'insensitive' },
          },
          id: { notIn: recommended.map((r) => r.id) },
        },
        include: {
          location: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit - recommended.length,
      });

      recommended = [...recommended, ...cityProducts];
    }

    // 3. Global Trending/Popularity fallback (sorted by viewCount)
    if (recommended.length < limit) {
      const trending = await this.prisma.product.findMany({
        where: {
          status: ProductStatus.APPROVED,
          deletedAt: null,
          id: { notIn: recommended.map((r) => r.id) },
        },
        include: {
          location: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: {
          viewCount: 'desc',
        },
        take: limit - recommended.length,
      });

      recommended = [...recommended, ...trending];
    }

    try {
      await this.redisService.set(cacheKey, JSON.stringify(recommended), 600); // 10 minutes cache
    } catch (err) {}

    return recommended;
  }
}
