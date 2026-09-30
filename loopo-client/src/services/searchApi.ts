import { apiClient, ApiResponse } from './apiClient';

export interface SearchParams {
  query?: string;
  categoryId?: string;
  subcategoryId?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sortBy?: 'createdAt' | 'price' | 'distance' | 'popular';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResultPage {
  items: any[];
  total: number;
  page?: number;
  limit?: number;
}

export const searchApi = {
  /** Real GET /search - full-text + geo-radius (haversine) + price/condition/
   * sort filters, all applied server-side. Unlike /products (productsApi.
   * getProducts, used by the home feed / category browsing), which only
   * supports an exact city-name match with no radius, price, condition or
   * sort support at all. */
  async search(params: SearchParams): Promise<ApiResponse<SearchResultPage>> {
    const q = new URLSearchParams();
    if (params.query) q.set('query', params.query);
    if (params.categoryId) q.set('categoryId', params.categoryId);
    if (params.subcategoryId) q.set('subcategoryId', params.subcategoryId);
    if (params.condition) q.set('condition', params.condition);
    if (params.minPrice !== undefined) q.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) q.set('maxPrice', String(params.maxPrice));
    if (params.city) q.set('city', params.city);
    if (params.latitude !== undefined) q.set('latitude', String(params.latitude));
    if (params.longitude !== undefined) q.set('longitude', String(params.longitude));
    if (params.radiusKm !== undefined) q.set('radiusKm', String(params.radiusKm));
    if (params.sortBy) q.set('sortBy', params.sortBy);
    if (params.sortOrder) q.set('sortOrder', params.sortOrder);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));

    const qs = q.toString();
    return apiClient.get<SearchResultPage>(qs ? `/search?${qs}` : '/search');
  },
};
