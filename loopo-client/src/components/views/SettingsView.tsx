'use client';

import React from 'react';
import { ChevronRight, User, Bell, Lock, UserX, Globe, Moon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toggleDarkMode, showToast } from '@/redux/slices/uiSlice';

export default function SettingsView() {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);

  const settingsOptions = [
    { icon: User, label: 'Account Settings', sub: 'Manage personal details & security' },
    { icon: Bell, label: 'Notification Settings', sub: 'Configure email & push notifications' },
    { icon: Lock, label: 'Privacy Settings', sub: 'Control listing visibility & data' },
    { icon: UserX, label: 'Blocked Users', sub: 'Manage blocked buyers & sellers' },
    { icon: Globe, label: 'Language', sub: 'English (US)' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h1 className="text-2xl font-black text-slate-900">Settings</h1>

        <div className="space-y-2">
          {settingsOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.label}
                onClick={() => dispatch(showToast(`${opt.label} opened`))}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-100/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-slate-900">{opt.label}</div>
                    <div className="text-[10px] font-medium text-slate-400">{opt.sub}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            );
          })}

          {/* Dark Mode Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900">Dark Mode</div>
                <div className="text-[10px] font-medium text-slate-400">Toggle dark UI mode</div>
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
