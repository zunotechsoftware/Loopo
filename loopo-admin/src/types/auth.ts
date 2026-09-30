export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // The real backend login response returns `roles: string[]` (a user can
  // hold more than one), never a singular `role` - this field never
  // actually matched what the API sends.
  roles: string[];
  // Computed server-side (Role.isAdminRole) from the user's real roles, not
  // guessed from role name strings on the client - lets a custom operator
  // role (Moderator/Support/Finance) created via the Roles page actually be
  // allowed into the portal, as long as it was flagged admin-eligible.
  isAdminRole: boolean;
}

/** Every registered account (buyer/seller from the public marketplace, or
 * any custom role not flagged admin-eligible) gets rejected at login, not
 * left to discover it one silently-403'd widget at a time. */
export function hasAdminPortalAccess(user?: Pick<User, 'isAdminRole'> | null): boolean {
  return !!user?.isAdminRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
