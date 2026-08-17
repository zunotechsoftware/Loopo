import { apiClient, ApiResponse } from './apiClient';
import { Product } from '@/mockData/products';

export interface CreateProductPayload {
  title: string;
  category: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  images: string[];
  specs?: Record<string, string>;
}

const CATEGORY_UUID_MAP: Record<string, string> = {
  Mobiles: '4fb6bfe2-6962-4fca-8667-841f184a9c93',
  Vehicles: '2d1d3b26-a3b1-4cd7-b223-309af3264425',
  Cars: '2d1d3b26-a3b1-4cd7-b223-309af3264425',
  Bikes: '6af6cee3-9b4a-4595-b800-74c72e805bf8',
  Electronics: '5b988561-9148-4308-824d-a1ffc13ba8d6',
  Furniture: '806a9037-db1d-4414-a6f8-4449a013c694',
  Fashion: '04c988cc-50d5-4193-b174-cec7455e6374',
  Books: '963a9ff0-0c67-43a8-ab9a-bdf71080a0ab',
  'Home & Living': '55a3350d-5503-4906-93d3-f57c60326cbd',
};

function mapConditionToEnum(cond: string): 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' {
  const normalized = (cond || '').toUpperCase().replace(/\s+/g, '_');
  if (normalized.includes('BRAND') || normalized === 'NEW') return 'NEW';
  if (normalized.includes('LIKE')) return 'LIKE_NEW';
  if (normalized.includes('FAIR')) return 'FAIR';
  return 'GOOD';
}

function parseLocationString(locStr: string) {
  const parts = (locStr || '').split(',').map((p) => p.trim()).filter(Boolean);
  return {
    city: parts[0] || 'Bangalore',
    state: parts[1] || 'Karnataka',
    country: parts[2] || 'India',
  };
}

export const productsApi = {
  async getProducts(category?: string, query?: string): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    if (category && category !== 'All Categories') params.append('category', category);
    if (query) params.append('search', query);

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    return apiClient.get<Product[]>(endpoint);
  },

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  async createProduct(payload: CreateProductPayload): Promise<ApiResponse<Product>> {
    const categoryId =
      CATEGORY_UUID_MAP[payload.category] ||
      (payload.category.length > 20 ? payload.category : '4fb6bfe2-6962-4fca-8667-841f184a9c93');

    const dto = {
      title: payload.title,
      description: payload.description,
      categoryId,
      condition: mapConditionToEnum(payload.condition),
      price: Number(payload.price) || 0,
      location: parseLocationString(payload.location),
    };

    return apiClient.post<Product>('/products', dto);
  },

  async getCategories(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/categories');
  },

  async getMyAds(): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>('/products/my');
  },

  async markAsSold(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/products/${id}/status`, { status: 'Sold' });
  },

  async deleteAd(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/products/${id}`);
  },
};
