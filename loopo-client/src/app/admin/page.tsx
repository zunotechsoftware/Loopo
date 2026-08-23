'use client';

import React from 'react';
import Link from 'next/link';
import { Users, PackageCheck, ShieldAlert, BadgeCheck, FolderTree, ArrowUpRight, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Registered Users', value: '14,250', change: '+12%', icon: Users, href: ROUTES.ADMIN_USERS, color: 'text-indigo-400' },
    { title: 'Listings Pending Moderation', value: '42', change: '-5%', icon: PackageCheck, href: ROUTES.ADMIN_LISTINGS, color: 'text-amber-400' },
    { title: 'Active Fraud Reports', value: '8', change: 'Action Required', icon: ShieldAlert, href: ROUTES.ADMIN_REPORTS, color: 'text-red-400' },
    { title: 'Seller Verification Queue', value: '19', change: '+3 new', icon: BadgeCheck, href: ROUTES.ADMIN_VERIFICATIONS, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white">Admin Control Overview</h1>
        <p className="text-xs text-slate-400 font-medium">Marketplace stats, moderation queues, and system status.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{s.title}</span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-white">{s.value}</span>
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-0.5">
                  {s.change} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-amber-400" />
              <span>Pending Listing Moderation</span>
            </h2>
            <Link href={ROUTES.ADMIN_LISTINGS} className="text-xs font-bold text-purple-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {['iPhone 15 Pro Max', 'Royal Enfield Hunter 350', 'Wooden Dining Table Set'].map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="font-bold text-slate-200">{item}</span>
                <Link href={ROUTES.ADMIN_LISTING_DETAIL(`mod-${idx + 1}`)} className="text-[11px] font-bold text-emerald-400 hover:underline">
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>Seller Verification Queue</span>
            </h2>
            <Link href={ROUTES.ADMIN_VERIFICATIONS} className="text-xs font-bold text-purple-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {['Gowtham S (Aadhaar)', 'Ananya Roy (PAN)', 'Vikram Singh (Driving License)'].map((seller, idx) => (
              <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="font-bold text-slate-200">{seller}</span>
                <Link href={ROUTES.ADMIN_VERIFICATION_DETAIL(`ver-${idx + 1}`)} className="text-[11px] font-bold text-purple-400 hover:underline">
                  Verify ID
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
