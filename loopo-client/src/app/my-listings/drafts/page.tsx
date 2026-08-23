'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function DraftListingsPage() {
  return (
    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
      <FileText className="w-10 h-10 text-slate-400 mx-auto" />
      <div>
        <h3 className="text-lg font-bold text-slate-900">No Saved Drafts</h3>
        <p className="text-xs text-slate-500 font-medium mt-1">Unfinished listings will be automatically saved here.</p>
      </div>

      <Link
        href={ROUTES.SELL}
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Create New Listing</span>
      </Link>
    </div>
  );
}
