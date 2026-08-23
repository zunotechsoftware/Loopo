'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, ShieldAlert, Ban, CheckCircle, Package } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function AdminUserDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Link href={ROUTES.ADMIN_USERS} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">User Details #{userId}</h1>
          <p className="text-xs text-slate-400 font-medium">User account inspection & moderation actions</p>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center font-bold text-lg">
              U
            </div>
            <div>
              <h2 className="text-lg font-black text-white">User {userId}</h2>
              <div className="text-xs text-slate-400">user_{userId}@loopo.com • Joined Jan 2024</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === 'ACTIVE' ? (
              <button
                onClick={() => setStatus('SUSPENDED')}
                className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-300 font-bold text-xs rounded-xl border border-red-800 flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" /> Suspend Account
              </button>
            ) : (
              <button
                onClick={() => setStatus('ACTIVE')}
                className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-800 flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Activate Account
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Verification Status</span>
            <div className="text-sm font-extrabold text-emerald-400">Verified Seller</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Total Listings</span>
            <div className="text-sm font-extrabold text-white">5 Active</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-400">Fraud Reports Filed Against</span>
            <div className="text-sm font-extrabold text-slate-300">0 Reports</div>
          </div>
        </div>
      </div>
    </div>
  );
}
