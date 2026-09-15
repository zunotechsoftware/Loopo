'use client';

import React, { useState } from 'react';
import { X, Flag, AlertTriangle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setReportModalOpen, showToast } from '@/redux/slices/uiSlice';
import { interactionsApi } from '@/services/interactionsApi';
import CustomSelect from './CustomSelect';

// Matches the ReportReason rows seeded in the backend (prisma/seed.ts) -
// reasonCode must be one of these exact, active codes or the API rejects
// the submission with a 400.
const REPORT_REASONS: { code: string; label: string }[] = [
  { code: 'SPAM', label: 'Spam / Advertising content' },
  { code: 'FRAUD', label: 'Fraudulent listings or activity' },
  { code: 'FAKE_PRODUCT', label: 'Fake or misrepresented product' },
  { code: 'DUPLICATE_LISTING', label: 'Duplicate product listing' },
  { code: 'WRONG_CATEGORY', label: 'Listing placed in incorrect category' },
  { code: 'COPYRIGHT_VIOLATION', label: 'Copyright / trademark violation' },
  { code: 'HARASSMENT', label: 'Harassment, hate speech, or abuse' },
  { code: 'ABUSIVE_LANGUAGE', label: 'Inappropriate or vulgar language' },
  { code: 'SCAM', label: 'Suspected scam or suspicious offer' },
  { code: 'ILLEGAL_ITEM', label: 'Sale of prohibited or illegal items' },
  { code: 'COUNTERFEIT', label: 'Counterfeit or replica products' },
  { code: 'OTHER', label: 'Other violation' },
];

export default function ReportModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isReportModalOpen);
  const target = useAppSelector((state) => state.ui.reportTarget);

  const [reasonCode, setReasonCode] = useState(REPORT_REASONS[0].code);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) {
      setError('Nothing selected to report - please try again from the listing or profile.');
      return;
    }
    if (!details.trim()) {
      setError('Please describe the issue.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await interactionsApi.submitReport({
        targetType: target.targetType,
        targetId: target.targetId,
        reasonCode,
        details: details.trim(),
      });
      if (!res.success) throw new Error(res.error || 'Failed to submit report');
      dispatch(setReportModalOpen(false));
      dispatch(showToast('Report submitted. Our trust & safety team will review it.'));
      setDetails('');
      setReasonCode(REPORT_REASONS[0].code);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Report {target?.targetType === 'USER' ? 'Seller' : target?.targetType === 'CHAT_MESSAGE' ? 'Conversation' : 'Listing'}</span>
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
            {target?.label ? `Reporting: ${target.label}. ` : ''}
            Help us maintain a safe marketplace. Reports are confidential and reviewed by our team.
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomSelect
            label="Reason for Report"
            options={REPORT_REASONS.map((r) => r.label)}
            value={REPORT_REASONS.find((r) => r.code === reasonCode)?.label || REPORT_REASONS[0].label}
            onChange={(label) => {
              const found = REPORT_REASONS.find((r) => r.label === label);
              if (found) setReasonCode(found.code);
            }}
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
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
            <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
