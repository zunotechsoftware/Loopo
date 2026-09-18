'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Upload, ArrowLeft, ShieldCheck, Loader2, CheckCircle2, Camera } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';
import { userApi, SubmitKycPayload } from '@/services/userApi';
import Link from 'next/link';

const DOC_TYPES: { label: string; value: SubmitKycPayload['documentType'] }[] = [
  { label: 'Aadhaar Card', value: 'AADHAAR' },
  { label: 'PAN Card', value: 'PAN' },
  { label: 'Driving License', value: 'DRIVING_LICENSE' },
  { label: 'Passport', value: 'PASSPORT' },
];

function UploadSlot({ label, hint, file, onPick, icon: Icon }: {
  label: string; hint: string; file: File | null; onPick: (f: File) => void; icon: React.ElementType;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed p-6 rounded-2xl text-center space-y-2 cursor-pointer transition-all ${
          file ? 'border-emerald-400 bg-emerald-50/40' : 'border-slate-200 bg-slate-50/50 hover:border-emerald-400'
        }`}
      >
        {file ? (
          <>
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="text-xs font-bold text-emerald-700">{file.name}</div>
            <div className="text-[10px] text-slate-400 font-medium">Tap to change</div>
          </>
        ) : (
          <>
            <Icon className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">{hint}</div>
            <div className="text-[10px] text-slate-400 font-medium">PNG, JPG or WEBP up to 5MB</div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerificationDocumentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [docType, setDocType] = useState<SubmitKycPayload['documentType']>('AADHAAR');
  const [docNumber, setDocNumber] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) {
      setError('Please enter your document number.');
      return;
    }
    if (!frontFile || !selfieFile) {
      setError('Front document photo and a selfie are both required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Both required images (and the optional back) must be uploaded and
      // registered as MediaFile rows before the KYC application itself can
      // reference them - the backend has no other way to receive image bytes.
      const frontImageId = await userApi.uploadKycImage('FRONT', frontFile);
      const selfieImageId = await userApi.uploadKycImage('SELFIE', selfieFile);
      const backImageId = backFile ? await userApi.uploadKycImage('BACK', backFile) : undefined;

      const res = await userApi.submitKyc({
        documentType: docType,
        documentNumber: docNumber.trim(),
        frontImageId,
        selfieImageId,
        backImageId,
      });
      if (!res.success) {
        throw new Error(res.error || 'Submission failed.');
      }
      dispatch(showToast('Documents submitted for verification review!'));
      router.push(ROUTES.VERIFICATION_REVIEW);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit documents. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <p className="text-xs text-slate-500 font-medium">Government ID proof (Aadhaar, PAN, Passport, Driving License) plus a live selfie for face match.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">{error}</div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as SubmitKycPayload['documentType'])}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
              >
                {DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Document Number / ID *</label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. XXXX XXXX XXXX"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
              />
            </div>

            <UploadSlot label="Front of Document *" hint="Upload front image" file={frontFile} onPick={setFrontFile} icon={Upload} />
            <UploadSlot label="Back of Document (optional)" hint="Upload back image" file={backFile} onPick={setBackFile} icon={Upload} />
            <UploadSlot label="Live Selfie *" hint="Upload a selfie for face match" file={selfieFile} onPick={setSelfieFile} icon={Camera} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading &amp; Submitting...</span>
                </>
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
