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
    return apiClient.post<Product>('/products', payload);
  },

  async getCategories(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/categories');
  },

  async getMyAds(): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>('/products/my-ads');
  },

  async markAsSold(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/products/${id}/status`, { status: 'Sold' });
  },

  async deleteAd(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/products/${id}`);
  },
};
