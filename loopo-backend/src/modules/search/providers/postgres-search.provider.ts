import { Injectable } from '@nestjs/common';
import { ISearchProvider, SearchFilters, PaginationOptions, SearchResult } from '../interfaces/search.interface';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma, ProductStatus } from '@prisma/client';

@Injectable()
export class PostgresSearchProvider implements ISearchProvider {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    query: string,
    filters: SearchFilters,
    pagination: PaginationOptions,
  ): Promise<SearchResult> {
    const skip = ((pagination.page || 1) - 1) * (pagination.limit || 20);
    const take = pagination.limit || 20;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.APPROVED,
      deletedAt: null,
    };

    // 1. Full-Text Search Keyword parsing
    if (query && query.trim() !== '') {
      // Split words and join with & for AND search
      const formatted = query
        .trim()
        .replace(/[&|!():]/g, ' ') // Strip special characters
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => `${word}`)
        .join(' & ');

      if (formatted !== '') {
        where.OR = [
          { title: { search: formatted } },
          { description: { search: formatted } },
        ];
      }
    }

    // 2. Core filter mappings
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.subcategoryId) {
      where.subcategoryId = filters.subcategoryId;
    }
    if (filters.condition) {
      where.condition = filters.condition;
    }
    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
    }

    // Price range filters
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    // Filter by posted dates
    if (filters.datePosted && filters.datePosted !== 'all') {
      const date = new Date();
      if (filters.datePosted === '24h') date.setHours(date.getHours() - 24);
      if (filters.datePosted === '7d') date.setDate(date.getDate() - 7);
      if (filters.datePosted === '30d') date.setDate(date.getDate() - 30);
      where.publishedAt = { gte: date };
    }

    // Promoting placement filter
    if (filters.isFeatured) {
      where.featuredUntil = { gte: new Date() };
    }
    if (filters.isBoosted) {
      where.boostUntil = { gte: new Date() };
    }

    // 3. Dynamic Category Attributes Filters
    if (filters.attributes && filters.attributes.length > 0) {
      where.attributes = {
        some: {
          OR: filters.attributes.map((attr) => ({
            attributeId: attr.attributeId,
            value: { equals: attr.value, mode: 'insensitive' },
          })),
        },
      };
    }

    // 4. Proximity Radius Bounding Box filters
    let originLat: number | undefined;
    let originLon: number | undefined;
    let radiusKm: number | undefined;

    if (filters.latitude !== undefined && filters.longitude !== undefined && filters.radiusKm !== undefined) {
      originLat = filters.latitude;
      originLon = filters.longitude;
      radiusKm = filters.radiusKm;

      // 1 degree latitude ~ 111km
      const latDiff = radiusKm / 111;
      // 1 degree longitude ~ 111km * cos(lat)
      const lonDiff = radiusKm / (111 * Math.cos(originLat * (Math.PI / 180)));

      where.location = {
        latitude: {
          gte: originLat - latDiff,
          lte: originLat + latDiff,
        },
        longitude: {
          gte: originLon - lonDiff,
          lte: originLon + lonDiff,
        },
      };
    } else if (filters.city) {
      where.location = {
        city: { equals: filters.city, mode: 'insensitive' },
      };
    }

    // 5. Querying Database
    let items = await this.prisma.product.findMany({
      where,
      include: {
        location: true,
        images: { orderBy: { sortOrder: 'asc' } },
        statistics: true,
      },
      // Sort logic
      orderBy: this.buildSortClause(pagination.sortBy || 'createdAt', pagination.sortOrder || 'desc'),
    });

    // 6. In-Memory Haversine post-filtering for radius (ensures precise math)
    if (originLat !== undefined && originLon !== undefined && radiusKm !== undefined) {
      items = items.filter((item) => {
        if (!item.location || item.location.latitude === null || item.location.longitude === null) {
          return false;
        }
        const dist = this.getHaversineDistance(
          originLat!,
          originLon!,
          item.location.latitude,
          item.location.longitude,
        );
        (item as any).distance = dist; // attach calculated distance
        return dist <= radiusKm!;
      });

      // Re-sort if sorted by distance
      if (pagination.sortBy === 'distance') {
        items.sort((a, b) => {
          const distA = (a as any).distance || 9999;
          const distB = (b as any).distance || 9999;
          return pagination.sortOrder === 'asc' ? distA - distB : distB - distA;
        });
      }
    }

    // Apply pagination on in-memory filtered records
    const paginatedItems = items.slice(skip, skip + take);

    return {
      items: paginatedItems,
      total: items.length,
      page: pagination.page,
      limit: pagination.limit,
    };
  }

  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim() === '') return [];

    // Fetches top keywords matching search logs
    const logs = await this.prisma.searchLog.groupBy({
      by: ['query'],
      where: {
        query: { contains: query, mode: 'insensitive' },
      },
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: 10,
    });

    return logs.map((l) => l.query);
  }

  // --- Helper math & sort routines ---

  private buildSortClause(sortBy: string, sortOrder: 'asc' | 'desc'): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case 'price':
        return { price: sortOrder };
      case 'oldest':
        return { createdAt: 'asc' };
      case 'popular':
      case 'views':
        return { viewCount: sortOrder };
      case 'createdAt':
      default:
        // Priority to featured items, then date
        return { createdAt: sortOrder };
    }
  }

  private getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
