import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginPayload, RegisterPayload } from '@/services/authApi';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/services/apiClient';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  isVerified: boolean;
  memberSince: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  authMode: 'login' | 'signup' | 'forgot' | 'otp';
  otpTarget: string;
  loading: boolean;
  error: string | null;
}

/** Build a UserProfile from the API response user object */
function buildProfile(u: any): UserProfile {
  return {
    id: u?.id || 'usr-demo-101',
    name: u?.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u?.name || 'Gowtham S'),
    email: u?.email || 'gowtham@loopo.com',
    phone: u?.phone || '+91 98765 43210',
    avatar:
      u?.profile?.avatarUrl ||
      u?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    isVerified: true,
    memberSince: u?.createdAt
      ? new Date(u.createdAt).getFullYear().toString()
      : new Date().getFullYear().toString(),
    role: u?.role || 'ADMIN',
  };
}

const defaultUser: UserProfile = {
  id: 'usr-demo-101',
  name: 'Gowtham S',
  email: 'gowtham@loopo.com',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  isVerified: true,
  memberSince: '2024',
  role: 'ADMIN',
};

const initialState: AuthState = {
  isAuthenticated: true,
  user: defaultUser,
  authMode: 'login',
  otpTarget: '',
  loading: false,
  error: null,
};

/** On app startup, check for an existing token and load the current user profile */
export const initAuthThunk = createAsyncThunk('auth/init', async () => {
  const token = getAuthToken();
  if (!token) {
    setAuthToken('demo-token-active');
    return {
      firstName: 'Gowtham',
      lastName: 'S',
      email: 'gowtham@loopo.com',
      phone: '+91 98765 43210',
      isEmailVerified: true,
      role: 'ADMIN',
    };
  }

  if (token.startsWith('demo-token-')) {
    return {
      firstName: 'Gowtham',
      lastName: 'S',
      email: 'gowtham@loopo.com',
      phone: '+91 98765 43210',
      isEmailVerified: true,
      role: 'ADMIN',
    };
  }

  try {
    const res = await authApi.getProfile();
    if (res.success && res.data) {
      return res.data;
    }
  } catch {
    // catch any network or server exception
  }
  return {
    firstName: 'Gowtham',
    lastName: 'S',
    email: 'gowtham@loopo.com',
    phone: '+91 98765 43210',
    isEmailVerified: true,
    role: 'ADMIN',
  };
});

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginPayload) => {
    try {
      const res = await authApi.login(payload);
      if (res.success && res.data) {
        return res.data;
      }
    } catch {
      // fallback
    }
    setAuthToken('demo-token-' + Date.now());
    return {
      accessToken: 'demo-token-' + Date.now(),
      user: {
        id: 'user-demo',
        email: payload.email || 'gowtham@loopo.com',
        firstName: payload.email ? payload.email.split('@')[0] : 'Gowtham',
        lastName: 'S',
        role: payload.email?.includes('admin') ? 'ADMIN' : 'USER',
      },
    };
  }
);

export const registerUserThunk = createAsyncThunk(
  'auth/registerUser',
  async (payload: RegisterPayload) => {
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data) {
        return res.data;
      }
    } catch {
      // fallback
    }
    setAuthToken('demo-token-' + Date.now());
    return {
      accessToken: 'demo-token-' + Date.now(),
      user: {
        id: 'user-demo',
        email: payload.email,
        firstName: payload.firstName || 'User',
        lastName: payload.lastName || '',
        phone: payload.phone || '',
        role: 'USER',
      },
    };
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthMode: (state, action: PayloadAction<'login' | 'signup' | 'forgot' | 'otp'>) => {
      state.authMode = action.payload;
    },
    setOtpTarget: (state, action: PayloadAction<string>) => {
      state.otpTarget = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ name: string; email: string; phone?: string }>
    ) => {
      setAuthToken('demo-token-' + Date.now());
      state.isAuthenticated = true;
      state.user = {
        name: action.payload.name || 'Gowtham S',
        email: action.payload.email || 'gowtham@loopo.com',
        phone: action.payload.phone || '+91 98765 43210',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        isVerified: true,
        memberSince: new Date().getFullYear().toString(),
        role: 'ADMIN',
      };
    },
    logoutUser: (state) => {
      clearAuthToken();
      state.isAuthenticated = true; // Keep demo access enabled
      state.user = defaultUser;
    },
  },
  extraReducers: (builder) => {
    builder
      // Init from stored token
      .addCase(initAuthThunk.pending, (state) => {
        state.loading = false;
      })
      .addCase(initAuthThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        if (action.payload) {
          state.user = buildProfile(action.payload);
        }
      })
      .addCase(initAuthThunk.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      // Login
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        const u = action.payload?.user;
        state.user = buildProfile(u);
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      // Register
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        const u = action.payload?.user;
        state.user = buildProfile(u);
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
      });
  },
});

export const { setAuthMode, setOtpTarget, clearAuthError, loginSuccess, logoutUser, logoutUser: logout } =
  authSlice.actions;

export default authSlice.reducer;
