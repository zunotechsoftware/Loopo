const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/api\/docs\/?$/, '/api/v1');

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('loopo_access_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('loopo_access_token', token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('loopo_access_token');
  localStorage.removeItem('loopo_refresh_token');
}

// The access token expires in 15 minutes (JWT_ACCESS_EXPIRATION) and,
// until now, the refresh token the backend already issues on every
// login was never stored anywhere - there was no way to get a new
// access token short of logging in again. Every action taken more than
// ~15 minutes into a session (e.g. publishing a listing after browsing
// around for a while) silently 401'd, which - combined with a separate
// bug already fixed elsewhere (a fake client-side id standing in for a
// missing real one) - could make a failed save look like a successful
// "Listing published!" for a listing that was never actually saved.
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('loopo_refresh_token');
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('loopo_refresh_token', token);
}

// Endpoints that must never trigger a refresh-and-retry themselves -
// refreshing here would either loop (refresh failing with its own 401)
// or refresh a session that doesn't exist yet (login/register).
const NO_REFRESH_ENDPOINTS = ['/auth/refresh', '/auth/login', '/auth/register'];

// Shared across concurrent 401s so simultaneous requests don't each fire
// their own refresh call and race to rotate the same refresh token
// (the backend invalidates the old one on every refresh).
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.data?.accessToken) {
          clearAuthToken();
          return null;
        }
        setAuthToken(json.data.accessToken);
        if (json.data.refreshToken) setRefreshToken(json.data.refreshToken);
        return json.data.accessToken as string;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const doFetch = async (bearerToken: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (bearerToken) headers['Authorization'] = `Bearer ${bearerToken}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  try {
    let response = await doFetch(getAuthToken());

    // The access token expires in 15 minutes - previously there was no
    // way to recover from that short of logging in again, so any action
    // taken later in a session (e.g. publishing a listing after browsing
    // for a while) silently failed. Refresh once and retry transparently.
    if (response.status === 401 && !NO_REFRESH_ENDPOINTS.includes(cleanEndpoint) && getRefreshToken()) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        response = await doFetch(newToken);
      }
    }

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      // The backend's real error envelope is
      // { success, message: "Validation failed", errors: ["<real per-field reason>", ...] } -
      // `message` alone is just a generic category label ("Validation
      // failed") for anything the global ValidationPipe rejects (wrong
      // password strength, missing field, etc.). Reading only `message`
      // meant every validation error surfaced as the same unhelpful
      // "Validation failed" text regardless of what was actually wrong -
      // indistinguishable from the request failing outright.
      const errMsg = Array.isArray(json?.errors) && json.errors.length > 0
        ? json.errors.join('. ')
        : Array.isArray(json?.message)
        ? json.message.join('. ')
        : json?.message || json?.error || `API Error (${response.status})`;
      return {
        success: false,
        error: errMsg,
      };
    }

    return {
      success: true,
      data: json?.data !== undefined ? json.data : json,
      message: json?.message,
    };
  } catch (err: any) {
    console.warn(`[API Client] Failed request to ${url}:`, err.message || err);
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Request timed out' : err.message || 'Network error',
    };
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
