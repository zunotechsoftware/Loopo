'use client';

import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { CheckSquare } from 'lucide-react';

export default function SoldListingsPage() {
  const ads = useAppSelector((state) => state.myAds.ads).filter((a) => a.status === 'Sold');

  return (
    <div className="space-y-3">
      {ads.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm space-y-2">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <div>No sold items yet.</div>
        </div>
      ) : (
        ads.map((ad) => (
          <div
            key={ad.id}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between opacity-85"
          >
            <div className="flex items-center gap-4">
              <img src={ad.image} alt={ad.title} className="w-16 h-16 rounded-2xl object-cover border border-slate-100" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{ad.title}</h3>
                <div className="text-sm font-bold text-blue-600">Sold for {ad.price}</div>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              Sold
            </span>
          </div>
        ))
      )}
    </div>
  );
}
