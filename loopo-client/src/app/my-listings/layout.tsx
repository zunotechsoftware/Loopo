'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { ROUTES } from '@/routes/routes';
import { Package, CheckCircle, Clock, FileText, CheckSquare, XCircle, Plus } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { fetchMyAdsThunk } from '@/redux/slices/myAdsSlice';

interface MyListingsLayoutProps {
  children: React.ReactNode;
}

export default function MyListingsLayout({ children }: MyListingsLayoutProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  // Re-fetch on every tab switch, not just once on first mount - this
  // layout stays mounted while navigating between its own sub-tabs (Next's
  // App Router doesn't remount a shared layout for sibling routes), so a
  // mount-only effect meant a listing approved (or rejected, sold, etc.)
  // while the user already had My Listings open stayed on whatever tab it
  // used to belong to until a full page reload - e.g. approving a listing
  // elsewhere and then clicking "Active" here still showed it as Pending.
  useEffect(() => {
    dispatch(fetchMyAdsThunk());
  }, [dispatch, pathname]);

  const tabs = [
    { label: 'All', href: ROUTES.MY_LISTINGS, icon: Package },
    { label: 'Active', href: ROUTES.MY_LISTINGS_ACTIVE, icon: CheckCircle },
    { label: 'Pending', href: ROUTES.MY_LISTINGS_PENDING, icon: Clock },
    { label: 'Drafts', href: ROUTES.MY_LISTINGS_DRAFTS, icon: FileText },
    { label: 'Sold', href: ROUTES.MY_LISTINGS_SOLD, icon: CheckSquare },
    { label: 'Rejected', href: ROUTES.MY_LISTINGS_REJECTED, icon: XCircle },
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">My Listings & Ads</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Manage active listings, pending moderation, drafts and sold items.</p>
            </div>

            <Link
              href={ROUTES.SELL}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Ad</span>
            </Link>
          </div>

          {/* Sub-route Tabs Header */}
          <div className="flex items-center gap-2 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                tab.href === ROUTES.MY_LISTINGS
                  ? pathname === ROUTES.MY_LISTINGS
                  : pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Page Content */}
          <div>{children}</div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
