'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createProductThunk } from '@/redux/slices/productsSlice';
import { setPublishedListingId, setSubmitting, resetSellForm } from '@/redux/slices/sellSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { productsApi } from '@/services/productsApi';
import { ROUTES } from '@/routes/routes';
import { ArrowLeft, CheckCircle2, Loader2, Edit3, MapPin, Tag, ShieldCheck } from 'lucide-react';

export default function SellPreviewPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { formData, isSubmitting } = useAppSelector((state) => state.sell);

  const primaryImage = formData.images[formData.primaryImageIndex] || formData.images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop';

  const handlePublish = async () => {
    if (!formData.categoryId) {
      dispatch(showToast('Please choose a category before publishing.'));
      router.push(ROUTES.SELL_CATEGORY);
      return;
    }
    // Re-validate here too, not just on the Details step's "Next" button -
    // Preview can be reached with stale/invalid data (e.g. navigating back
    // with the browser, or data left over from before this validation
    // existed), and this used to let Publish call the API anyway, which
    // then failed with a raw, easy-to-miss backend error and nothing
    // pointing the seller back at what to fix.
    const title = formData.title.trim();
    const description = formData.description.trim();
    if (title.length < 3 || title.length > 100) {
      dispatch(showToast('Product title must be 3-100 characters - please fix it on the Details step.'));
      router.push(ROUTES.SELL_DETAILS);
      return;
    }
    if (!formData.price.trim() || Number(formData.price) <= 0) {
      dispatch(showToast('Please enter a valid price on the Details step.'));
      router.push(ROUTES.SELL_DETAILS);
      return;
    }
    if (description.length < 10 || description.length > 2000) {
      dispatch(showToast('Description must be 10-2000 characters - please fix it on the Details step.'));
      router.push(ROUTES.SELL_DETAILS);
      return;
    }
    dispatch(setSubmitting(true));
    try {
      const priceNum = Number(formData.price) || 5000;
      const res = await dispatch(
        createProductThunk({
          title: formData.title || 'Pre-loved Item',
          description: formData.description || 'Great condition item for sale.',
          price: priceNum,
          categoryId: formData.categoryId,
          condition: formData.condition || 'Like New',
          location: `${formData.area || 'Indiranagar'}, ${formData.city || 'Bangalore'}`,
          // The real, separate fields the location step actually collected -
          // avoids re-parsing the ambiguous display string above apart,
          // which previously swapped city/area (every listing published
          // through this wizard stored the locality as its "city").
          locationDetails: {
            city: formData.city || 'Bangalore',
            area: formData.area || 'Indiranagar',
            zipCode: formData.pincode || '560038',
          },
          images: formData.images.length > 0 ? formData.images : [primaryImage],
          negotiable: formData.isNegotiable,
        })
      );

      if (createProductThunk.fulfilled.match(res)) {
        const listingId = res.payload?.id || 'prod-' + Date.now();
        dispatch(setPublishedListingId(listingId));

        // Photos were only ever kept in Redux as data URLs and never
        // actually sent anywhere - upload them now that the listing has a
        // real id (the backend's media pipeline is per-listing: presign,
        // PUT to S3, then register). Best-effort: a failed photo doesn't
        // block the listing itself from being published.
        if (formData.images.length > 0) {
          const { failed } = await productsApi.uploadProductImages(listingId, formData.images);
          if (failed > 0) {
            dispatch(showToast(`Listing published, but ${failed} photo${failed > 1 ? 's' : ''} failed to upload.`));
          }
        }

        dispatch(setSubmitting(false));
        dispatch(showToast('Listing published successfully! 🎉'));
        router.push(ROUTES.SELL_SUCCESS);
      } else {
        dispatch(setSubmitting(false));
        const err = (res.payload as string) || 'Failed to publish listing. Please verify login.';
        dispatch(showToast(err));
      }
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
