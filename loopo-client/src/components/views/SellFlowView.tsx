'use client';

import React, { useState, useRef } from 'react';
import { Camera, CheckCircle2, ArrowRight, ArrowLeft, Upload, MapPin, Tag, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveTab } from '@/redux/slices/navigationSlice';
import { showToast, setAuthModalOpen } from '@/redux/slices/uiSlice';
import { createProductThunk, fetchProductsThunk } from '@/redux/slices/productsSlice';
import { fetchMyAdsThunk } from '@/redux/slices/myAdsSlice';
import { getAuthToken } from '@/services/apiClient';
import CustomSelect from '@/components/ui/CustomSelect';

export default function SellFlowView() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Mobiles');
  const [condition, setCondition] = useState<'Brand New' | 'Like New' | 'Good' | 'Fair'>('Like New');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [interestedInExchange, setInterestedInExchange] = useState(false);
  const [isNegotiable, setIsNegotiable] = useState(false);

  const steps = [
    { num: 1, label: 'Add Photos' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Price & Location' },
    { num: 4, label: 'Preview' },
  ];

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    for (const file of fileList) {
      try {
        const compressed = await compressImage(file);
        setImages((prev) => [...prev, compressed]);
      } catch {
        // Fallback to raw reader if canvas fails
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setImages((prev) => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setLocation('');
    setImages([]);
    setStep(1);
    setCategory('Mobiles');
    setCondition('Like New');
  };

  const handleNext = () => {
    if (step === 1) {
      if (images.length === 0) {
        dispatch(showToast('Tip: Adding photos helps sell items 3x faster!'));
      }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim() || title.trim().length < 3) {
        dispatch(showToast('Please enter an ad title (at least 3 characters).'));
        return;
      }
      if (!description.trim() || description.trim().length < 10) {
        dispatch(showToast('Please add a brief description (at least 10 characters).'));
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        dispatch(showToast('Please enter a valid selling price.'));
        return;
      }
      if (!location.trim()) {
        dispatch(showToast('Please enter item location (city/area).'));
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!isAuthenticated && !getAuthToken()) {
        dispatch(showToast('Please log in or register to publish an ad on Loopo.'));
        dispatch(setAuthModalOpen(true));
        return;
      }

      if (isSubmitting) return;
      setIsSubmitting(true);

      const parsedPrice = parseFloat(price) || 0;
      const productImages =
        images.length > 0
          ? images
          : [
              'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
            ];

      dispatch(
        createProductThunk({
          title,
          category,
          description,
          price: parsedPrice,
          location,
          condition,
          images: productImages,
        })
      )
        .unwrap()
        .then(() => {
          setIsSubmitting(false);
          dispatch(showToast('Listing published to DB! 🎉'));
          resetForm();
          dispatch(fetchMyAdsThunk());
          dispatch(fetchProductsThunk({}));
          dispatch(setActiveTab('my-ads'));
        })
        .catch((err) => {
          setIsSubmitting(false);
          dispatch(showToast(typeof err === 'string' ? err : 'Failed to store listing in DB'));
        });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    } else {
      dispatch(setActiveTab('home'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Step Header Indicator */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h1 className="text-2xl font-black text-slate-900">Post an Ad</h1>

        <div className="grid grid-cols-4 gap-2">
          {steps.map((s) => (
            <div
              key={s.num}
              onClick={() => !isSubmitting && setStep(s.num as any)}
              className={`flex flex-col items-center p-2 rounded-2xl cursor-pointer transition-all ${
                step === s.num
                  ? 'bg-emerald-50 text-emerald-600 font-bold border border-emerald-200'
                  : step > s.num
                  ? 'text-emerald-700 font-semibold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                {step > s.num ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold">
                    {s.num}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Upload Photos */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Upload Item Photos</h2>
            <p className="text-xs text-slate-500 font-medium">Add up to 10 photos. Clear images increase buyer interest by 3x.</p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl p-10 text-center bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer space-y-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800">Upload Photos</div>
              <div className="text-xs text-slate-400 font-medium">Click to select files from your computer</div>
            </div>
          </div>

          {/* Uploaded Thumbnails List */}
          {images.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Uploaded Photos ({images.length})</label>
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">Cover</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-slate-900/70 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Item Details</h2>

          <CustomSelect
            label="Category"
            options={['Mobiles', 'Vehicles', 'Electronics', 'Home & Living', 'Property', 'Fashion', 'Jobs', 'Services']}
            value={category}
            onChange={setCategory}
          />

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Ad Title *</label>
            <input
              type="text"
              placeholder="e.g. iPhone 14 Pro Max 256GB - Mint Condition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Condition</label>
            <div className="grid grid-cols-4 gap-2">
              {(['Brand New', 'Like New', 'Good', 'Fair'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                    condition === c
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
            <textarea
              rows={4}
              placeholder="Include key details such as brand, model, age, condition, accessories included, and reason for selling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Step 3: Price & Location */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Price & Location</h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹) *</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-3 text-sm font-extrabold text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Location *</label>
            <input
              type="text"
              placeholder="e.g. Indiranagar, Bangalore, Karnataka"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700">Price is negotiable</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={interestedInExchange}
                onChange={(e) => setInterestedInExchange(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700">Interested in exchange</span>
            </label>
          </div>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Review & Publish</h2>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row gap-4">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt="Preview Cover"
                className="w-full sm:w-32 h-32 rounded-2xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-full sm:w-32 h-32 rounded-2xl bg-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1">
                <ImageIcon className="w-8 h-8" />
                <span className="text-[10px] font-bold">No Photo</span>
              </div>
            )}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{category}</span>
                <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{condition}</span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">{title || 'Untitled Listing'}</h3>
              <div className="text-xl font-black text-emerald-600">₹{parseFloat(price || '0').toLocaleString('en-IN')}</div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{location || 'Location not specified'}</span>
              </div>
              <p className="text-xs text-slate-600 font-normal line-clamp-2 pt-1 border-t border-slate-200/60">{description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleBack}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-8 py-3 rounded-2xl shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <span>{step === 4 ? 'Publish Ad' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
