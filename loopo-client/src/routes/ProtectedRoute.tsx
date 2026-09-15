'use client';

import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setAuthModalOpen, showToast } from '@/redux/slices/uiSlice';
import { LogIn, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);



  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900">Login Required</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Please log in or create an account to access this feature on Loopo.
          </p>
        </div>
        <button
          onClick={() => dispatch(setAuthModalOpen(true))}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span>Log In / Create Account</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

