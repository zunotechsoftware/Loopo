import { apiClient, ApiResponse } from './apiClient';

export type ReportTargetType = 'LISTING' | 'USER' | 'CHAT_MESSAGE' | 'CATEGORY' | 'SYSTEM';

export interface ReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reasonCode: string;
  customReason?: string;
  details: string;
}

export interface ReviewPayload {
  sellerId?: string;
  productId?: string;
  rating: number;
  comment: string;
}

export const interactionsApi = {
  async getFavorites(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/favorites');
  },

  async addFavorite(productId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/favorites/${productId}`, {});
  },

  async removeFavorite(productId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/favorites/${productId}`);
  },

  async submitReport(payload: ReportPayload): Promise<ApiResponse<any>> {
    return apiClient.post('/reports', payload);
  },

  async submitReview(payload: ReviewPayload): Promise<ApiResponse<any>> {
    return apiClient.post('/reviews', payload);
  },
};
