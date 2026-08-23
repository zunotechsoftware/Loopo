'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateSellForm } from '@/redux/slices/sellSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function SellDetailsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.sell.formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      dispatch(showToast('Please enter a product title'));
      return;
    }
    if (!formData.price.trim()) {
      dispatch(showToast('Please enter price'));
      return;
    }
    router.push(ROUTES.SELL_PHOTOS);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-black text-slate-900">Step 2: Product Details & Price</h2>
        <p className="text-xs text-slate-500 font-medium">Include detailed information to attract serious buyers.</p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Product Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => dispatch(updateSellForm({ title: e.target.value }))}
            placeholder="e.g. iPhone 15 Pro Max 256GB Natural Titanium"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Condition & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Condition *</label>
            <select
              value={formData.condition}
              onChange={(e) => dispatch(updateSellForm({ condition: e.target.value as any }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all"
            >
              <option value="Brand New">Brand New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Price (₹) *</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => dispatch(updateSellForm({ price: e.target.value }))}
              placeholder="e.g. 75000"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => dispatch(updateSellForm({ description: e.target.value }))}
            placeholder="Describe the condition, usage, accessories included, reason for selling..."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all h-28 resize-none"
          />
        </div>

        {/* Toggle options */}
        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isNegotiable}
              onChange={(e) => dispatch(updateSellForm({ isNegotiable: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span>Price is Negotiable</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.interestedInExchange}
              onChange={(e) => dispatch(updateSellForm({ interestedInExchange: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span>Interested in Exchange</span>
          </label>
        </div>
      </div>

      {/* Nav Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(ROUTES.SELL_CATEGORY)}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
        >
          <span>Next: Upload Photos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
