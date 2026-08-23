'use client';

import React from 'react';
import { Search, HelpCircle, ChevronRight, MessageSquare, ShieldAlert } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

export default function HelpSupportView() {
  const dispatch = useAppDispatch();

  const topics = [
    'How to sell on Loopo',
    'How to edit or delete ad',
    'Payments & Refunds',
    'Safety tips for buyers & sellers',
    'Report a Fraud or Scam',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h1 className="text-2xl font-black text-slate-900">How can we help you?</h1>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search help articles..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2 pt-2">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Popular Topics</h3>
          {topics.map((t) => (
            <div
              key={t}
              onClick={() => dispatch(showToast(`Opened topic: ${t}`))}
              className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl cursor-pointer transition-colors text-xs font-bold text-slate-800"
            >
              <span>{t}</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button
            onClick={() => dispatch(showToast('Live Support Chat opened'))}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  );
}
