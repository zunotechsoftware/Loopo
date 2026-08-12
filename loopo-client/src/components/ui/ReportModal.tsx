'use client';

import React, { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setReportModalOpen, showToast } from '@/redux/slices/uiSlice';
import CustomSelect from './CustomSelect';

export default function ReportModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isReportModalOpen);
  const selectedProductId = useAppSelector((state) => state.navigation.selectedProductId);
  const products = useAppSelector((state) => state.products.items);
  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [reason, setReason] = useState('Fraudulent / Scam');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const reportReasons = [
    'Fraudulent / Scam',
    'Offensive / Inappropriate Content',
    'Incorrect Pricing or Description',
    'Duplicate Listing',
    'Item Already Sold',
    'Other Reason',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setReportModalOpen(false));
    dispatch(showToast(`Report submitted for "${product?.title || 'item'}". Our trust & safety team will review it.`));
    setDetails('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Report Listing or Seller</span>
          </div>
          <button
            onClick={() => dispatch(setReportModalOpen(false))}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium bg-red-50/70 p-3 rounded-2xl border border-red-100 flex items-start gap-2.5">
          <Flag className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>
            Help us maintain a safe marketplace. Reports are confidential and reviewed within 24 hours.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomSelect
            label="Reason for Report"
            options={reportReasons}
            value={reason}
            onChange={setReason}
          />

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Additional Comments / Details
            </label>
            <textarea
              rows={3}
              placeholder="Describe the issue in detail..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Flag className="w-4 h-4" />
            <span>Submit Report</span>
          </button>
        </form>
      </div>
    </div>
  );
}
