'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { ShieldCheck, Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { userApi } from '@/services/userApi';

type KycStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

const STATUS_COPY: Record<Exclude<KycStatus, 'NOT_STARTED'>, { label: string; message: string; tone: 'pending' | 'success' | 'error' }> = {
  DRAFT: { label: 'DRAFT', message: 'You have a draft application - finish and submit it for review.', tone: 'pending' },
  SUBMITTED: { label: 'SUBMITTED', message: 'Your documents have been received and are queued for review.', tone: 'pending' },
  UNDER_REVIEW: { label: 'UNDER REVIEW', message: 'Your verification documents are currently under review by our moderation team.', tone: 'pending' },
  APPROVED: { label: 'VERIFIED', message: "You're verified! The Verified Seller badge is now live on your profile.", tone: 'success' },
  REJECTED: { label: 'REJECTED', message: 'Your last submission was rejected. Review the reason and re-submit.', tone: 'error' },
};

export default function VerificationDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<KycStatus>('NOT_STARTED');
  const [remarks, setRemarks] = useState<string | null>(null);

  useEffect(() => {
    userApi.getMyKyc().then((res) => {
      if (res.success && res.data) {
        setStatus(res.data.status as KycStatus);
        setRemarks(res.data.remarks || null);
      } else {
        setStatus('NOT_STARTED');
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const copy = status !== 'NOT_STARTED' ? STATUS_COPY[status] : null;

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
              <span
                className={`text-xs font-extrabold px-3.5 py-1 rounded-full ${
                  status === 'NOT_STARTED'
                    ? 'bg-slate-100 text-slate-600'
                    : copy?.tone === 'success'
                    ? 'bg-emerald-100 text-emerald-800'
                    : copy?.tone === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status === 'NOT_STARTED' ? 'NOT STARTED' : copy?.label}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              {status === 'NOT_STARTED' ? (
                <>
                  <ShieldCheck className="w-6 h-6 text-slate-400 shrink-0" />
                  <div className="text-xs font-semibold text-slate-700">
                    You haven't started identity verification yet. Upload your documents to get the Verified Seller badge.
                  </div>
                </>
              ) : copy?.tone === 'error' ? (
                <>
                  <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                  <div className="text-xs font-semibold text-slate-700">
                    {copy.message}
                    {remarks && <div className="mt-1 text-red-600">Reason: {remarks}</div>}
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className={`w-6 h-6 shrink-0 ${copy?.tone === 'success' ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <div className="text-xs font-semibold text-slate-700">{copy?.message}</div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(status === 'NOT_STARTED' || status === 'DRAFT' || status === 'REJECTED') && (
                <Link
                  href={ROUTES.VERIFICATION_DOCUMENTS}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>{status === 'REJECTED' ? 'Re-submit Documents' : 'Upload Identity Documents'}</span>
                </Link>
              )}

              {status !== 'NOT_STARTED' && (
                <Link
                  href={ROUTES.VERIFICATION_REVIEW}
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-xl transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Submitted Application</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
