import api from './api';
import { AuthResponse } from '@/types/auth';

export const authService = {
  login: async (credentials: Record<string, string>): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
};
