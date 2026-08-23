'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Search, Ban, CheckCircle, Eye } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    { id: 'u-1', name: 'Gowtham S', email: 'gowtham@example.com', role: 'USER', status: 'ACTIVE', listings: 5, date: 'Jan 2024' },
    { id: 'u-2', name: 'Admin User', email: 'admin@loopo.com', role: 'ADMIN', status: 'ACTIVE', listings: 12, date: 'Aug 2023' },
    { id: 'u-3', name: 'Spam Account', email: 'spammer@temp.com', role: 'USER', status: 'SUSPENDED', listings: 1, date: 'Yesterday' },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <p className="text-xs text-slate-400 font-medium">View user profiles, listings, status, and account actions.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none"
          />
        </div>
      </div>

      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Listings</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      u.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{u.listings}</td>
                  <td className="p-4 text-slate-400">{u.date}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={ROUTES.ADMIN_USER_DETAIL(u.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Manage</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
