'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isAdminRole } from '@/types/auth';
import { Box, CircularProgress } from '@mui/material';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Defense-in-depth alongside the login page's own check: a role can be
  // revoked (or downgraded from ADMIN to a lesser custom role) while a
  // session is already live in someone's browser, and this also covers
  // any other code path that might ever populate a non-admin user here.
  const hasAdminAccess = !user || isAdminRole(user.roles);

  useEffect(() => {
    if (isLoading || pathname === '/login') return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!hasAdminAccess) {
      logout();
    }
  }, [isAuthenticated, isLoading, hasAdminAccess, pathname, router, logout]);

  // Show spinner while auth state is being resolved from localStorage,
  // when not authenticated (waiting for redirect to /login), or when a
  // logged-in session turns out to lack admin access (waiting for logout)
  if (isLoading || (!isAuthenticated && pathname !== '/login') || (isAuthenticated && !hasAdminAccess)) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
