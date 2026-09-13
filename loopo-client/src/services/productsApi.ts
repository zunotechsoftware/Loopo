import { apiClient, ApiResponse } from './apiClient';
import { Product } from '@/types';


export interface CreateProductPayload {
  title: string;
  /** Real backend category UUID (see useCategories()) - NOT a display name. */
  categoryId: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  images: string[];
  specs?: Record<string, string>;
}

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
    country: 'India',
    state: parts[1] || 'Karnataka',
    city: parts[1] ? parts[0] : 'Bangalore',
    area: parts[0] || 'Indiranagar',
    zipCode: '560038',
  };
}


export const productsApi = {
  /** @param categoryId - real backend category UUID, not a display name (see useCategories()) */
  async getProducts(categoryId?: string, keyword?: string, city?: string): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (keyword) params.append('keyword', keyword);
    if (city) params.append('city', city);

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    return apiClient.get<Product[]>(endpoint);
  },


  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  async createProduct(payload: CreateProductPayload): Promise<ApiResponse<Product>> {
    const dto = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
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
