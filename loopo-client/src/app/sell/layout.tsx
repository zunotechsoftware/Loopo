'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { ROUTES } from '@/routes/routes';
import { PlusCircle, Grid, FileText, Camera, MapPin, Eye, CheckCircle2 } from 'lucide-react';

interface SellLayoutProps {
  children: React.ReactNode;
}

export default function SellLayout({ children }: SellLayoutProps) {
  const pathname = usePathname();

  const sellSteps = [
    { label: 'Category', href: ROUTES.SELL_CATEGORY, icon: Grid },
    { label: 'Details', href: ROUTES.SELL_DETAILS, icon: FileText },
    { label: 'Photos', href: ROUTES.SELL_PHOTOS, icon: Camera },
    { label: 'Location', href: ROUTES.SELL_LOCATION, icon: MapPin },
    { label: 'Preview', href: ROUTES.SELL_PREVIEW, icon: Eye },
  ];

  const isSuccessPage = pathname === ROUTES.SELL_SUCCESS;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Sell on Loopo</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Post your ad in minutes and connect with thousands of local buyers.</p>
            </div>
          </div>

          {/* Stepper Header (shown unless on success screen) */}
          {!isSuccessPage && (
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between min-w-[500px]">
                {sellSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = pathname === step.href;
                  return (
                    <Link
                      key={step.href}
                      href={step.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        isActive ? 'bg-white text-emerald-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <span>{step.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step Page Content */}
          <div>{children}</div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
