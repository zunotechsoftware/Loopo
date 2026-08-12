import { apiClient, setAuthToken, clearAuthToken, ApiResponse } from './apiClient';

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthResponseData {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
  };
}

export const authApi = {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<AuthResponseData>('/auth/login', payload);
    if (res.success && res.data?.accessToken) {
      setAuthToken(res.data.accessToken);
    }
    return res;
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<AuthResponseData>('/auth/register', payload);
    if (res.success && res.data?.accessToken) {
      setAuthToken(res.data.accessToken);
    }
    return res;
  },

  async getProfile(): Promise<ApiResponse<any>> {
    return apiClient.get('/auth/profile');
  },

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async verifyPhoneOtp(phone: string, otp: string): Promise<ApiResponse<any>> {
    return apiClient.post('/auth/verify-phone-otp', { phone, otp });
  },

  async logout(): Promise<void> {
    clearAuthToken();
    apiClient.post('/auth/logout', {}).catch(() => {});
  },
};
