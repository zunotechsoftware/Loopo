'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { isAdminRole } from '@/redux/slices/authSlice';
import { ROUTES } from '@/routes/routes';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * This used to render children unconditionally - no authentication or
 * role check at all - so anyone who navigated to /admin, logged in or
 * not, got the full admin shell (User Management, Listing Moderation,
 * Report Management, etc.). Real backend admin endpoints still reject an
 * unauthorized request, but the UI itself was fully exposed to any
 * visitor. Now it requires a real session with an ADMIN/SUPER_ADMIN role,
 * exactly like the dedicated loopo-admin app's own AuthGuard.
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const hasAdminAccess = isAuthenticated && isAdminRole(user?.roles);

  useEffect(() => {
    if (loading) return;
    if (!hasAdminAccess) {
      router.replace(ROUTES.HOME);
    }
  }, [loading, hasAdminAccess, router]);

  if (loading || !hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
