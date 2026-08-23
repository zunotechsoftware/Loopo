'use client';

import React from 'react';
import { Clock } from 'lucide-react';

export default function PendingListingsPage() {
  return (
    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
      <Clock className="w-10 h-10 text-amber-500 mx-auto" />
      <h3 className="text-lg font-bold text-slate-900">No Pending Verification Listings</h3>
      <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
        Listings undergoing manual moderation or seller verification checks will appear here.
      </p>
    </div>
  );
}
