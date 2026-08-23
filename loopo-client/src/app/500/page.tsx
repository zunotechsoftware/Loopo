'use client';

import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function ServerErrorPage() {
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">500</h1>
          <h2 className="text-lg font-extrabold text-slate-800">Server Error</h2>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Something went wrong on our server. Please try refreshing the page or try again later.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-emerald-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Page</span>
          </button>
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
