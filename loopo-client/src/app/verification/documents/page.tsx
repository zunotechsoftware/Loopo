'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Upload, ArrowLeft, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';
import Link from 'next/link';

export default function VerificationDocumentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [idType, setIdType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dispatch(showToast('Documents submitted for verification review!'));
      router.push(ROUTES.VERIFICATION_REVIEW);
    }, 1000);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <Link
              href={ROUTES.VERIFICATION}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Verification</span>
            </Link>

            <h1 className="text-xl font-black text-slate-900">Upload Verification Documents</h1>
            <p className="text-xs text-slate-500 font-medium">Government ID proof (Aadhaar, PAN, Passport, Driving License)</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Document Type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Document Number / ID</label>
              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. XXXX XXXX XXXX"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
              />
            </div>

            <div className="border-2 border-dashed border-slate-200 p-6 rounded-2xl text-center space-y-2 cursor-pointer bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">Upload Front & Back Image</div>
              <div className="text-[10px] text-slate-400 font-medium">PNG, JPG up to 5MB</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit for Review</span>
                </>
              )}
            </button>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
