'use client';

import React from 'react';
import { User, MapPin, Mail, Phone, ShieldCheck, Star } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

export default function ProfileView() {
  const dispatch = useAppDispatch();

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
            alt="Venkatesh"
            className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/20"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Venkatesh</h1>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Seller
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Member since 2022</div>
            <div className="text-xs text-amber-500 font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>4.9 (48 ratings & reviews)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-500 font-medium">Email Address</span>
            <span className="font-bold text-slate-900">venkatesh@gmail.com</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-500 font-medium">Phone Number</span>
            <span className="font-bold text-slate-900">+91 98765 43210</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-500 font-medium">City / Location</span>
            <span className="font-bold text-slate-900">Bangalore, Karnataka</span>
          </div>
        </div>

        <button
          onClick={() => dispatch(showToast('Profile updated!'))}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition-all"
        >
          Edit Profile Information
        </button>
      </div>
    </div>
  );
}
