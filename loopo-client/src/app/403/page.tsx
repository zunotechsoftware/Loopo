'use client';

import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { ShieldX, Home } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function AccessDeniedPage() {
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-16 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldX className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">403</h1>
          <h2 className="text-lg font-extrabold text-slate-800">Access Denied</h2>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            You do not have permission or administrative privileges to view this page.
          </p>
        </div>
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Marketplace Home</span>
        </Link>
      </div>
    </MainLayout>
  );
}
