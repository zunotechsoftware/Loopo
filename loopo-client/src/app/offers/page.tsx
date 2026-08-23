'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Tag, CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft, Clock, DollarSign } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

export default function OffersPage() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<'received' | 'made'>('received');

  const offersMade = [
    { id: 'off-101', listingTitle: 'iPhone 15 Pro Max', listingId: 'p1', offerAmount: 72000, listingPrice: 78000, status: 'PENDING', date: 'Today' },
    { id: 'off-102', listingTitle: 'Royal Enfield Classic 350', listingId: 'p3', offerAmount: 135000, listingPrice: 145000, status: 'ACCEPTED', date: 'Yesterday' },
  ];

  const offersReceived = [
    { id: 'off-201', listingTitle: 'MacBook Air M2 16GB', listingId: 'p2', buyerName: 'Rahul Verma', offerAmount: 68000, listingPrice: 75000, status: 'PENDING', date: '2 hours ago' },
    { id: 'off-202', listingTitle: 'Sony WH-1000XM5', listingId: 'p4', buyerName: 'Priya Sharma', offerAmount: 18000, listingPrice: 22000, status: 'REJECTED', date: '3 days ago' },
  ];

  const activeOffers = tab === 'received' ? offersReceived : offersMade;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Offer Center</h1>
                <p className="text-xs text-slate-500 font-medium">Manage bargain offers sent and received on listings.</p>
              </div>
            </div>

            {/* Segmented control */}
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setTab('received')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  tab === 'received' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Received ({offersReceived.length})
              </button>
              <button
                onClick={() => setTab('made')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  tab === 'made' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Made ({offersMade.length})
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {activeOffers.map((offer: any) => (
              <div
                key={offer.id}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-sm">{offer.listingTitle}</h3>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        offer.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : offer.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {offer.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    {tab === 'received' ? `Offer by ${offer.buyerName}` : 'Your offer'} • Listing Price: ₹
                    {offer.listingPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-bold uppercase">Offered Amount</div>
                    <div className="text-lg font-black text-emerald-600">
                      ₹{offer.offerAmount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <Link
                    href={ROUTES.OFFER_DETAIL(offer.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
