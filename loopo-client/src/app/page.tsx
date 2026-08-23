'use client';

import React, { useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RightSidebarWidgets from '@/components/RightSidebarWidgets';
import Footer from '@/components/Footer';

// Views
import HomeView from '@/components/views/HomeView';
import ProductDetailView from '@/components/views/ProductDetailView';
// import ExploreView from '@/components/views/ExploreView'; // Commented out as requested
import CategoryView from '@/components/views/CategoryView';
import SellFlowView from '@/components/views/SellFlowView';
import MessagesView from '@/components/views/MessagesView';
import NotificationsView from '@/components/views/NotificationsView';
import MyAdsView from '@/components/views/MyAdsView';
// OrdersView removed as requested
import WalletView from '@/components/views/WalletView';
import ProfileView from '@/components/views/ProfileView';
import SettingsView from '@/components/views/SettingsView';
import HelpSupportView from '@/components/views/HelpSupportView';

// Interactive Endpoints Modals
import OfferModal from '@/components/ui/OfferModal';
import ReportModal from '@/components/ui/ReportModal';
import ReviewModal from '@/components/ui/ReviewModal';
import KycModal from '@/components/ui/KycModal';
import AddressModal from '@/components/ui/AddressModal';
import AuthModal from '@/components/ui/AuthModal';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveTab, ActiveTab } from '@/redux/slices/navigationSlice';
import { clearToast, setSellModalOpen } from '@/redux/slices/uiSlice';
import { X, Sparkles } from 'lucide-react';

export default function MainPage() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.navigation.activeTab);
  const isSellModalOpen = useAppSelector((state) => state.ui.isSellModalOpen);
  const toastMessage = useAppSelector((state) => state.ui.toastMessage);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (activeTab !== 'sell' && isSellModalOpen) {
      dispatch(setSellModalOpen(false));
    }
  }, [activeTab, isSellModalOpen, dispatch]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, dispatch]);

  // URL Routing Sync & Browser History Integration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab | null;
      if (tabParam) {
        dispatch(setActiveTab(tabParam));
      }
      return;
    }

    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.get('tab') !== activeTab) {
      currentUrl.searchParams.set('tab', activeTab);
      window.history.pushState({ tab: activeTab }, '', currentUrl.toString());
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentTab = (currentParams.get('tab') as ActiveTab) || 'home';
      dispatch(setActiveTab(currentTab));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [dispatch]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      /*
      case 'explore':
      case 'saved':
        return <ExploreView />;
      */
      case 'categories':
        return <CategoryView />;
      case 'product-detail':
        return <ProductDetailView />;
      case 'messages':
        return <MessagesView />;
      case 'notifications':
        return <NotificationsView />;
      case 'my-ads':
        return <MyAdsView />;
      case 'wallet':
        return <WalletView />;
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView />;
      case 'help':
        return <HelpSupportView />;
      default:
        return <HomeView />;
    }
  };

  const showRightSidebar =
    activeTab === 'home' || activeTab === 'categories';

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
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
        <main className="flex-1 min-w-0">
          {isSellModalOpen ? <SellFlowView /> : renderActiveView()}
        </main>

        {/* Right Widgets (Near You, Filters, Boost Ad) */}
        {!isSellModalOpen && showRightSidebar && <RightSidebarWidgets />}
      </div>

      {/* Endpoint Interactive Modals */}
      <OfferModal />
      <ReportModal />
      <ReviewModal />
      <KycModal />
      <AddressModal />
      <AuthModal />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
