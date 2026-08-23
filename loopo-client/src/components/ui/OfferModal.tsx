'use client';

import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setOfferModalOpen, showToast } from '@/redux/slices/uiSlice';

export default function OfferModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isOfferModalOpen);
  const selectedProductId = useAppSelector((state) => state.navigation.selectedProductId);
  const products = useAppSelector((state) => state.products.items);
  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [offerValue, setOfferValue] = useState(
    product ? Math.round(product.price * 0.9).toString() : ''
  );

  if (!isOpen) return null;

  if (!product) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
          <p className="text-slate-500 text-sm">No product selected.</p>
          <button
            onClick={() => dispatch(setOfferModalOpen(false))}
            className="text-xs font-bold text-emerald-600 underline"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const quickOffers = [
    Math.round(product.price * 0.95),
    Math.round(product.price * 0.9),
    Math.round(product.price * 0.85),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setOfferModalOpen(false));
    dispatch(showToast(`Offer of ₹${parseInt(offerValue).toLocaleString('en-IN')} sent to seller!`));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Make an Offer</span>
          </div>
          <button
            onClick={() => dispatch(setOfferModalOpen(false))}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Summary */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <img src={product.images[0]} alt={product.title} className="w-12 h-12 rounded-xl object-cover" />
          <div>
            <div className="font-bold text-xs text-slate-900 line-clamp-1">{product.title}</div>
            <div className="text-xs font-black text-emerald-600">Listing Price: ₹{product.price.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Quick Offer Chips */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Quick Offers
          </label>
          <div className="flex gap-2">
            {quickOffers.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setOfferValue(amt.toString())}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                  offerValue === amt.toString()
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Your Offer Price (₹)
            </label>
            <input
              type="number"
              value={offerValue}
              onChange={(e) => setOfferValue(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-base font-extrabold text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
          >
            Send Offer to Seller
          </button>
        </form>
      </div>
    </div>
  );
}
