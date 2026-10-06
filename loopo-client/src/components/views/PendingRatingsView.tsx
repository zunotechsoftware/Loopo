'use client';

import React, { useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchPendingRatingsThunk } from '@/redux/slices/ratingsSlice';
import { openReviewModal } from '@/redux/slices/uiSlice';

interface PendingRatingsViewProps {
  /** When set (reached via a notification deep link), that eligibility's
   * rating modal opens automatically once the list has loaded. */
  autoOpenId?: string;
}

export default function PendingRatingsView({ autoOpenId }: PendingRatingsViewProps) {
  const dispatch = useAppDispatch();
  const { pendingRatings, loading } = useAppSelector((state) => state.ratings);

  useEffect(() => {
    dispatch(fetchPendingRatingsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!autoOpenId || loading) return;
    const match = pendingRatings.find((p) => p.id === autoOpenId);
    if (match) {
      dispatch(
        openReviewModal({
          eligibilityId: match.id,
          sellerName: `${match.seller.firstName} ${match.seller.lastName}`.trim(),
          productTitle: match.product.title,
          productImage: match.product.images?.[0]?.originalUrl,
        }),
      );
    }
    // Only ever auto-open once per mount, regardless of pendingRatings
    // identity changing after the review is submitted and removed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenId, loading]);

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-black text-slate-900">Pending Ratings</h1>
        <p className="text-xs font-medium text-slate-400 mt-0.5">
          Transactions where a seller marked a sale and selected you as the buyer
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
        </div>
      ) : pendingRatings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
          No pending ratings right now. They'll show up here once a seller marks a sale and selects you as the buyer.
        </div>
      ) : (
        <div className="space-y-3">
          {pendingRatings.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={p.product.images?.[0]?.thumbnailUrl || p.product.images?.[0]?.originalUrl || ''}
                  alt={p.product.title}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                />
                <div className="min-w-0">
                  <div className="font-extrabold text-sm text-slate-900 truncate">{p.product.title}</div>
                  <div className="text-xs text-slate-500 font-medium truncate">
                    Seller: {p.seller.firstName} {p.seller.lastName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    Expires {new Date(p.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  dispatch(
                    openReviewModal({
                      eligibilityId: p.id,
                      sellerName: `${p.seller.firstName} ${p.seller.lastName}`.trim(),
                      productTitle: p.product.title,
                      productImage: p.product.images?.[0]?.originalUrl,
                    }),
                  )
                }
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shrink-0 transition-colors"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Rate Now</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
