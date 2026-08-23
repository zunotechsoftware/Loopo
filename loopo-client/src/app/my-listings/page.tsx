'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { deleteAd, updateAdStatus, fetchMyAdsThunk } from '@/redux/slices/myAdsSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';
import { Edit3, Trash2, CheckCircle, Eye, Play, Pause, RefreshCw, Loader2 } from 'lucide-react';

export default function MyListingsAllPage() {
  const dispatch = useAppDispatch();
  const { ads, loading } = useAppSelector((state) => state.myAds);

  useEffect(() => {
    dispatch(fetchMyAdsThunk());
  }, [dispatch]);

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
          <p className="text-xs font-medium text-slate-400 mt-3">Loading your listings...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
          No listings found in your account.
        </div>
      ) : (
        ads.map((ad) => (
          <div
            key={ad.id}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition-all"
          >
            <div className="flex items-center gap-4">
              <img
                src={ad.image}
                alt={ad.title}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-100"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">{ad.title}</h3>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      ad.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : ad.status === 'Sold'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ad.status}
                  </span>
                </div>
                <div className="text-base font-black text-emerald-600">{ad.price}</div>
                <div className="text-xs text-slate-400 font-medium">{ad.postedDate}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={ROUTES.LISTING_DETAIL(ad.id)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1"
                title="View"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden md:inline">View</span>
              </Link>

              <Link
                href={ROUTES.LISTING_EDIT(ad.id)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden md:inline">Edit</span>
              </Link>

              {ad.status === 'Active' && (
                <button
                  onClick={() => {
                    dispatch(updateAdStatus({ id: ad.id, status: 'Sold' }));
                    dispatch(showToast('Marked as Sold!'));
                  }}
                  className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Sold</span>
                </button>
              )}

              <button
                onClick={() => {
                  dispatch(deleteAd(ad.id));
                  dispatch(showToast('Listing deleted'));
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Delete"
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
