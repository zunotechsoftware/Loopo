'use client';

import React from 'react';
import Link from 'next/link';
import { PackageCheck, Search, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function AdminListingsPage() {
  const listings = [
    { id: 'p1', title: 'iPhone 15 Pro Max 256GB', category: 'Mobiles', seller: 'Gowtham S', price: '₹78,000', status: 'ACTIVE' },
    { id: 'mod-1', title: 'Suspicious Brand New Laptop', category: 'Electronics', seller: 'Unknown User', price: '₹12,000', status: 'PENDING' },
    { id: 'p3', title: 'Royal Enfield Classic 350', category: 'Cars & Bikes', seller: 'Rahul V', price: '₹1,45,000', status: 'ACTIVE' },
  ];

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
            placeholder="Search listings..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
          />
        </div>
      </div>

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
              {listings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-white">{item.title}</td>
                  <td className="p-4 text-slate-400">{item.category}</td>
                  <td className="p-4 text-slate-300">{item.seller}</td>
                  <td className="p-4 font-extrabold text-emerald-400">{item.price}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      item.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
