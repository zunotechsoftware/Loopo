import api from './api';
import { AuthResponse } from '@/types/auth';

export const authService = {
  // Dedicated admin-portal login (not /auth/login, which the public client/
  // Flutter apps use and which now explicitly rejects admin-portal-eligible
  // accounts). /auth/admin-login is the reverse: it rejects any account
  // that is NOT admin-portal-eligible, enforced server-side - this is now
  // the real security boundary, not just the client-side hasAdminPortalAccess
  // check in the login page below.
  login: async (credentials: Record<string, string>): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/admin-login', credentials);
      return response.data.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
};
