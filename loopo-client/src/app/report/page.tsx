'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Flag, ShieldAlert, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';
import Link from 'next/link';

function ReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const targetType = (searchParams.get('targetType') as 'LISTING' | 'USER' | 'CHAT') || 'LISTING';
  const targetId = searchParams.get('targetId') || '123';

  const reasons = [
    'SCAM',
    'FRAUD',
    'PROHIBITED_ITEM',
    'DUPLICATE',
    'OFFENSIVE_CONTENT',
    'WRONG_CATEGORY',
    'HARASSMENT',
    'OTHER',
  ];

  const [selectedReason, setSelectedReason] = useState('SCAM');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    dispatch(showToast('Report submitted for moderation review!'));
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Report {targetType}</h1>
            <p className="text-xs text-slate-500 font-medium">Target Reference ID: #{targetId}</p>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">Report Received</h2>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Thank you for keeping Loopo safe. Our trust and safety moderation team will investigate this report.
          </p>
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="py-2.5 px-6 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Return to Home
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Select Violation Reason *</label>
            <div className="grid grid-cols-2 gap-2">
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedReason(r)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    selectedReason === r
                      ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Additional Details / Evidence</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none h-24 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Submit Violation Report</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading...</div>}>
          <ReportContent />
        </Suspense>
      </MainLayout>
    </ProtectedRoute>
  );
}
