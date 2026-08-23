'use client';

import React from 'react';
import Link from 'next/link';
import { BadgeCheck, Eye } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function AdminVerificationsPage() {
  const verifications = [
    { id: 'v-1', userName: 'Gowtham S', documentType: 'Aadhaar Card', status: 'PENDING', date: 'Today' },
    { id: 'v-2', userName: 'Ananya Roy', documentType: 'PAN Card', status: 'VERIFIED', date: 'Yesterday' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white">Seller Verification Queue</h1>
        <p className="text-xs text-slate-400 font-medium">Verify seller identity documents and issue Verified badges.</p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <tr>
              <th className="p-4">Queue ID</th>
              <th className="p-4">Seller Name</th>
              <th className="p-4">Document Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {verifications.map((v) => (
              <tr key={v.id} className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-white">#{v.id}</td>
                <td className="p-4 font-bold text-slate-200">{v.userName}</td>
                <td className="p-4 text-slate-400">{v.documentType}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    v.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{v.date}</td>
                <td className="p-4 text-right">
                  <Link
                    href={ROUTES.ADMIN_VERIFICATION_DETAIL(v.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] rounded-lg inline-flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Review Doc</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
