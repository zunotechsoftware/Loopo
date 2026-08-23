'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addSellImage, removeSellImage, setPrimaryImage } from '@/redux/slices/sellSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';
import { ArrowRight, ArrowLeft, Camera, Trash2, Star, Plus } from 'lucide-react';

export default function SellPhotosPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { images, primaryImageIndex } = useAppSelector((state) => state.sell.formData);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          dispatch(addSellImage(ev.target.result as string));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleNext = () => {
    if (images.length === 0) {
      dispatch(showToast('Please upload at least 1 image'));
      return;
    }
    router.push(ROUTES.SELL_LOCATION);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg font-black text-slate-900">Step 3: Upload Product Photos</h2>
        <p className="text-xs text-slate-500 font-medium">Add up to 10 clear photos. Select your primary cover photo.</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 p-8 rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
      >
        <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
          <Camera className="w-6 h-6" />
        </div>
        <div className="text-xs font-bold text-slate-800">Click to upload product photos</div>
        <div className="text-[10px] text-slate-400 font-medium">PNG, JPG or WebP up to 10MB</div>
      </div>

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Uploaded Photos ({images.length})</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => {
              const isPrimary = primaryImageIndex === idx;
              return (
                <div
                  key={idx}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 group ${
                    isPrimary ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-100'
                  }`}
                >
                  <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />

                  {/* Primary Badge */}
                  {isPrimary && (
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-white" /> Primary Cover
                    </span>
                  )}

                  {/* Actions */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => dispatch(setPrimaryImage(idx))}
                        className="p-1.5 bg-white text-slate-700 rounded-lg text-[10px] font-bold shadow hover:bg-slate-100"
                        title="Set Primary"
                      >
                        Set Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => dispatch(removeSellImage(idx))}
                      className="p-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nav Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(ROUTES.SELL_DETAILS)}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
        >
          <span>Next: Select Location</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
