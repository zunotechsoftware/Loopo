import { apiClient, ApiResponse } from './apiClient';

export interface CreateOfferPayload {
  productId: string;
  amount: number;
  message?: string;
}

export const offersApi = {
  /** Real POST /offers. The backend rejects this outright if the listing
   * isn't currently APPROVED (e.g. already SOLD) - see
   * OffersService.createOffer - so a sold listing can never actually
   * receive a new offer no matter what the client sends. */
  async createOffer(payload: CreateOfferPayload): Promise<ApiResponse<any>> {
    return apiClient.post('/offers', payload);
  },
  async getMadeOffers(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/offers/made');
  },
  async getReceivedOffers(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/offers/received');
  },
  async acceptOffer(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/offers/${id}/accept`, {});
  },
  async rejectOffer(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/offers/${id}/reject`, {});
  },
  async withdrawOffer(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/offers/${id}/withdraw`, {});
  },
};
