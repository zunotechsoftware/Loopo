import { apiClient, ApiResponse } from './apiClient';

export type KycSlot = 'FRONT' | 'BACK' | 'SELFIE';

export interface SubmitKycPayload {
  documentType: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID';
  documentNumber: string;
  frontImageId: string;
  selfieImageId: string;
  backImageId?: string;
}

export interface AddressPayload {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  type: 'Home' | 'Work';
}

export interface PublicSellerProfile {
  id: string;
  displayName: string;
  profilePicture: string | null;
  sellerRating: number;
  reviewCount: number;
  memberSince: string;
  verifiedBadge: boolean;
  totalListings: number;
  completedSales: number;
}

export interface BlockedUser {
  id: string;
  name: string;
  avatar: string | null;
  blockedAt: string;
}

export const userApi = {
  /**
   * Uploads one KYC document image (as a real File, not a data URL): request
   * a presigned S3 URL for the given slot, PUT the file directly to it
   * (bypassing apiClient on purpose - a different origin, no Bearer token,
   * no JSON content-type), then return the resulting MediaFile id for
   * submitKyc's frontImageId/backImageId/selfieImageId.
   */
  async uploadKycImage(slot: KycSlot, file: File): Promise<string> {
    const upRes = await apiClient.post<{ uploadUrl: string; fileKey: string; mediaId: string }>('/kyc/upload-url', {
      slot,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
    if (!upRes.success || !upRes.data) {
      throw new Error(upRes.error || `Could not get an upload URL for ${slot}`);
    }
    const putRes = await fetch(upRes.data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    if (!putRes.ok) {
      throw new Error(`Failed to upload ${slot} image to storage (${putRes.status})`);
    }
    return upRes.data.mediaId;
  },

  async submitKyc(payload: SubmitKycPayload, isUpdate = false): Promise<ApiResponse<any>> {
    const body = { ...payload, submit: true };
    return isUpdate ? apiClient.put('/kyc', body) : apiClient.post('/kyc', body);
  },

  async getMyKyc(): Promise<ApiResponse<any>> {
    return apiClient.get('/kyc/me');
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

  async getPublicProfile(userId: string): Promise<ApiResponse<PublicSellerProfile>> {
    return apiClient.get<PublicSellerProfile>(`/users/public/${userId}`);
  },

  async getBlockedUsers(): Promise<ApiResponse<BlockedUser[]>> {
    return apiClient.get<BlockedUser[]>('/users/blocked');
  },

  // Block/unblock themselves live under /chat - that's the real,
  // already-in-use implementation (checked when sending messages), not a
  // separate /users endpoint.
  async blockUser(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/chat/block/${userId}`, {});
  },

  async unblockUser(userId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/chat/block/${userId}`);
  },
};
