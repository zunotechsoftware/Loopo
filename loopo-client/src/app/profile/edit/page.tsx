'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';
import { User, Mail, Phone, MapPin, ArrowLeft, Camera, Save } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(currentUser?.name || 'Venkatesh Kumar');
  const [email, setEmail] = useState(currentUser?.email || 'user@loopo.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [location, setLocation] = useState('Indiranagar, Bangalore');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(showToast('Profile information updated!'));
    router.push(ROUTES.PROFILE);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <Link
              href={ROUTES.PROFILE}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </Link>

            <h1 className="text-xl font-black text-slate-900">Edit Profile</h1>
            <p className="text-xs text-slate-500 font-medium">Update your display name, contact info, and avatar</p>
          </div>

          <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            {/* Avatar upload */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="relative">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => dispatch(showToast('Select avatar image'))}
                  className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full shadow hover:bg-emerald-700"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Profile Picture</div>
                <div className="text-[10px] text-slate-400">JPG or PNG up to 2MB</div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mobile Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
