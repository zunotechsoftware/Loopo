export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // The real backend login response returns `roles: string[]` (a user can
  // hold more than one), never a singular `role` - this field never
  // actually matched what the API sends.
  roles: string[];
}

/** Only these two roles may use the admin portal at all - every other
 * registered account (buyer/seller from the public marketplace, or any
 * custom role without ADMIN/SUPER_ADMIN) gets rejected at login, not left
 * to discover it one silently-403'd widget at a time. */
export function isAdminRole(roles?: string[] | null): boolean {
  return !!roles?.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
