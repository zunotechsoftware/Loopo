import { apiClient, ApiResponse } from './apiClient';

export const walletApi = {
  async getBalance(): Promise<ApiResponse<{ balance: number }>> {
    return apiClient.get<{ balance: number }>('/payments/wallet');
  },

  async addFunds(amount: number): Promise<ApiResponse<any>> {
    return apiClient.post('/payments/wallet/add', { amount });
  },

  async boostAd(adId: string, packageId: string): Promise<ApiResponse<any>> {
    return apiClient.post('/payments/boost', { adId, packageId });
  },

  async applyCoupon(code: string): Promise<ApiResponse<any>> {
    return apiClient.post('/payments/coupons/apply', { code });
  },
};
