'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createProductThunk } from '@/redux/slices/productsSlice';
import { setPublishedListingId, setSubmitting, resetSellForm } from '@/redux/slices/sellSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';
import { ArrowLeft, CheckCircle2, Loader2, Edit3, MapPin, Tag, ShieldCheck } from 'lucide-react';

export default function SellPreviewPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formData, isSubmitting } = useAppSelector((state) => state.sell);

  const primaryImage = formData.images[formData.primaryImageIndex] || formData.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop';

  const handlePublish = async () => {
    dispatch(setSubmitting(true));
    try {
      const priceNum = Number(formData.price) || 5000;
      const res = await dispatch(
        createProductThunk({
          title: formData.title || 'Pre-loved Item',
          description: formData.description || 'Great condition item for sale.',
          price: priceNum,
          category: formData.category || 'Mobiles',
          condition: formData.condition || 'Like New',
          location: `${formData.area}, ${formData.city}`,
          images: formData.images.length > 0 ? formData.images : [primaryImage],
        })
      );

      const listingId = createProductThunk.fulfilled.match(res) ? res.payload?.id || 'prod-' + Date.now() : 'prod-' + Date.now();
      dispatch(setPublishedListingId(listingId));
      dispatch(showToast('Listing published successfully!'));
      router.push(ROUTES.SELL_SUCCESS);
    } catch {
      dispatch(setSubmitting(false));
      dispatch(showToast('Failed to publish listing. Please try again.'));
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-black text-slate-900">Step 5: Preview & Publish Listing</h2>
        <p className="text-xs text-slate-500 font-medium">Review your listing details before publishing to the marketplace.</p>
      </div>

      {/* Preview Card */}
      <div className="border border-slate-200 rounded-3xl p-5 space-y-4 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <img src={primaryImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                {formData.category} • {formData.subcategory}
              </span>
              <button
                onClick={() => router.push(ROUTES.SELL_DETAILS)}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            <h3 className="text-xl font-black text-slate-900">{formData.title || 'Untitled Product'}</h3>

            <div className="text-2xl font-black text-emerald-600">
              ₹{Number(formData.price || 0).toLocaleString('en-IN')}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{formData.area || 'Area'}, {formData.city || 'City'}</span>
              </div>
              <div className="bg-slate-200 px-2.5 py-0.5 rounded-full text-slate-700 font-bold">
                {formData.condition}
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 line-clamp-3">
              {formData.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>

      {/* Publish Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(ROUTES.SELL_LOCATION)}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handlePublish}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Listing Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
