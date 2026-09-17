'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';
import { apiClient } from '@/services/apiClient';

interface PageProps {
  params: Promise<{ listingId: string }>;
}

interface AdminListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  rejectionReason?: string | null;
  category?: { name: string } | null;
  seller?: { firstName?: string; lastName?: string; email?: string } | null;
}

export default function AdminListingDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.listingId;
  const dispatch = useAppDispatch();
  const [listing, setListing] = useState<AdminListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    // The public listing endpoint returns any status (not just APPROVED) -
    // it's what a seller uses to preview their own pending/rejected
    // listing too, so it works here without needing a separate admin-only
    // single-item route.
    const res = await apiClient.get<any>(`/products/${listingId}`);
    if (res.success && res.data) {
      setListing(res.data);
    } else {
      setError(res.error || 'Listing not found.');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const handleApprove = async () => {
    setActionLoading(true);
    const res = await apiClient.patch(`/admin/products/${listingId}/approve`, {});
    setActionLoading(false);
    if (res.success) {
      dispatch(showToast('Listing approved'));
      load();
    } else {
      dispatch(showToast(res.error || 'Failed to approve listing'));
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Reason for rejecting this listing:', 'Violation of marketplace terms');
    if (!reason) return;
    setActionLoading(true);
    const res = await apiClient.patch(`/admin/products/${listingId}/reject`, { reason });
    setActionLoading(false);
    if (res.success) {
      dispatch(showToast('Listing rejected'));
      load();
    } else {
      dispatch(showToast(res.error || 'Failed to reject listing'));
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Permanently remove this listing? This cannot be undone.')) return;
    setActionLoading(true);
    const res = await apiClient.delete(`/admin/products/${listingId}`);
    setActionLoading(false);
    if (res.success) {
      dispatch(showToast('Listing removed'));
    } else {
      dispatch(showToast(res.error || 'Failed to remove listing'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 py-12 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading listing…
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="space-y-4">
        <Link href={ROUTES.ADMIN_LISTINGS} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl inline-flex">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <p className="text-xs text-red-400">{error || 'Listing not found.'}</p>
      </div>
    );
  }

  const sellerName = listing.seller?.firstName
    ? `${listing.seller.firstName} ${listing.seller.lastName || ''}`.trim()
    : listing.seller?.email || 'Unknown';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.ADMIN_LISTINGS} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">Listing Moderation</h1>
          <p className="text-xs text-slate-400 font-medium">Review listing content and moderation options</p>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white">{listing.title}</h2>
            <div className="text-xs text-slate-400">
              Category: {listing.category?.name || '—'} • Price: ₹{Number(listing.price).toLocaleString('en-IN')} • Seller: {sellerName}
            </div>
          </div>

          <span className={`text-xs font-black px-3 py-1 rounded-full ${
            listing.status === 'APPROVED'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : listing.status === 'REJECTED'
              ? 'bg-red-950 text-red-300 border border-red-800'
              : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            {listing.status}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{listing.description}</p>

        {listing.status === 'REJECTED' && listing.rejectionReason && (
          <div className="text-xs text-red-300 bg-red-950/40 border border-red-900 rounded-xl p-3">
            <span className="font-bold">Rejection reason:</span> {listing.rejectionReason}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleApprove}
            disabled={actionLoading || listing.status === 'APPROVED'}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <CheckCircle className="w-4 h-4" /> Approve Listing
          </button>

          <button
            onClick={handleReject}
            disabled={actionLoading || listing.status === 'REJECTED'}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" /> Reject Listing
          </button>

          <button
            onClick={handleRemove}
            disabled={actionLoading}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete / Remove Listing
          </button>
        </div>
      </div>
    </div>
  );
}
