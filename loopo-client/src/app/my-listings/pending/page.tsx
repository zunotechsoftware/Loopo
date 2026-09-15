'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { Clock, Eye } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function PendingListingsPage() {
  const ads = useAppSelector((state) => state.myAds.ads).filter(
    (a) => a.rawStatus === 'PENDING' || a.rawStatus === 'UNDER_REVIEW'
  );

  if (ads.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
        <Clock className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">No Pending Verification Listings</h3>
        <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
          Listings undergoing manual moderation or seller verification checks will appear here.
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
            <img src={ad.image} alt={ad.title} className="w-20 h-20 rounded-2xl object-cover border border-slate-100" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm">{ad.title}</h3>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {ad.rawStatus === 'UNDER_REVIEW' ? 'Under Review' : 'Pending Approval'}
                </span>
              </div>
              <div className="text-base font-black text-emerald-600">{ad.price}</div>
              <div className="text-xs text-slate-400 font-medium">{ad.postedDate}</div>
            </div>
          </div>

          <Link
            href={ROUTES.LISTING_DETAIL(ad.id)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1 self-start sm:self-auto"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
