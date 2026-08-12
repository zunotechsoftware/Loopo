'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  Phone,
  User,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setAuthModalOpen, showToast } from '@/redux/slices/uiSlice';
import {
  setAuthMode,
  setOtpTarget,
  loginSuccess,
  loginUserThunk,
  registerUserThunk,
} from '@/redux/slices/authSlice';
import { setActiveTab } from '@/redux/slices/navigationSlice';

export default function AuthModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isAuthModalOpen);
  const authMode = useAppSelector((state) => state.auth.authMode);
  const otpTarget = useAppSelector((state) => state.auth.otpTarget);

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('venkatesh@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Venkatesh');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [city, setCity] = useState('Bangalore');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUserThunk({ email, password }));
    dispatch(setAuthModalOpen(false));
    dispatch(showToast(`Welcome back! Logged in via API. 🎉`));
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerUserThunk({ email, password, firstName: name, phone }));
    dispatch(setOtpTarget(email || phone));
    dispatch(setAuthMode('otp'));
    dispatch(showToast(`Verification code sent to ${email || phone}`));
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setOtpTarget(email));
    dispatch(setAuthMode('otp'));
    dispatch(showToast(`Password reset OTP sent to ${email}`));
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginSuccess({ name: name || 'New User', email, phone }));
    dispatch(setAuthModalOpen(false));
    dispatch(showToast('Account verified successfully! Welcome to Loopo.'));
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) return;
    const updated = [...otpCode];
    updated[index] = val;
    setOtpCode(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/loopo.png" alt="Loopo" className="h-8 w-auto object-contain" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Secure Auth
            </span>
          </div>

          <button
            onClick={() => dispatch(setAuthModalOpen(false))}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Login / Signup) */}
        {(authMode === 'login' || authMode === 'signup') && (
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => dispatch(setAuthMode('login'))}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => dispatch(setAuthMode('signup'))}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* --- LOGIN FORM --- */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Welcome Back</h2>
              <p className="text-xs text-slate-500 font-medium">Log in to manage your ads, chats & wallet.</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => dispatch(setAuthMode('forgot'))}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Login to Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* --- SIGNUP FORM --- */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Create Free Account</h2>
              <p className="text-xs text-slate-500 font-medium">Join India's premier local buying & selling community.</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mobile</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
            >
              Send Verification OTP
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD FORM --- */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Reset Password</h2>
              <p className="text-xs text-slate-500 font-medium">Enter registered email or phone to receive reset code.</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email / Mobile</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => dispatch(setAuthMode('login'))}
                className="flex-1 border border-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl hover:bg-slate-50"
              >
                Back to Login
              </button>
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-2xl shadow-md shadow-emerald-500/20"
              >
                Send Reset Code
              </button>
            </div>
          </form>
        )}

        {/* --- OTP VERIFICATION FORM --- */}
        {authMode === 'otp' && (
          <form onSubmit={handleOtpVerify} className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Enter Verification Code</h2>
              <p className="text-xs text-slate-500 font-medium">We sent a 4-digit code to {otpTarget || email}</p>
            </div>

            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={otpCode[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-black bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
            >
              Verify Code & Login
            </button>

            <div className="text-[11px] text-slate-400 font-medium">
              Didn't receive code?{' '}
              <button
                type="button"
                onClick={() => dispatch(showToast('Resent OTP to registered number'))}
                className="text-emerald-600 font-bold hover:underline"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {/* Social Authentication Options */}
        {(authMode === 'login' || authMode === 'signup') && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Or continue with</div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  dispatch(loginSuccess({ name: 'Google User', email: 'google.user@gmail.com' }));
                  dispatch(setAuthModalOpen(false));
                  dispatch(showToast('Logged in via Google!'));
                }}
                className="flex items-center justify-center gap-2 p-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  dispatch(loginSuccess({ name: 'Apple User', email: 'apple.user@icloud.com' }));
                  dispatch(setAuthModalOpen(false));
                  dispatch(showToast('Logged in via Apple ID!'));
                }}
                className="flex items-center justify-center gap-2 p-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-4 h-4" />
                <span>Apple</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
