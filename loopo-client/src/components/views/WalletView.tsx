'use client';

import React from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addMoney } from '@/redux/slices/walletSlice';
import { showToast } from '@/redux/slices/uiSlice';

export default function WalletView() {
  const dispatch = useAppDispatch();
  const wallet = useAppSelector((state) => state.wallet);

  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(wallet.balance);

  const handleAddFunds = () => {
    dispatch(addMoney(1000));
    dispatch(showToast('Added ₹1,000 to wallet! 💳'));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="text-xs font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4" />
            <span>Total Balance</span>
          </div>
          <div className="text-4xl font-black tracking-tight">{formattedBalance}</div>
          <div className="text-xs text-emerald-200 font-medium">Available for ad boosts & Instant Payouts</div>
        </div>

        <button
          onClick={handleAddFunds}
          className="relative z-10 flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Money</span>
        </button>

        {/* Decorative Circle */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
            <History className="w-4 h-4 text-emerald-600" />
            <span>Transaction History</span>
          </div>
          <span className="text-xs font-semibold text-slate-400">Recent</span>
        </div>

        <div className="space-y-2 divide-y divide-slate-50">
          {wallet.transactions.map((tx) => {
            const isCredit = tx.type === 'credit';
            return (
              <div key={tx.id} className="pt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{tx.title}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{tx.date}</div>
                  </div>
                </div>

                <div className={`font-black text-sm ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isCredit ? '+' : '-'}₹{tx.amount}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
