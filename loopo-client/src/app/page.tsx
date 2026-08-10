'use client';

import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RightSidebarWidgets from '@/components/RightSidebarWidgets';
import Footer from '@/components/Footer';

// Views
import HomeView from '@/components/views/HomeView';
import ProductDetailView from '@/components/views/ProductDetailView';
import ExploreView from '@/components/views/ExploreView';
import CategoryView from '@/components/views/CategoryView';
import SellFlowView from '@/components/views/SellFlowView';
import MessagesView from '@/components/views/MessagesView';
import MyAdsView from '@/components/views/MyAdsView';
import OrdersView from '@/components/views/OrdersView';
import WalletView from '@/components/views/WalletView';
import ProfileView from '@/components/views/ProfileView';
import SettingsView from '@/components/views/SettingsView';
import HelpSupportView from '@/components/views/HelpSupportView';

// Modals
import OfferModal from '@/components/ui/OfferModal';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearToast, setSellModalOpen } from '@/redux/slices/uiSlice';
import { X, Sparkles } from 'lucide-react';

export default function MainPage() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.navigation.activeTab);
  const isSellModalOpen = useAppSelector((state) => state.ui.isSellModalOpen);
  const toastMessage = useAppSelector((state) => state.ui.toastMessage);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, dispatch]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'explore':
      case 'saved':
        return <ExploreView />;
      case 'categories':
        return <CategoryView />;
      case 'product-detail':
        return <ProductDetailView />;
      case 'messages':
        return <MessagesView />;
      case 'my-ads':
        return <MyAdsView />;
      case 'orders':
        return <OrdersView />;
      case 'wallet':
        return <WalletView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpSupportView />;
      default:
        return <HomeView />;
    }
  };

  const showRightSidebar =
    activeTab === 'home' || activeTab === 'explore' || activeTab === 'categories';

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Floating Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
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

      {/* Interactive Modals */}
      <OfferModal />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
