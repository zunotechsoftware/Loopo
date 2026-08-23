'use client';

import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { ShieldCheck, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function VerificationReviewPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <Link
              href={ROUTES.VERIFICATION}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Verification</span>
            </Link>

            <h1 className="text-xl font-black text-slate-900">Application Under Review</h1>
            <p className="text-xs text-slate-500 font-medium">Review submitted document information</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs font-semibold">
                Your application was submitted on <strong>August 23, 2026</strong>. Review typically takes 24-48 hours.
              </div>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Document Type</span>
                <span className="font-bold text-slate-800">Aadhaar Card</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Document Number</span>
                <span className="font-bold text-slate-800">XXXX XXXX 9821</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Current State</span>
                <span className="font-extrabold text-emerald-600">UNDER_REVIEW</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <Link
                href={ROUTES.VERIFICATION_DOCUMENTS}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-upload / Retry Documents</span>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
