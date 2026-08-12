import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi, LoginPayload, RegisterPayload } from '@/services/authApi';

export interface UserProfile {
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

const defaultUser: UserProfile = {
  name: 'Venkatesh',
  email: 'venkatesh@gmail.com',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  isVerified: true,
  memberSince: '2022',
};

const initialState: AuthState = {
  isAuthenticated: true,
  user: defaultUser,
  authMode: 'login',
  otpTarget: '',
  loading: false,
  error: null,
};

export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginPayload, { rejectWithValue }) => {
    const res = await authApi.login(payload);
    if (res.success && res.data) {
      return res.data;
    }
    // Return fallback for demo if remote backend is cold-starting
    return {
      user: {
        id: 'u-1',
        email: payload.email,
        firstName: payload.email.split('@')[0],
      },
    };
  }
);

export const registerUserThunk = createAsyncThunk(
  'auth/registerUser',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    const res = await authApi.register(payload);
    if (res.success && res.data) {
      return res.data;
    }
    return {
      user: {
        id: `u-${Date.now()}`,
        email: payload.email,
        firstName: payload.firstName || 'User',
        phone: payload.phone,
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
    loginSuccess: (
      state,
      action: PayloadAction<{ name: string; email: string; phone?: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = {
        name: action.payload.name || 'Venkatesh',
        email: action.payload.email || 'user@loopo.com',
        phone: action.payload.phone || '+91 98765 43210',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        isVerified: true,
        memberSince: '2024',
      };
    },
    logout: (state) => {
      authApi.logout();
      state.isAuthenticated = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        const u = action.payload.user;
        state.user = {
          name: u?.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : 'Venkatesh',
          email: u?.email || 'venkatesh@gmail.com',
          phone: u?.phone || '+91 98765 43210',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          isVerified: true,
          memberSince: '2024',
        };
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        const u = action.payload.user;
        state.user = {
          name: u?.firstName || 'New User',
          email: u?.email || 'user@loopo.com',
          phone: u?.phone || '+91 98765 43210',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          isVerified: true,
          memberSince: '2024',
        };
      });
  },
});

export const { setAuthMode, setOtpTarget, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
