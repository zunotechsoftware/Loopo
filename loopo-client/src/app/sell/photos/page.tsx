'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addSellImage, removeSellImage, setPrimaryImage } from '@/redux/slices/sellSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';
import { ArrowRight, ArrowLeft, Camera, Trash2, Star, Plus } from 'lucide-react';

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // matches the page's own stated "up to 10MB"

export default function SellPhotosPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { images, primaryImageIndex } = useAppSelector((state) => state.sell.formData);
  const [isDragging, setIsDragging] = useState(false);

  // Shared by both the click-to-upload input and drag-and-drop, so both
  // paths validate and store images the same way (same FileReader ->
  // data-URL -> addSellImage flow already used for the create-listing
  // wizard, unchanged - see productsApi.uploadProductImages, which
  // uploads these same data URLs to the real storage backend once the
  // listing is published).
  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      dispatch(showToast(`You can upload up to ${MAX_IMAGES} photos.`));
      return;
    }

    const files = Array.from(fileList);
    const accepted = files.slice(0, remainingSlots);
    if (files.length > accepted.length) {
      dispatch(showToast(`Only ${remainingSlots} more photo${remainingSlots === 1 ? '' : 's'} can be added (max ${MAX_IMAGES}).`));
    }

    accepted.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        dispatch(showToast(`"${file.name}" isn't an image (PNG, JPG or WebP only).`));
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        dispatch(showToast(`"${file.name}" is over the 10MB limit.`));
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          dispatch(addSellImage(ev.target.result as string));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = ''; // allow re-selecting the same file after removing it
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-8 rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/40'
            : 'border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
          <Camera className="w-6 h-6" />
        </div>
        <div className="text-xs font-bold text-slate-800">
          {isDragging ? 'Drop photos to upload' : 'Click or drag & drop to upload product photos'}
        </div>
        <div className="text-[10px] text-slate-400 font-medium">PNG, JPG or WebP up to 10MB, max {MAX_IMAGES} photos</div>
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
