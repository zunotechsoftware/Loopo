'use client';

import React, { useState } from 'react';
import { Camera, CheckCircle2, ArrowRight, ArrowLeft, Upload, MapPin, Tag } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { setActiveTab } from '@/redux/slices/navigationSlice';
import { showToast } from '@/redux/slices/uiSlice';

export default function SellFlowView() {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [title, setTitle] = useState('iPhone 13 128GB');
  const [category, setCategory] = useState('Mobiles');
  const [description, setDescription] = useState('iPhone 13 in excellent condition. No scratches, all accessories original.');
  const [price, setPrice] = useState('32000');
  const [location, setLocation] = useState('Bangalore, Karnataka');
  const [interestedInExchange, setInterestedInExchange] = useState(false);

  const steps = [
    { num: 1, label: 'Add Photos' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Price & Location' },
    { num: 4, label: 'Preview' },
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4);
    } else {
      dispatch(showToast('Listing published successfully! 🎉'));
      dispatch(setActiveTab('my-ads'));
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
      {/* Step Header Indicator */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h1 className="text-2xl font-black text-slate-900">Post an Ad</h1>

        <div className="grid grid-cols-4 gap-2">
          {steps.map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num as any)}
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

          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl p-10 text-center bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800">Upload Photos</div>
              <div className="text-xs text-slate-400 font-medium">Drag & drop or browse from computer</div>
            </div>
          </div>

          {/* Sample Thumbnail Attached */}
          <div className="flex items-center gap-3">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop"
                alt="Uploaded sample"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">Cover</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Item Details</h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            >
              <option>Mobiles</option>
              <option>Cars</option>
              <option>Bikes</option>
              <option>Electronics</option>
              <option>Furniture</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Ad Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={4}
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
            <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">₹</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-3 text-sm font-extrabold text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none pt-2">
            <input
              type="checkbox"
              checked={interestedInExchange}
              onChange={(e) => setInterestedInExchange(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-semibold text-slate-700">Interested in exchange</span>
          </label>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Review & Publish</h2>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex gap-4">
            <img
              src="https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop"
              alt="Preview"
              className="w-24 h-24 rounded-2xl object-cover"
            />
            <div className="space-y-1">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{category}</span>
              <h3 className="font-extrabold text-slate-900 text-base">{title}</h3>
              <div className="text-lg font-black text-emerald-600">₹{parseInt(price || '0').toLocaleString('en-IN')}</div>
              <div className="text-xs text-slate-500 font-medium">{location}</div>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-8 py-3 rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
        >
          <span>{step === 4 ? 'Publish Ad' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
