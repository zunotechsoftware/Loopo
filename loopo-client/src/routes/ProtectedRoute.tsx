'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useAppSelector } from '@/redux/hooks';
import { Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * This used to show an inline "Login Required" card whose only action
 * opened AuthModal - a separate, parallel login/signup implementation
 * from the real /login and /register pages, with several genuinely
 * broken/fake pieces (a "Forgot Password" that never called the real
 * API, an OTP step that logged in as a fake user for ANY input, and
 * fully fabricated Google/Apple "login" buttons). For a full-page
 * protected route like /sell or /my-listings, redirecting to the real,
 * fully-functional login page (with a return path) is both simpler and
 * avoids depending on that parallel surface at all.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, pathname, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

