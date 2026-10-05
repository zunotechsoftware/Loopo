'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Tag, CheckCircle2, XCircle, Loader2, Ban } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';
import { offersApi, Offer } from '@/services/offersApi';

function statusBadgeClass(status: Offer['status']) {
  if (status === 'ACCEPTED') return 'bg-emerald-100 text-emerald-700';
  if (status === 'REJECTED') return 'bg-red-100 text-red-700';
  if (status === 'WITHDRAWN') return 'bg-slate-100 text-slate-600';
  return 'bg-amber-100 text-amber-700';
}

export default function OffersPage() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<'received' | 'made'>('received');
  const [received, setReceived] = useState<Offer[]>([]);
  const [made, setMade] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const loadOffers = () => {
    setLoading(true);
    Promise.all([offersApi.getReceivedOffers(), offersApi.getMadeOffers()]).then(([receivedRes, madeRes]) => {
      setReceived(receivedRes.success && receivedRes.data ? receivedRes.data : []);
      setMade(madeRes.success && madeRes.data ? madeRes.data : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleAccept = async (id: string) => {
    setActingOn(id);
    const res = await offersApi.acceptOffer(id);
    if (res.success) {
      dispatch(showToast('Offer accepted!'));
      loadOffers();
    } else {
      dispatch(showToast(res.error || 'Failed to accept offer'));
    }
    setActingOn(null);
  };

  const handleReject = async (id: string) => {
    setActingOn(id);
    const res = await offersApi.rejectOffer(id);
    if (res.success) {
      dispatch(showToast('Offer rejected'));
      loadOffers();
    } else {
      dispatch(showToast(res.error || 'Failed to reject offer'));
    }
    setActingOn(null);
  };

  const handleWithdraw = async (id: string) => {
    setActingOn(id);
    const res = await offersApi.withdrawOffer(id);
    if (res.success) {
      dispatch(showToast('Offer withdrawn'));
      loadOffers();
    } else {
      dispatch(showToast(res.error || 'Failed to withdraw offer'));
    }
    setActingOn(null);
  };

  const activeOffers = tab === 'received' ? received : made;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">Offer Center</h1>
                <p className="text-xs text-slate-500 font-medium">Manage bargain offers sent and received on listings.</p>
              </div>
            </div>

            {/* Segmented control */}
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setTab('received')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  tab === 'received' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Received ({received.length})
              </button>
              <button
                onClick={() => setTab('made')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  tab === 'made' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Made ({made.length})
              </button>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            </div>
          ) : activeOffers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
              {tab === 'received' ? "You haven't received any offers yet." : "You haven't made any offers yet."}
            </div>
          ) : (
            <div className="space-y-3">
              {activeOffers.map((offer) => {
                const otherParty = tab === 'received' ? offer.buyer : offer.seller;
                const otherPartyName = `${otherParty.firstName || ''} ${otherParty.lastName || ''}`.trim() || 'User';
                const isActing = actingOn === offer.id;
                return (
                  <div
                    key={offer.id}
                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-200 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={ROUTES.LISTING_DETAIL(offer.productId)}
                          className="font-extrabold text-slate-900 text-sm hover:underline truncate"
                        >
                          {offer.product?.title || 'Listing'}
                        </Link>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${statusBadgeClass(offer.status)}`}>
                          {offer.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-medium">
                        {tab === 'received' ? `Offer by ${otherPartyName}` : `To ${otherPartyName}`} • Listing Price: ₹
                        {(offer.product?.price || 0).toLocaleString('en-IN')}
                      </div>
                      {offer.message && (
                        <div className="text-xs text-slate-400 font-medium italic">"{offer.message}"</div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-bold uppercase">Offered Amount</div>
                        <div className="text-lg font-black text-emerald-600">
                          ₹{offer.amount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {offer.status === 'PENDING' && tab === 'received' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAccept(offer.id)}
                            disabled={isActing}
                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-60"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleReject(offer.id)}
                            disabled={isActing}
                            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all disabled:opacity-60"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {offer.status === 'PENDING' && tab === 'made' && (
                        <button
                          onClick={() => handleWithdraw(offer.id)}
                          disabled={isActing}
                          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all disabled:opacity-60"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Withdraw</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
