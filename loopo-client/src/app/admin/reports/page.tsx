'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Eye, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function AdminReportsPage() {
  const reports = [
    { id: 'rep-1', targetType: 'LISTING', targetId: 'p1', reason: 'SCAM', reporter: 'Rahul V', status: 'OPEN', date: 'Today' },
    { id: 'rep-2', targetType: 'USER', targetId: 'u-3', reason: 'HARASSMENT', reporter: 'Priya S', status: 'RESOLVED', date: '3 days ago' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white">Report Management</h1>
        <p className="text-xs text-slate-400 font-medium">Review and resolve trust & safety violation reports.</p>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <tr>
              <th className="p-4">Report ID</th>
              <th className="p-4">Target Type</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Reporter</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-white">#{r.id}</td>
                <td className="p-4 font-bold text-slate-300">{r.targetType} (#{r.targetId})</td>
                <td className="p-4 font-extrabold text-red-400">{r.reason}</td>
                <td className="p-4 text-slate-400">{r.reporter}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    r.status === 'OPEN' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <Link
                    href={ROUTES.ADMIN_REPORT_DETAIL(r.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] rounded-lg inline-flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Investigate</span>
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
