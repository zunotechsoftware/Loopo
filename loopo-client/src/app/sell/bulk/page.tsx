'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Plus,
  Trash2,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { userApi } from '@/services/userApi';
import { productsApi } from '@/services/productsApi';
import { ROUTES } from '@/routes/routes';

type KycStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

const KYC_GATE_COPY: Record<KycStatus, string> = {
  NOT_STARTED: 'Bulk listing is reserved for KYC-verified sellers (car dealers, professional sellers, businesses, and other high-volume sellers). Complete KYC verification to unlock it.',
  DRAFT: 'You have a draft KYC application. Finish and submit it to unlock bulk listing.',
  SUBMITTED: 'Your KYC application is submitted and queued for review. Bulk listing unlocks once it\'s approved.',
  UNDER_REVIEW: 'Your KYC application is currently under review. Bulk listing unlocks once it\'s approved.',
  APPROVED: '',
  REJECTED: 'Your last KYC submission was rejected. Review the reason and resubmit to unlock bulk listing.',
};

// Same 8-city list used across the app's location pickers (see
// location/page.tsx, productsApi.ts's CITY_STATE_MAP) - keeps bulk items'
// location entry consistent with the single-listing flow without needing a
// full address sub-form per row.
const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair'];

interface BulkRow {
  title: string;
  categoryId: string;
  description: string;
  price: string;
  condition: string;
  city: string;
}

function emptyRow(defaultCategoryId: string): BulkRow {
  return { title: '', categoryId: defaultCategoryId, description: '', price: '', condition: 'Good', city: 'Bangalore' };
}

export default function BulkListingPage() {
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();

  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ totalCreated: number; totalFailed: number; failed: { index: number; title: string; error: string }[] } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Real-time KYC status, same fetch ProfileView already uses - not just
  // the cached auth.user.isVerified flag, so "pending" / "rejected" show
  // their own accurate message instead of a flat yes/no. The real
  // enforcement either way is server-side (POST /products/bulk rejects
  // with 403 if Profile.verifiedBadge isn't true) - this is UX only.
  useEffect(() => {
    userApi.getMyKyc().then((res) => {
      setKycStatus(res.success && res.data ? (res.data.status as KycStatus) : 'NOT_STARTED');
      setKycLoading(false);
    });
  }, []);

  useEffect(() => {
    if (categories.length > 0 && rows.length === 0) {
      setRows([emptyRow(categories[0].id), emptyRow(categories[0].id)]);
    }
  }, [categories, rows.length]);

  const isVerified = kycStatus === 'APPROVED';

  const updateRow = (idx: number, patch: Partial<BulkRow>) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow(categories[0]?.id || '')]);
  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setResult(null);

    if (rows.length < 2) {
      setFormError('Add at least 2 listings to use bulk upload - for a single listing, use the regular "Post New Ad" flow.');
      return;
    }
    for (const [i, row] of rows.entries()) {
      if (!row.title.trim() || !row.description.trim() || !row.price || !row.categoryId) {
        setFormError(`Item ${i + 1}: title, description, price and category are all required.`);
        return;
      }
      if (row.description.trim().length < 10) {
        setFormError(`Item ${i + 1}: description must be at least 10 characters.`);
        return;
      }
    }

    setSubmitting(true);
    const res = await productsApi.createBulkListings(
      rows.map((r) => ({
        title: r.title.trim(),
        categoryId: r.categoryId,
        description: r.description.trim(),
        price: Number(r.price),
        condition: r.condition,
        city: r.city,
      }))
    );
    setSubmitting(false);

    if (!res.success || !res.data) {
      // Covers the real 403 the backend returns if KYC lapsed between this
      // page loading and submitting - same message either way.
      setFormError(res.error || 'Could not submit bulk listings. Please try again.');
      return;
    }

    setResult(res.data);
    if (res.data.totalCreated > 0) {
      setRows(res.data.failed.length > 0
        ? res.data.failed.map((f) => rows[f.index])
        : [emptyRow(categories[0]?.id || ''), emptyRow(categories[0]?.id || '')]);
    }
  };

  if (kycLoading || categoriesLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
        <p className="text-xs font-medium text-slate-400 mt-3">Checking verification status...</p>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">KYC Verification Required</h2>
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-md mx-auto">
            {KYC_GATE_COPY[kycStatus || 'NOT_STARTED']}
          </p>
        </div>
        <button
          onClick={() => router.push(
            kycStatus === 'NOT_STARTED' || kycStatus === 'DRAFT' || kycStatus === 'REJECTED'
              ? ROUTES.VERIFICATION_DOCUMENTS
              : ROUTES.VERIFICATION_REVIEW
          )}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
        >
          <ShieldCheck className="w-4 h-4" />
          {kycStatus === 'NOT_STARTED' ? 'Start KYC Verification' : 'View KYC Status'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            Bulk Listing
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              Verified Seller
            </span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Create multiple listings in one go. Add at least 2 items below.</p>
        </div>
      </div>

      {result && (
        <div className={`p-4 rounded-2xl border space-y-2 ${result.totalFailed > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            {result.totalFailed > 0 ? <XCircle className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {result.totalCreated} listing(s) created successfully{result.totalFailed > 0 ? `, ${result.totalFailed} failed` : ''}.
          </div>
          {result.failed.length > 0 && (
            <ul className="text-xs text-slate-600 space-y-1 pl-6 list-disc">
              {result.failed.map((f) => (
                <li key={f.index}>&quot;{f.title}&quot;: {f.error}</li>
              ))}
            </ul>
          )}
          {result.totalCreated > 0 && (
            <button
              type="button"
              onClick={() => router.push(ROUTES.MY_LISTINGS)}
              className="text-xs font-bold text-emerald-700 underline"
            >
              View in My Listings
            </button>
          )}
        </div>
      )}

      {formError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-bold text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {rows.map((row, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Item {idx + 1}</span>
              {rows.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Title (e.g. 2020 Honda Civic VXi)"
              value={row.title}
              onChange={(e) => updateRow(idx, { title: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
            />

            <textarea
              placeholder="Description (at least 10 characters)"
              value={row.description}
              onChange={(e) => updateRow(idx, { description: e.target.value })}
              rows={2}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 resize-none"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={row.categoryId}
                onChange={(e) => updateRow(idx, { categoryId: e.target.value })}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={row.condition}
                onChange={(e) => updateRow(idx, { condition: e.target.value })}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={row.city}
                onChange={(e) => updateRow(idx, { city: e.target.value })}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Price (₹)"
                value={row.price}
                onChange={(e) => updateRow(idx, { price: e.target.value })}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 font-bold text-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Another Item
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Submitting...' : `Submit ${rows.length} Listings`}
        </button>
      </form>
    </div>
  );
}
