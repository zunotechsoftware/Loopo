'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { FileText, Plus, Edit3 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function DraftListingsPage() {
  const ads = useAppSelector((state) => state.myAds.ads).filter((a) => a.rawStatus === 'DRAFT');

  if (ads.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
        <FileText className="w-10 h-10 text-slate-400 mx-auto" />
        <div>
          <h3 className="text-lg font-bold text-slate-900">No Saved Drafts</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Unfinished listings will be automatically saved here.</p>
        </div>

        <Link
          href={ROUTES.SELL}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Listing</span>
        </Link>
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
            <img src={ad.image} alt={ad.title} className="w-20 h-20 rounded-2xl object-cover border border-slate-100" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-sm">{ad.title}</h3>
              <div className="text-base font-black text-emerald-600">{ad.price}</div>
              <div className="text-xs text-slate-400 font-medium">{ad.postedDate}</div>
            </div>
          </div>

          <Link
            href={ROUTES.LISTING_EDIT(ad.id)}
            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold px-3 py-2 rounded-xl self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Finish & Publish</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
