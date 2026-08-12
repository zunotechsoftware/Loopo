'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  User,
  Bell,
  Lock,
  UserX,
  Globe,
  Moon,
  MapPin,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  toggleDarkMode,
  setAddressModalOpen,
  setKycModalOpen,
  showToast,
} from '@/redux/slices/uiSlice';

export default function SettingsView() {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);

  // Notification Preferences (Backend notification-settings endpoint)
  const [chatAlerts, setChatAlerts] = useState(true);
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h1 className="text-2xl font-black text-slate-900">Settings & Account Preferences</h1>

        {/* Account & Profile Options */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Account & Security</div>

          <div
            onClick={() => dispatch(setKycModalOpen(true))}
            className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-100/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900">KYC & Identity Verification</div>
                <div className="text-[10px] font-medium text-slate-400">Aadhaar / PAN identity document verification</div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Verified</span>
          </div>

          <div
            onClick={() => dispatch(setAddressModalOpen(true))}
            className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-100/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900">Address Book Management</div>
                <div className="text-[10px] font-medium text-slate-400">Manage default delivery & seller pickup locations</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          <div
            onClick={() => dispatch(showToast('Security & Password settings opened'))}
            className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-100/60 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900">Password & Security</div>
                <div className="text-[10px] font-medium text-slate-400">Change password & 2FA authentication</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* Notification Settings (Backend notification-settings endpoint) */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Notification Preferences
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-extrabold text-xs text-slate-900">Instant Chat Notifications</div>
                <div className="text-[10px] font-medium text-slate-400">Get push notifications when buyers/sellers message</div>
              </div>
              <input
                type="checkbox"
                checked={chatAlerts}
                onChange={(e) => {
                  setChatAlerts(e.target.checked);
                  dispatch(showToast('Notification preference saved!'));
                }}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <div>
                <div className="font-extrabold text-xs text-slate-900">Price Drop & Saved Item Alerts</div>
                <div className="text-[10px] font-medium text-slate-400">Get notified when favorited items reduce in price</div>
              </div>
              <input
                type="checkbox"
                checked={priceDropAlerts}
                onChange={(e) => {
                  setPriceDropAlerts(e.target.checked);
                  dispatch(showToast('Notification preference saved!'));
                }}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
              <div>
                <div className="font-extrabold text-xs text-slate-900">Promotional & Recommendations Email</div>
                <div className="text-[10px] font-medium text-slate-400">Receive weekly marketplace deals & updates</div>
              </div>
              <input
                type="checkbox"
                checked={promoEmails}
                onChange={(e) => {
                  setPromoEmails(e.target.checked);
                  dispatch(showToast('Notification preference saved!'));
                }}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Display & System */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Display Settings</div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900">Dark Mode UI</div>
                <div className="text-[10px] font-medium text-slate-400">Toggle high contrast dark skin</div>
              </div>
            </div>

            <button
              onClick={() => dispatch(toggleDarkMode())}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                isDarkMode ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
