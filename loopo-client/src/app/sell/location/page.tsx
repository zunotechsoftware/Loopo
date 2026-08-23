'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateSellForm } from '@/redux/slices/sellSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';
import { ArrowRight, ArrowLeft, MapPin, Building, Navigation } from 'lucide-react';

export default function SellLocationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const formData = useAppSelector((state) => state.sell.formData);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city || !formData.area) {
      dispatch(showToast('Please specify city and area'));
      return;
    }
    const fullLocation = `${formData.area}, ${formData.city}`;
    dispatch(updateSellForm({ location: fullLocation }));
    router.push(ROUTES.SELL_PREVIEW);
  };

  return (
    <form onSubmit={handleNext} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-black text-slate-900">Step 4: Listing Location</h2>
        <p className="text-xs text-slate-500 font-medium">Help nearby buyers find your item.</p>
      </div>

      <div className="space-y-4">
        {/* City */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">City *</label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <select
              value={formData.city}
              onChange={(e) => dispatch(updateSellForm({ city: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all"
            >
              <option value="Bangalore">Bangalore, Karnataka</option>
              <option value="Mumbai">Mumbai, Maharashtra</option>
              <option value="Delhi">Delhi, NCR</option>
              <option value="Hyderabad">Hyderabad, Telangana</option>
              <option value="Chennai">Chennai, Tamil Nadu</option>
              <option value="Pune">Pune, Maharashtra</option>
            </select>
          </div>
        </div>

        {/* Locality / Area */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Locality / Area *</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={formData.area}
              onChange={(e) => dispatch(updateSellForm({ area: e.target.value }))}
              placeholder="e.g. Indiranagar, HSR Layout"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Pincode */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Pincode</label>
          <div className="relative">
            <Navigation className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => dispatch(updateSellForm({ pincode: e.target.value }))}
              placeholder="e.g. 560038"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Nav Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(ROUTES.SELL_PHOTOS)}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
        >
          <span>Next: Review & Publish</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
