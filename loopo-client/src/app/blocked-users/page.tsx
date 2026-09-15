'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { UserX, Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';
import { userApi, BlockedUser } from '@/services/userApi';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BlockedUsersPage() {
  const dispatch = useAppDispatch();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getBlockedUsers().then((res) => {
      setBlockedUsers(res.success && res.data ? res.data : []);
      setLoading(false);
    });
  }, []);

  const handleUnblock = async (id: string, name: string) => {
    const res = await userApi.unblockUser(id);
    if (res.success) {
      setBlockedUsers((prev) => prev.filter((u) => u.id !== id));
      dispatch(showToast(`Unblocked ${name}`));
    } else {
      dispatch(showToast(res.error || 'Failed to unblock user'));
    }
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
            {loading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
              </div>
            ) : blockedUsers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
                You have no blocked users.
              </div>
            ) : (
              blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-2xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
                        {user.name.trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{user.name}</h3>
                      <div className="text-xs text-slate-400 font-medium">Blocked on {formatDate(user.blockedAt)}</div>
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
