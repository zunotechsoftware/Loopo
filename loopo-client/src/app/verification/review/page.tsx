'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Clock, ArrowLeft, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { userApi } from '@/services/userApi';

function maskDocumentNumber(num: string) {
  if (!num || num.length <= 4) return num;
  return `${'X'.repeat(Math.max(0, num.length - 4))} ${num.slice(-4)}`;
}

function formatDate(d?: string) {
  if (!d) return 'Unknown date';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function VerificationReviewPage() {
  const [loading, setLoading] = useState(true);
  const [kyc, setKyc] = useState<any | null>(null);

  useEffect(() => {
    userApi.getMyKyc().then((res) => {
      setKyc(res.success ? res.data : null);
      setLoading(false);
    });
  }, []);

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

            <h1 className="text-xl font-black text-slate-900">Application {kyc?.status === 'APPROVED' ? 'Approved' : kyc?.status === 'REJECTED' ? 'Rejected' : 'Under Review'}</h1>
            <p className="text-xs text-slate-500 font-medium">Review submitted document information</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : !kyc ? (
              <div className="flex items-center gap-3 p-4 bg-slate-50 text-slate-600 rounded-2xl border border-slate-200">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="text-xs font-semibold">No verification application found yet.</div>
              </div>
            ) : (
              <>
                <div
                  className={`flex items-center gap-3 p-4 rounded-2xl border ${
                    kyc.status === 'REJECTED'
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : kyc.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <Clock className="w-5 h-5 shrink-0" />
                  <div className="text-xs font-semibold">
                    Your application was submitted on <strong>{formatDate(kyc.submittedAt || kyc.createdAt)}</strong>.
                    {kyc.status === 'UNDER_REVIEW' || kyc.status === 'SUBMITTED' ? ' Review typically takes 24-48 hours.' : ''}
                  </div>
                </div>

                <div className="space-y-2 text-xs font-medium text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Document Type</span>
                    <span className="font-bold text-slate-800">{kyc.documentType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Document Number</span>
                    <span className="font-bold text-slate-800">{maskDocumentNumber(kyc.documentNumber)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Current State</span>
                    <span
                      className={`font-extrabold ${
                        kyc.status === 'REJECTED' ? 'text-red-600' : kyc.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {kyc.status}
                    </span>
                  </div>
                  {kyc.status === 'REJECTED' && kyc.remarks && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Reason</span>
                      <span className="font-bold text-red-600 text-right max-w-[60%]">{kyc.remarks}</span>
                    </div>
                  )}
                </div>

                {(kyc.status === 'REJECTED' || kyc.status === 'DRAFT') && (
                  <div className="pt-2 flex gap-3">
                    <Link
                      href={ROUTES.VERIFICATION_DOCUMENTS}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-upload / Retry Documents</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
