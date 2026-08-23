'use client';

import React, { useEffect } from 'react';
import { Package, Trash2, Edit3, Rocket, CheckCircle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setAdsFilter, deleteAd, updateAdStatus, fetchMyAdsThunk } from '@/redux/slices/myAdsSlice';
import { showToast } from '@/redux/slices/uiSlice';

export default function MyAdsView() {
  const dispatch = useAppDispatch();
  const ads = useAppSelector((state) => state.myAds.ads);
  const activeFilter = useAppSelector((state) => state.myAds.activeFilter);
  const isLoading = useAppSelector((state) => state.myAds.loading);

  // Fetch real ads from API on mount
  useEffect(() => {
    dispatch(fetchMyAdsThunk());
  }, [dispatch]);

  const filteredAds = ads.filter((ad) => ad.status === activeFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Ads & Listings</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Manage your active listings, sold items and drafts.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
          {(['Active', 'Sold', 'Inactive'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => dispatch(setAdsFilter(filter))}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Ads List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
            <p className="text-xs font-medium text-slate-400 mt-3">Loading your ads...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
            No {activeFilter.toLowerCase()} ads found.
          </div>
        ) : (
          filteredAds.map((ad) => (
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
              <div className="flex items-center gap-2">
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
                  onClick={() => dispatch(showToast('Edit ad clicked'))}
                  className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    dispatch(deleteAd(ad.id));
                    dispatch(showToast('Ad deleted'));
                  }}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
