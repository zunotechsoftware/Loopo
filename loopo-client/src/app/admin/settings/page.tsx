'use client';

import React, { useState } from 'react';
import { Sliders, Save, ShieldCheck, DollarSign } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

export default function AdminSettingsPage() {
  const dispatch = useAppDispatch();
  const [autoMod, setAutoMod] = useState(true);
  const [requireKyc, setRequireKyc] = useState(false);
  const [currency, setCurrency] = useState('INR (₹)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(showToast('Marketplace global settings saved!'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white">Marketplace Configuration</h1>
        <p className="text-xs text-slate-400 font-medium">Global system settings, moderation rules, and payment configs.</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6 max-w-xl">
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-white">Automated AI Content Moderation</div>
              <div className="text-[10px] text-slate-400">Scan product titles and images for policy violations automatically</div>
            </div>
            <input
              type="checkbox"
              checked={autoMod}
              onChange={(e) => setAutoMod(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-white">Require KYC Verification to Post Ads</div>
              <div className="text-[10px] text-slate-400">Require sellers to complete identity verification before posting</div>
            </div>
            <input
              type="checkbox"
              checked={requireKyc}
              onChange={(e) => setRequireKyc(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
          </label>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Default Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </form>
    </div>
  );
}
