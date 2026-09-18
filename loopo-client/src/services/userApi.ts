import { apiClient, ApiResponse } from './apiClient';

export type KycSlot = 'FRONT' | 'BACK' | 'SELFIE';

export interface SubmitKycPayload {
  documentType: 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID';
  documentNumber: string;
  frontImageId: string;
  selfieImageId: string;
  backImageId?: string;
}

/** Matches the real backend CreateAddressDto/UpdateAddressDto exactly -
 * the previous shape here ({name, phone, address, city, pincode, type:
 * 'Home'|'Work'}) didn't match any real field the backend accepts
 * (fullName vs name, addressLine1 vs address, postalCode vs pincode, no
 * state/country at all, wrong type enum casing) and had never actually
 * been exercised against the real endpoint. */
export interface AddressPayload {
  type: 'HOME' | 'WORK' | 'OTHER';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface Address extends AddressPayload {
  id: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  bio?: string;
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

  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return apiClient.get<Address[]>('/addresses');
  },

  async addAddress(payload: AddressPayload): Promise<ApiResponse<Address>> {
    return apiClient.post<Address>('/addresses', payload);
  },

  async updateAddress(id: string, payload: Partial<AddressPayload>): Promise<ApiResponse<Address>> {
    return apiClient.put<Address>(`/addresses/${id}`, payload);
  },

  async deleteAddress(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/addresses/${id}`);
  },

  async getMe(): Promise<ApiResponse<any>> {
    return apiClient.get('/users/me');
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<any>> {
    return apiClient.put('/users/me', payload);
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
