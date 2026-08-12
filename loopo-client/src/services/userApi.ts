import { apiClient, ApiResponse } from './apiClient';

export interface SubmitKycPayload {
  docType: string;
  docNumber: string;
  frontPhoto?: string;
}

export interface AddressPayload {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  type: 'Home' | 'Work';
}

export const userApi = {
  async submitKyc(payload: SubmitKycPayload): Promise<ApiResponse<any>> {
    return apiClient.post('/kyc/submit', payload);
  },

  async getKycStatus(): Promise<ApiResponse<any>> {
    return apiClient.get('/kyc/status');
  },

  async getAddresses(): Promise<ApiResponse<AddressPayload[]>> {
    return apiClient.get<AddressPayload[]>('/addresses');
  },

  async addAddress(payload: AddressPayload): Promise<ApiResponse<any>> {
    return apiClient.post('/addresses', payload);
  },

  async updateNotificationSettings(settings: Record<string, boolean>): Promise<ApiResponse<any>> {
    return apiClient.put('/notification-settings', settings);
  },
};
