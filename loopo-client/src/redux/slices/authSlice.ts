import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@/types';
import { authApi, LoginPayload, RegisterPayload } from '@/services/authApi';
import { getAuthToken, setAuthToken, clearAuthToken } from '@/services/apiClient';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  authMode: 'login' | 'signup' | 'forgot' | 'otp';
  otpTarget: string;
  loading: boolean;
  error: string | null;
}

/** Build a UserProfile from the API response user object */
function buildProfile(u: any): UserProfile | null {
  if (!u) return null;
  return {
    id: u.id || u._id || '',
    name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.name || 'User'),
    email: u.email || '',
    phone: u.phone || '',
    avatar: u.profile?.avatarUrl || u.avatarUrl || '',
    isVerified: Boolean(u.isEmailVerified || u.isKycVerified),
    memberSince: u.createdAt
      ? new Date(u.createdAt).getFullYear().toString()
      : new Date().getFullYear().toString(),
    // The real API returns `roles: string[]`, never a singular `role` -
    // reading `u.role` here always fell through to the 'USER' fallback
    // for every account, including real ADMIN/SUPER_ADMIN ones.
    roles: Array.isArray(u.roles) ? u.roles : ['USER'],
  };
}

function loadLocalUser(): UserProfile | null {

  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('loopo_user_profile');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveLocalUser(user: UserProfile | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem('loopo_user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('loopo_user_profile');
    }
  } catch {
    // ignore quota error
  }
}

const initialToken = typeof window !== 'undefined' ? getAuthToken() : null;
const initialUser = loadLocalUser();

const initialState: AuthState = {
  isAuthenticated: Boolean(initialToken || initialUser),
  user: initialUser,
  authMode: 'login',
  otpTarget: '',
  loading: false,
  error: null,
};


/** On app startup, check for an existing token and load the current user profile */
export const initAuthThunk = createAsyncThunk('auth/init', async (_, { rejectWithValue }) => {
  const token = getAuthToken();
  if (!token) {
    return rejectWithValue('No token found');
  }

  const res = await authApi.getProfile();
  if (res.success && res.data) {
    return res.data;
  }
  clearAuthToken();
  return rejectWithValue(res.error || 'Failed to authenticate user');
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
    if (res.success) {
      if (payload.password) {
        const loginRes = await authApi.login({ email: payload.email, password: payload.password });
        if (loginRes.success && loginRes.data) {
          return loginRes.data;
        }
      }
      return res.data || { success: true };
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
    clearAuthError: (state) => {
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ id?: string; name: string; email: string; phone?: string; avatar?: string }>
    ) => {
      state.isAuthenticated = true;
      state.user = {
        id: action.payload.id || `usr-${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        phone: action.payload.phone || '',
        avatar: action.payload.avatar || '',
        isVerified: true,
        memberSince: new Date().getFullYear().toString(),
        roles: ['USER'],
      };
      saveLocalUser(state.user);
    },
    logoutUser: (state) => {
      clearAuthToken();
      saveLocalUser(null);
      state.isAuthenticated = false;
      state.user = null;
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
        const profile = buildProfile(action.payload);
        if (profile) {
          state.isAuthenticated = true;
          state.user = profile;
          saveLocalUser(profile);
        }
      })
      .addCase(initAuthThunk.rejected, (state) => {
        state.loading = false;
        // Keep initialUser from localStorage if available
        if (!state.user) {
          state.isAuthenticated = false;
        }
      })
      // Login
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        const u = (action.payload as any)?.user;
        const profile = buildProfile(u) || {
          id: `usr-${Date.now()}`,
          name: action.meta.arg.email ? action.meta.arg.email.split('@')[0] : 'User',
          email: action.meta.arg.email,
          phone: '',
          avatar: '',
          isVerified: true,
          memberSince: new Date().getFullYear().toString(),
          roles: ['USER'],
        };
        state.isAuthenticated = true;
        state.user = profile;
        saveLocalUser(profile);
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Login failed';
      })
      // Register
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        const u = (action.payload as any)?.user;
        const profile = buildProfile(u) || {
          id: `usr-${Date.now()}`,
          name: action.meta.arg.firstName
            ? `${action.meta.arg.firstName} ${action.meta.arg.lastName || ''}`.trim()
            : action.meta.arg.email.split('@')[0],
          email: action.meta.arg.email,
          phone: action.meta.arg.phone || '',
          avatar: '',
          isVerified: true,
          memberSince: new Date().getFullYear().toString(),
          roles: ['USER'],
        };
        state.isAuthenticated = true;
        state.user = profile;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {

        state.loading = false;
        state.error = (action.payload as string) || 'Registration failed';
      });
  },
});

export const { setAuthMode, setOtpTarget, clearAuthError, loginSuccess, logoutUser, logoutUser: logout } =
  authSlice.actions;

/** True only for a real ADMIN/SUPER_ADMIN role - used to gate the
 * client's own /admin panel and the header's Admin nav link. Never infer
 * this from an email address; only the backend-issued roles array is
 * trustworthy. */
export function isAdminRole(roles?: string[] | null): boolean {
  return !!roles?.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');
}

export default authSlice.reducer;



