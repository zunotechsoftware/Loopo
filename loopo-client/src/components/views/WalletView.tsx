'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History, Rocket, Tag, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addMoney, fetchWalletThunk } from '@/redux/slices/walletSlice';
import { showToast } from '@/redux/slices/uiSlice';

export default function WalletView() {
  const dispatch = useAppDispatch();
  const wallet = useAppSelector((state) => state.wallet);
  const [couponCode, setCouponCode] = useState('');

  // Fetch real wallet balance from API on mount
  useEffect(() => {
    dispatch(fetchWalletThunk());
  }, [dispatch]);

  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(wallet.balance);

  const handleAddFunds = () => {
    dispatch(addMoney(1000));
    dispatch(showToast('Added ₹1,000 to wallet! 💳'));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    dispatch(showToast(`Coupon "${couponCode.toUpperCase()}" applied! 15% bonus added.`));
    setCouponCode('');
  };

  const boostPackages = [
    {
      id: 'boost-1',
      name: 'Top of Search',
      duration: '3 Days',
      price: '₹199',
      views: '5x higher reach',
      badge: 'Popular',
    },
    {
      id: 'boost-2',
      name: 'Featured Marketplace Ad',
      duration: '7 Days',
      price: '₹399',
      views: '10x reach + Homepage Banner',
      badge: 'Best Value',
    },
    {
      id: 'boost-3',
      name: 'Urgent Tag Listing',
      duration: '14 Days',
      price: '₹499',
      views: 'High priority buyer alerts',
      badge: 'Fast Sale',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Wallet Balance Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <div className="text-xs font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-4 h-4" />
            <span>Loopo Wallet & Payments</span>
          </div>
          <div className="text-4xl font-black tracking-tight">{formattedBalance}</div>
          <div className="text-xs text-emerald-200 font-medium">Available for Ad Boosts, Subscriptions & Instant Payouts</div>
        </div>

        <button
          onClick={handleAddFunds}
          className="relative z-10 flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Funds</span>
        </button>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Ad Boost Packages Section (Backend boost / featured / subscriptions endpoints) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <Rocket className="w-5 h-5 text-emerald-600" />
            <span>Boost Your Ad & Sell 10x Faster</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Active Subscription: Pro Seller</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {boostPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-4 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-500 rounded-2xl space-y-3 transition-all flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                  {pkg.badge}
                </span>
                <h3 className="font-extrabold text-slate-900 text-xs">{pkg.name}</h3>
                <div className="text-lg font-black text-emerald-600">{pkg.price}</div>
                <div className="text-[11px] text-slate-500 font-medium">{pkg.duration} • {pkg.views}</div>
              </div>

              <button
                onClick={() => dispatch(showToast(`Boost package "${pkg.name}" activated!`))}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all"
              >
                Boost Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon Code Input (Backend coupons endpoint) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-xs">Have a Promo Coupon Code?</div>
            <div className="text-[11px] text-slate-400 font-medium">Redeem promotional discount credits for ad boosts</div>
          </div>
        </div>

        <form onSubmit={handleApplyCoupon} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Enter Code (e.g. BOOST50)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold uppercase text-slate-800 outline-none focus:border-emerald-500 w-full sm:w-44"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
            <History className="w-4 h-4 text-emerald-600" />
            <span>Transaction History</span>
          </div>
          <span className="text-xs font-semibold text-slate-400">All Payments & Credits</span>
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
