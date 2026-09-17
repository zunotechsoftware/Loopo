'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PackageCheck, Search, Eye, Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { apiClient } from '@/services/apiClient';

interface AdminListingRow {
  id: string;
  title: string;
  price: number;
  status: string;
  category?: { name: string } | null;
  seller?: { firstName?: string; lastName?: string; email?: string } | null;
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ take: '50' });
      if (search) params.append('search', search);
      const res = await apiClient.get<any>(`/admin/products?${params.toString()}`);
      if (res.success) {
        // Real shape: { data: Product[], total, skip, take }
        setListings(Array.isArray(res.data?.data) ? res.data.data : []);
      } else {
        setError(res.error || 'Could not load listings.');
      }
      setLoading(false);
    };
    const timer = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Listing Moderation Queue</h1>
          <p className="text-xs text-slate-400 font-medium">Review, approve, reject, or remove marketplace listings.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading listings…
        </div>
      ) : error ? (
        <p className="text-xs text-red-400 text-center py-12">{error}</p>
      ) : listings.length === 0 ? (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-12 text-center text-slate-500 text-xs font-medium flex flex-col items-center gap-2">
          <PackageCheck className="w-6 h-6 text-slate-600" />
          <span>No listings found.</span>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="p-4">Listing Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Seller</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {listings.map((item) => {
                  const sellerName = item.seller?.firstName
                    ? `${item.seller.firstName} ${item.seller.lastName || ''}`.trim()
                    : item.seller?.email || 'Unknown';
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="p-4 font-bold text-white">{item.title}</td>
                      <td className="p-4 text-slate-400">{item.category?.name || '—'}</td>
                      <td className="p-4 text-slate-300">{sellerName}</td>
                      <td className="p-4 font-extrabold text-emerald-400">₹{Number(item.price).toLocaleString('en-IN')}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : item.status === 'REJECTED'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={ROUTES.ADMIN_LISTING_DETAIL(item.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Review</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
