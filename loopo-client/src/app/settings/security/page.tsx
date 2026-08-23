'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { Lock, ShieldCheck, Smartphone, Laptop, LogOut, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

export default function SecuritySettingsPage() {
  const dispatch = useAppDispatch();

  const [activeSessions, setActiveSessions] = useState([
    { id: 's-1', device: 'Chrome on Windows 11', ip: '106.51.72.19', location: 'Bangalore, India', current: true, time: 'Active now' },
    { id: 's-2', device: 'Loopo App on iPhone 15', ip: '49.37.18.204', location: 'Bangalore, India', current: false, time: '2 hours ago' },
  ]);

  const handleLogoutOtherDevices = () => {
    setActiveSessions((prev) => prev.filter((s) => s.current));
    dispatch(showToast('Logged out from all other active sessions!'));
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <Link
              href={ROUTES.SETTINGS}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Settings</span>
            </Link>

            <h1 className="text-xl font-black text-slate-900">Security & Sessions</h1>
            <p className="text-xs text-slate-500 font-medium">Manage active logins, password, and session security</p>
          </div>

          {/* Active Sessions */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Active Login Sessions</h2>
              {activeSessions.length > 1 && (
                <button
                  onClick={handleLogoutOtherDevices}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout All Others
                </button>
              )}
            </div>

            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    {session.device.includes('iPhone') ? (
                      <Smartphone className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Laptop className="w-5 h-5 text-emerald-600" />
                    )}
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{session.device}</span>
                        {session.current && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                            Current Device
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {session.location} • {session.ip} • {session.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
