'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { CheckCircle2, XCircle, ArrowLeft, Loader2, Ban } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';
import { offersApi, Offer } from '@/services/offersApi';

interface PageProps {
  params: Promise<{ offerId: string }>;
}

function statusBadgeClass(status: Offer['status']) {
  if (status === 'ACCEPTED') return 'bg-emerald-100 text-emerald-700';
  if (status === 'REJECTED') return 'bg-red-100 text-red-700';
  if (status === 'WITHDRAWN') return 'bg-slate-100 text-slate-700';
  return 'bg-amber-100 text-amber-700';
}

export default function OfferDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const offerId = resolvedParams.offerId;
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  // No single-offer backend endpoint exists (GET /offers/:id) - the real
  // lookups are only "my made offers" and "my received offers", so this
  // finds the one matching offer from whichever list it belongs to.
  const loadOffer = () => {
    setLoading(true);
    Promise.all([offersApi.getReceivedOffers(), offersApi.getMadeOffers()]).then(([receivedRes, madeRes]) => {
      const all = [...(receivedRes.data || []), ...(madeRes.data || [])];
      setOffer(all.find((o) => o.id === offerId) || null);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOffer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  const isSeller = offer && currentUserId === offer.sellerId;
  const isBuyer = offer && currentUserId === offer.buyerId;

  const handleAction = async (action: 'accept' | 'reject' | 'withdraw') => {
    if (!offer) return;
    setActing(true);
    const res =
      action === 'accept'
        ? await offersApi.acceptOffer(offer.id)
        : action === 'reject'
        ? await offersApi.rejectOffer(offer.id)
        : await offersApi.withdrawOffer(offer.id);
    if (res.success) {
      dispatch(showToast(`Offer ${action === 'withdraw' ? 'withdrawn' : action + 'ed'}!`));
      loadOffer();
    } else {
      dispatch(showToast(res.error || `Failed to ${action} offer`));
    }
    setActing(false);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <Link
              href={ROUTES.OFFERS}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Offers</span>
            </Link>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : !offer ? (
              <div className="text-center py-6 text-slate-400 font-medium text-sm">
                This offer could not be found, or doesn't belong to your account.
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-slate-900">Offer on {offer.product?.title}</h1>
                  <p className="text-xs text-slate-500 font-medium">
                    {isSeller ? `From ${offer.buyer.firstName} ${offer.buyer.lastName}` : `To ${offer.seller.firstName} ${offer.seller.lastName}`}
                  </p>
                </div>
                <span className={`text-xs font-black px-3 py-1 rounded-full ${statusBadgeClass(offer.status)}`}>
                  {offer.status}
                </span>
              </div>
            )}
          </div>

          {offer && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Listing</span>
                  <div className="font-extrabold text-slate-900 text-base">{offer.product?.title}</div>
                  <div className="text-xs font-bold text-slate-500">
                    Original Price: ₹{(offer.product?.price || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offered Price</span>
                  <div className="text-2xl font-black text-emerald-600">₹{offer.amount.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {offer.message && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl italic">"{offer.message}"</p>
              )}

              {offer.status === 'PENDING' && isSeller && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleAction('accept')}
                    disabled={acting}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Offer</span>
                  </button>

                  <button
                    onClick={() => handleAction('reject')}
                    disabled={acting}
                    className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Offer</span>
                  </button>
                </div>
              )}

              {offer.status === 'PENDING' && isBuyer && (
                <button
                  onClick={() => handleAction('withdraw')}
                  disabled={acting}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-60"
                >
                  <Ban className="w-4 h-4" />
                  <span>Withdraw Offer</span>
                </button>
              )}
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
