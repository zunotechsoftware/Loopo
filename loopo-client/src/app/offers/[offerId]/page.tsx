'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Tag, CheckCircle2, XCircle, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

interface PageProps {
  params: Promise<{ offerId: string }>;
}

export default function OfferDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const offerId = resolvedParams.offerId;
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'>('PENDING');
  const [counterAmount, setCounterAmount] = useState('');
  const [showCounter, setShowCounter] = useState(false);

  const handleAction = (newStatus: 'ACCEPTED' | 'REJECTED' | 'CANCELLED') => {
    setStatus(newStatus);
    dispatch(showToast(`Offer ${newStatus.toLowerCase()}!`));
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <Link
              href={ROUTES.OFFERS}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Offers</span>
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-slate-900">Offer #{offerId}</h1>
                <p className="text-xs text-slate-500 font-medium">Bargain offer details for iPhone 15 Pro Max</p>
              </div>

              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  status === 'ACCEPTED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : status === 'REJECTED'
                    ? 'bg-red-100 text-red-700'
                    : status === 'CANCELLED'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listing</span>
                <div className="font-extrabold text-slate-900 text-base">iPhone 15 Pro Max 256GB</div>
                <div className="text-xs font-bold text-slate-500">Original Price: ₹78,000</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offered Price</span>
                <div className="text-2xl font-black text-emerald-600">₹72,000</div>
              </div>
            </div>

            {/* Actions */}
            {status === 'PENDING' && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction('ACCEPTED')}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Offer</span>
                  </button>

                  <button
                    onClick={() => handleAction('REJECTED')}
                    className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-3 rounded-xl transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Offer</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCounter(!showCounter)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Send Counter Offer
                  </button>
                </div>

                {showCounter && (
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-200">
                    <label className="text-xs font-bold text-slate-700">Counter Offer Amount (₹)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={counterAmount}
                        onChange={(e) => setCounterAmount(e.target.value)}
                        placeholder="e.g. 75000"
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                      />
                      <button
                        onClick={() => {
                          dispatch(showToast(`Counter offer of ₹${counterAmount} sent!`));
                          setShowCounter(false);
                        }}
                        className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
