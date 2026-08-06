import { ProductCondition } from '@prisma/client';

export interface SearchFilters {
  categoryId?: string;
  subcategoryId?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sellerId?: string;
  isFeatured?: boolean;
  isBoosted?: boolean;
  datePosted?: '24h' | '7d' | '30d' | 'all';
  attributes?: { attributeId: string; value: string }[];
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  cursor?: string; // Support cursor pagination for infinite scrolling
}

export interface SearchResult {
  items: any[];
  total: number;
  page?: number;
  limit?: number;
  nextCursor?: string;
}

export abstract class ISearchProvider {
  abstract search(query: string, filters: SearchFilters, pagination: PaginationOptions): Promise<SearchResult>;
  abstract getSuggestions(query: string): Promise<string[]>;
}
