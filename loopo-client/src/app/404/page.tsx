'use client';

import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { FileQuestion, Home } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function NotFoundPage() {
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <FileQuestion className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">404</h1>
          <h2 className="text-lg font-extrabold text-slate-800">Page Not Found</h2>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Marketplace Home</span>
        </Link>
      </div>
    </MainLayout>
  );
}
