'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Upload, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setKycModalOpen, showToast } from '@/redux/slices/uiSlice';
import CustomSelect from './CustomSelect';

export default function KycModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isKycModalOpen);
  const [docType, setDocType] = useState('Aadhaar Card');
  const [docNumber, setDocNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setKycModalOpen(false));
    dispatch(showToast('KYC Verification Submitted! Documents are being verified.'));
    setDocNumber('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Seller KYC Identity Verification</span>
          </div>
          <button
            onClick={() => dispatch(setKycModalOpen(false))}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Get verified to unlock unlimited listings, build buyer trust, and display the Verified Seller badge.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomSelect
            label="Government ID Type"
            options={['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License']}
            value={docType}
            onChange={setDocType}
          />

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Document Number
            </label>
            <input
              type="text"
              placeholder="e.g. XXXX XXXX XXXX"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Upload Front Photo
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50 hover:bg-emerald-50/50 cursor-pointer transition-all">
              <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs font-bold text-slate-700">Click to upload document photo</div>
              <div className="text-[10px] text-slate-400 font-medium">PNG, JPG or PDF up to 5MB</div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Submit Verification Request</span>
          </button>
        </form>
      </div>
    </div>
  );
}
