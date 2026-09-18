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
  MailCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setAuthModalOpen, showToast } from '@/redux/slices/uiSlice';
import {
  setAuthMode,
  loginUserThunk,
  registerUserThunk,
} from '@/redux/slices/authSlice';
import { authApi } from '@/services/authApi';

export default function AuthModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isAuthModalOpen);
  const authMode = useAppSelector((state) => state.auth.authMode);
  const { loading, error } = useAppSelector((state) => state.auth);

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUserThunk({ email, password }));
    if (loginUserThunk.fulfilled.match(resultAction)) {
      dispatch(setAuthModalOpen(false));
      dispatch(showToast(`Welcome back! Logged in successfully. 🎉`));
    } else {
      const err = (resultAction.payload as string) || 'Login failed. Please check your credentials.';
      dispatch(showToast(err));
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || name || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const resultAction = await dispatch(registerUserThunk({ email, password, firstName, lastName, phone }));
    if (registerUserThunk.fulfilled.match(resultAction)) {
      dispatch(setAuthModalOpen(false));
      dispatch(showToast(`Account created! Welcome to Loopo 🎉`));
    } else {
      const err = (resultAction.payload as string) || 'Registration failed.';
      dispatch(showToast(err));
    }
  };


  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitting(true);
    // Real password reset is a link sent to the registered email (see
    // /auth/forgot-password + /auth/reset-password), not an OTP code -
    // this used to fake sending an OTP and then log the user in as
    // whatever name/email/phone was typed into the OTP screen, with zero
    // real verification of anything.
    const res = await authApi.forgotPassword(email);
    setForgotSubmitting(false);
    if (res.success) {
      setResetEmailSent(true);
    } else {
      dispatch(showToast(res.error || 'Could not send reset email'));
    }
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
                  placeholder="name@example.com"
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
                  placeholder="Enter password"
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
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Logging in...' : 'Login to Account'}</span>
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
                  placeholder="Full Name"
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
                  placeholder="name@example.com"
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
                  placeholder="10-digit mobile"
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
                  placeholder="City (e.g. Bangalore)"
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
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* --- FORGOT PASSWORD FORM --- */}
        {authMode === 'forgot' && (
          resetEmailSent ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <MailCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Check Your Email</h2>
                <p className="text-xs text-slate-500 font-medium">
                  If an account exists for {email}, a password reset link has been sent to it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setResetEmailSent(false);
                  dispatch(setAuthMode('login'));
                }}
                className="w-full border border-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl hover:bg-slate-50"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Reset Password</h2>
                <p className="text-xs text-slate-500 font-medium">Enter your registered email to receive a reset link.</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Registered email"
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
                  disabled={forgotSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-2xl shadow-md shadow-emerald-500/20"
                >
                  {forgotSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}
