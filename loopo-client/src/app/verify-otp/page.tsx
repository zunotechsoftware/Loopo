'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { sendPhoneOtpThunk, verifyPhoneOtpThunk, clearAuthError } from '@/redux/slices/authSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const redirectPath = searchParams.get('redirect') || ROUTES.HOME;

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sending, setSending] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const hasSentInitial = useRef(false);

  const startCooldown = () => {
    setSecondsRemaining(RESEND_COOLDOWN_SECONDS);
  };

  const sendOtp = async () => {
    if (!phone) return;
    setSending(true);
    const res = await dispatch(sendPhoneOtpThunk(phone));
    setSending(false);
    if (sendPhoneOtpThunk.fulfilled.match(res)) {
      // No real SMS gateway is configured in this environment - outside
      // production the backend echoes the real code back here so the flow
      // is actually testable. This never happens in production.
      const devOtp = (res.payload as any)?.devOtp;
      dispatch(showToast(devOtp ? `[DEV MODE] Your OTP is ${devOtp}` : `OTP sent to ${phone}`));
      startCooldown();
    } else {
      dispatch(showToast((res.payload as string) || 'Could not send OTP'));
    }
  };

  // Send a real OTP once, the moment this screen loads - covers both entry
  // points (login page's "Mobile OTP Login" and right after email
  // registration), instead of assuming one was already sent.
  useEffect(() => {
    if (!phone) {
      dispatch(showToast('No phone number to verify'));
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (hasSentInitial.current) return;
    hasSentInitial.current = true;
    sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const timer = setTimeout(() => setSecondsRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsRemaining]);

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      dispatch(showToast('Please enter full 6-digit OTP'));
      return;
    }

    const res = await dispatch(verifyPhoneOtpThunk({ phone, otp: otpCode }));
    if (verifyPhoneOtpThunk.fulfilled.match(res)) {
      dispatch(showToast('OTP verified successfully!'));
      router.push(redirectPath);
    }
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                className="w-11 h-12 text-center text-lg font-black bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || sending}
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
          onClick={sendOtp}
          disabled={sending || secondsRemaining > 0}
          className="text-xs font-bold text-emerald-600 hover:underline disabled:text-slate-400 disabled:no-underline"
        >
          {sending
            ? 'Sending...'
            : secondsRemaining > 0
            ? `Resend OTP in ${secondsRemaining}s`
            : 'Resend OTP Code'}
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
