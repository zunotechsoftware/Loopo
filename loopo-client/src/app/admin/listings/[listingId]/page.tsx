'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

interface PageProps {
  params: Promise<{ listingId: string }>;
}

export default function AdminListingDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.listingId;
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'ACTIVE' | 'REJECTED' | 'REMOVED'>('ACTIVE');

  const handleAction = (newStatus: 'ACTIVE' | 'REJECTED' | 'REMOVED') => {
    setStatus(newStatus);
    dispatch(showToast(`Listing moderation status set to ${newStatus}`));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.ADMIN_LISTINGS} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">Listing Moderation #{listingId}</h1>
          <p className="text-xs text-slate-400 font-medium">Review listing content, image safety, and moderation options</p>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white">iPhone 15 Pro Max 256GB</h2>
            <div className="text-xs text-slate-400">Category: Mobiles • Price: ₹78,000</div>
          </div>

          <span className={`text-xs font-black px-3 py-1 rounded-full ${
            status === 'ACTIVE'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-red-950 text-red-300 border border-red-800'
          }`}>
            {status}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleAction('ACTIVE')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <CheckCircle className="w-4 h-4" /> Approve Listing
          </button>

          <button
            onClick={() => handleAction('REJECTED')}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" /> Reject Listing
          </button>

          <button
            onClick={() => handleAction('REMOVED')}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete / Remove Listing
          </button>
        </div>
      </div>
    </div>
  );
}
