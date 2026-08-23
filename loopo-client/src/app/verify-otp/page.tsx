'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAppDispatch } from '@/redux/hooks';
import { loginSuccess } from '@/redux/slices/authSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '+91 98765 43210';
  const redirectPath = searchParams.get('redirect') || ROUTES.HOME;

  const dispatch = useAppDispatch();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      dispatch(showToast('Please enter full 6-digit OTP'));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dispatch(
        loginSuccess({
          name: 'Verified User',
          email: 'user@loopo.com',
          phone,
        })
      );
      dispatch(showToast('OTP verified successfully!'));
      router.push(redirectPath);
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900">Verify OTP</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Enter the 6-digit code sent to <span className="font-bold text-slate-800">{phone}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                className="w-11 h-12 text-center text-lg font-black bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Verify Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => dispatch(showToast('Resent OTP to ' + phone))}
          className="text-xs font-bold text-emerald-600 hover:underline"
        >
          Resend OTP Code
        </button>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </MainLayout>
  );
}
