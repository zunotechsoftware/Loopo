'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RightSidebarWidgets from '@/components/RightSidebarWidgets';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

// Interactive Endpoints Modals
import OfferModal from '@/components/ui/OfferModal';
import ReportModal from '@/components/ui/ReportModal';
import ReviewModal from '@/components/ui/ReviewModal';
import KycModal from '@/components/ui/KycModal';
import AddressModal from '@/components/ui/AddressModal';
import AuthModal from '@/components/ui/AuthModal';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearToast } from '@/redux/slices/uiSlice';
import { initAuthThunk } from '@/redux/slices/authSlice';
import { X, Sparkles } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const toastMessage = useAppSelector((state) => state.ui.toastMessage);

  // Initialize auth state from stored token on mount
  useEffect(() => {
    dispatch(initAuthThunk());
  }, [dispatch]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, dispatch]);

  const showRightSidebar =
    pathname === ROUTES.HOME ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/search');

  const isAuthPage =
    pathname === ROUTES.LOGIN ||
    pathname === ROUTES.REGISTER ||
    pathname === ROUTES.VERIFY_OTP ||
    pathname === ROUTES.ONBOARDING;

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-[100] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-200 border border-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">{toastMessage}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dispatch(clearToast());
              }}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white pb-16 md:pb-0">
      {/* Toast Notification Floating Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 duration-200 border border-slate-800">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => dispatch(clearToast())}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Header */}
      <Header />

      {/* Main Container Layout */}
      <div className="max-w-[1600px] w-full mx-auto flex-1 flex gap-6 px-4 lg:px-6 py-6">
        {/* Left Fixed Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Center View */}
        <main className="flex-1 min-w-0">{children}</main>

        {/* Right Widgets (Near You, Filters, Boost Ad) */}
        {showRightSidebar && <RightSidebarWidgets />}
      </div>

      {/* Endpoint Interactive Modals */}
      <OfferModal />
      <ReportModal />
      <ReviewModal />
      <KycModal />
      <AddressModal />
      <AuthModal />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
