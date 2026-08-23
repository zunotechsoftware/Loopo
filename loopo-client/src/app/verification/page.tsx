'use client';

import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { ShieldCheck, Upload, FileText, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function VerificationDashboardPage() {
  const verificationState: 'NOT_STARTED' | 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' = 'UNDER_REVIEW';

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Seller Verification Suite</h1>
                <p className="text-xs text-slate-500 font-medium">Verify your identity to earn the Verified Seller badge and boost buyer trust.</p>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Current Status</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3.5 py-1 rounded-full">
                {verificationState}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="text-xs font-semibold text-slate-700">
                Your verification documents have been received and are currently under review by moderation team.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                href={ROUTES.VERIFICATION_DOCUMENTS}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Identity Documents</span>
              </Link>

              <Link
                href={ROUTES.VERIFICATION_REVIEW}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-xl transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>View Submitted Application</span>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
