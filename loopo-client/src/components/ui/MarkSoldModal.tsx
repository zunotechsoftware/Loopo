'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Loader2, User } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { markAsSoldThunk } from '@/redux/slices/myAdsSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { offersApi } from '@/services/offersApi';

interface Candidate {
  id: string;
  name: string;
  avatar: string | null;
}

interface MarkSoldModalProps {
  productId: string;
  onClose: () => void;
}

/** A seller must pick the buyer who actually completed the transaction from
 * a real prior interaction on this listing (an Offer) - the backend
 * rejects any buyerId that isn't backed by one (see
 * ProductsService.markSoldWithBuyer's hasGenuineInteraction check), so this
 * only ever offers real candidates, never a free-text/arbitrary user picker. */
export default function MarkSoldModal({ productId, onClose }: MarkSoldModalProps) {
  const dispatch = useAppDispatch();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    offersApi.getReceivedOffers().then((res) => {
      if (res.success && res.data) {
        const forThisProduct = res.data.filter((o: any) => o.productId === productId || o.product?.id === productId);
        const seen = new Map<string, Candidate>();
        for (const offer of forThisProduct) {
          const buyer = offer.buyer;
          if (buyer?.id && !seen.has(buyer.id)) {
            seen.set(buyer.id, {
              id: buyer.id,
              name: `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'Buyer',
              avatar: buyer.profileImage || null,
            });
          }
        }
        setCandidates(Array.from(seen.values()));
      }
      setLoading(false);
    });
  }, [productId]);

  const confirmSold = async (buyerId?: string) => {
    setSubmitting(true);
    try {
      await dispatch(markAsSoldThunk({ id: productId, buyerId })).unwrap();
      dispatch(showToast(buyerId ? 'Marked as Sold! The buyer can now rate you.' : 'Marked as Sold!'));
      onClose();
    } catch (err: any) {
      dispatch(showToast(err || 'Failed to mark as sold'));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Mark as Sold</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100" disabled={submitting}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Who did you sell this to? Selecting the buyer lets them rate you for this transaction.
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium py-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading interested buyers...
          </div>
        ) : candidates.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-4">
            No buyers have made an offer on this listing yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {candidates.map((c) => (
              <button
                key={c.id}
                onClick={() => confirmSold(c.id)}
                disabled={submitting}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-colors disabled:opacity-60"
              >
                {c.avatar ? (
                  <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="font-bold text-xs text-slate-800">{c.name}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => confirmSold(undefined)}
          disabled={submitting}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>{submitting ? 'Please wait...' : "Skip - don't select a buyer"}</span>
        </button>
      </div>
    </div>
  );
}
