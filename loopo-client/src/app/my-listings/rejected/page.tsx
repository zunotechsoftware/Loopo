'use client';

import React from 'react';
import { XCircle } from 'lucide-react';

export default function RejectedListingsPage() {
  return (
    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
      <XCircle className="w-10 h-10 text-red-400 mx-auto" />
      <h3 className="text-lg font-bold text-slate-900">No Rejected Listings</h3>
      <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
        If a listing fails moderation due to policy violations, details and retry options will appear here.
      </p>
    </div>
  );
}
