'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

interface PageProps {
  params: Promise<{ reportId: string }>;
}

export default function AdminReportDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const reportId = resolvedParams.reportId;
  const dispatch = useAppDispatch();
  const [resolved, setResolved] = useState(false);

  const handleResolve = () => {
    setResolved(true);
    dispatch(showToast('Report marked as resolved!'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.ADMIN_REPORTS} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">Report Investigation #{reportId}</h1>
          <p className="text-xs text-slate-400 font-medium">Review reported content and execute moderation action</p>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Violation: SCAM / FRAUD</span>
            <h2 className="text-lg font-black text-white">Report #{reportId}</h2>
          </div>
          <span className={`text-xs font-black px-3 py-1 rounded-full ${
            resolved ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
          }`}>
            {resolved ? 'RESOLVED' : 'OPEN'}
          </span>
        </div>

        {!resolved && (
          <button
            onClick={handleResolve}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" /> Resolve Report & Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
