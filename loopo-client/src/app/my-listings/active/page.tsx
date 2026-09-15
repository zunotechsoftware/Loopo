'use client';

import React from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { markAsSoldThunk, deleteAdThunk } from '@/redux/slices/myAdsSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';
import { Edit3, Trash2, CheckCircle, Eye, Pause } from 'lucide-react';

export default function ActiveListingsPage() {
  const dispatch = useAppDispatch();
  // "Active" = actually live/published, not just "not sold" - a Draft or
  // Pending-review listing must not show up here as if it were live.
  const ads = useAppSelector((state) => state.myAds.ads).filter((a) => a.rawStatus === 'APPROVED');

  return (
    <div className="space-y-3">
      {ads.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
          No active listings found.
        </div>
      ) : (
        ads.map((ad) => (
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

            <div className="flex items-center gap-2">
              <Link href={ROUTES.LISTING_DETAIL(ad.id)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                <Eye className="w-4 h-4" />
              </Link>
              <Link href={ROUTES.LISTING_EDIT(ad.id)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
                <Edit3 className="w-4 h-4" />
              </Link>
              <button
                onClick={async () => {
                  try {
                    await dispatch(markAsSoldThunk(ad.id)).unwrap();
                    dispatch(showToast('Marked as Sold!'));
                  } catch (err: any) {
                    dispatch(showToast(err || 'Failed to mark as sold'));
                  }
                }}
                className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold px-3 py-2 rounded-xl"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Sold</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    await dispatch(deleteAdThunk(ad.id)).unwrap();
                    dispatch(showToast('Listing deleted'));
                  } catch (err: any) {
                    dispatch(showToast(err || 'Failed to delete listing'));
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
