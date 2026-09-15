'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { XCircle, Edit3 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function RejectedListingsPage() {
  const ads = useAppSelector((state) => state.myAds.ads).filter((a) => a.rawStatus === 'REJECTED');

  if (ads.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
        <XCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">No Rejected Listings</h3>
        <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
          If a listing fails moderation due to policy violations, details and retry options will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ads.map((ad) => (
        <div
          key={ad.id}
          className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <img src={ad.image} alt={ad.title} className="w-20 h-20 rounded-2xl object-cover border border-slate-100 opacity-75" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm">{ad.title}</h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">Rejected</span>
              </div>
              <div className="text-base font-black text-slate-500">{ad.price}</div>
              <div className="text-xs text-slate-400 font-medium">{ad.postedDate}</div>
            </div>
          </div>

          <Link
            href={ROUTES.LISTING_EDIT(ad.id)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit & Resubmit</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
