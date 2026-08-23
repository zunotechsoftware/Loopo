'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { UserX, ShieldCheck, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

export default function BlockedUsersPage() {
  const dispatch = useAppDispatch();

  const [blockedUsers, setBlockedUsers] = useState([
    { id: 'b-1', name: 'Spam Seller 99', reason: 'Repeated spam messages', blockedDate: '10 days ago' },
    { id: 'b-2', name: 'Fake Buyer', reason: 'Unreasonable lowball harassment', blockedDate: '1 month ago' },
  ]);

  const handleUnblock = (id: string, name: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u.id !== id));
    dispatch(showToast(`Unblocked ${name}`));
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">Blocked Users</h1>
                <p className="text-xs text-slate-500 font-medium">Manage blocked users who cannot message you.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {blockedUsers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
                You have no blocked users.
              </div>
            ) : (
              blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{user.name}</h3>
                    <div className="text-xs text-slate-400 font-medium">
                      Reason: {user.reason} • Blocked {user.blockedDate}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblock(user.id, user.name)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
