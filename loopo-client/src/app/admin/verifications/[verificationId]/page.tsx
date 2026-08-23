'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

interface PageProps {
  params: Promise<{ verificationId: string }>;
}

export default function AdminVerificationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const verificationId = resolvedParams.verificationId;
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');

  const handleAction = (newStatus: 'VERIFIED' | 'REJECTED') => {
    setStatus(newStatus);
    dispatch(showToast(`Seller verification marked as ${newStatus}`));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.ADMIN_VERIFICATIONS} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">Verification Review #{verificationId}</h1>
          <p className="text-xs text-slate-400 font-medium">Verify Aadhaar / ID document proof</p>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white">Gowtham S</h2>
            <div className="text-xs text-slate-400">Aadhaar Card • XXXX XXXX 9821</div>
          </div>
          <span className={`text-xs font-black px-3 py-1 rounded-full ${
            status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            {status}
          </span>
        </div>

        {status === 'PENDING' && (
          <div className="flex gap-3">
            <button
              onClick={() => handleAction('VERIFIED')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Approve Seller Verification
            </button>
            <button
              onClick={() => handleAction('REJECTED')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Reject Application
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
