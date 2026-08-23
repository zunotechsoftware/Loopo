import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginPayload, RegisterPayload } from '@/services/authApi';
import { getAuthToken, clearAuthToken } from '@/services/apiClient';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  isVerified: boolean;
  memberSince: string;
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
    id: u?.id,
    name: u?.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u?.name || 'User'),
    email: u?.email || '',
    phone: u?.phone || '',
    avatar:
      u?.profile?.avatarUrl ||
      u?.avatarUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    isVerified: u?.isEmailVerified || u?.isPhoneVerified || false,
    memberSince: u?.createdAt
      ? new Date(u.createdAt).getFullYear().toString()
      : new Date().getFullYear().toString(),
  };
}

const initialState: AuthState = {
  // Start as unauthenticated — token check happens at app startup via initAuthThunk
  isAuthenticated: false,
  user: null,
  authMode: 'login',
  otpTarget: '',
  loading: false,
  error: null,
};

/** On app startup, check for an existing token and load the current user profile */
export const initAuthThunk = createAsyncThunk('auth/init', async () => {
  const token = getAuthToken();
  if (!token) return null;

  const res = await authApi.getProfile();
  if (res.success && res.data) {
    return res.data;
  }
  // Token might be expired — clear it
  clearAuthToken();
  return null;
});

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginPayload, { rejectWithValue }) => {
    const res = await authApi.login(payload);
    if (res.success && res.data) {
      return res.data;
    }
    return rejectWithValue(res.error || 'Login failed');
  }
);

export const registerUserThunk = createAsyncThunk(
  'auth/registerUser',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    const res = await authApi.register(payload);
    if (res.success && res.data) {
      return res.data;
    }
    return rejectWithValue(res.error || 'Registration failed');
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
    loginSuccess: (
      state,
      action: PayloadAction<{ name: string; email: string; phone?: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = {
        name: action.payload.name || 'User',
        email: action.payload.email || 'user@loopo.com',
        phone: action.payload.phone || '',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        isVerified: true,
        memberSince: new Date().getFullYear().toString(),
      };
    },
    logout: (state) => {
      authApi.logout();
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Init from stored token
      .addCase(initAuthThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(initAuthThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = buildProfile(action.payload);
        }
      })
      .addCase(initAuthThunk.rejected, (state) => {
        state.loading = false;
      })
      // Login
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        const payload = action.payload as any;
        // Backend returns { tokens: { accessToken }, user: {...} }
        const u = payload?.user || payload;
        state.user = buildProfile(u);
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        const payload = action.payload as any;
        const u = payload?.user || payload;
        state.user = buildProfile(u);
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setAuthMode, setOtpTarget, loginSuccess, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
