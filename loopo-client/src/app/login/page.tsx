'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginUserThunk, clearAuthError } from '@/redux/slices/authSlice';
import { showToast } from '@/redux/slices/uiSlice';
import { Mail, Lock, Smartphone, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || ROUTES.HOME;

  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());

    if (mode === 'email') {
      if (!email || !password) {
        dispatch(showToast('Please enter email and password'));
        return;
      }
      const res = await dispatch(loginUserThunk({ email, password }));
      if (loginUserThunk.fulfilled.match(res)) {
        dispatch(showToast('Logged in successfully!'));
        router.push(redirectPath);
      }
    } else {
      if (!phone || phone.length < 10) {
        dispatch(showToast('Please enter a valid phone number'));
        return;
      }
      router.push(`${ROUTES.VERIFY_OTP}?phone=${encodeURIComponent(phone)}&redirect=${encodeURIComponent(redirectPath)}`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Welcome Back to Loopo</h1>
          <p className="text-xs text-slate-500 font-medium">Log in to buy, sell, and message sellers</p>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => setMode('phone')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'phone' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mobile OTP Login
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3 rounded-2xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'email' ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@loopo.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mobile Number</label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'email' ? 'Log In' : 'Send OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="text-center pt-2 text-xs font-semibold text-slate-500 space-y-2">
          <div>
            Don&apos;t have an account?{' '}
            <Link href={ROUTES.REGISTER} className="text-emerald-600 font-bold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading...</div>}>
        <LoginContent />
      </Suspense>
    </MainLayout>
  );
}
