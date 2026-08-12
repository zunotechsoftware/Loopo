import { apiClient, ApiResponse } from './apiClient';

export interface ReportPayload {
  targetId: string;
  reason: string;
  details?: string;
}

export interface ReviewPayload {
  sellerId?: string;
  productId?: string;
  rating: number;
  comment: string;
}

export const interactionsApi = {
  async submitReport(payload: ReportPayload): Promise<ApiResponse<any>> {
    return apiClient.post('/reports', payload);
  },

  async submitReview(payload: ReviewPayload): Promise<ApiResponse<any>> {
    return apiClient.post('/reviews', payload);
  },
};
