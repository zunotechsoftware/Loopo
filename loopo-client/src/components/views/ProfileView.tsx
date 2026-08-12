'use client';

import React from 'react';
import {
  User,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  Plus,
  Edit,
  FileCheck,
  Building,
} from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import {
  setKycModalOpen,
  setAddressModalOpen,
  setReviewModalOpen,
  showToast,
} from '@/redux/slices/uiSlice';

export default function ProfileView() {
  const dispatch = useAppDispatch();

  const savedAddresses = [
    {
      id: 'addr-1',
      type: 'Home',
      name: 'Venkatesh',
      address: '100 Feet Road, Indiranagar',
      city: 'Bangalore, Karnataka - 560038',
      phone: '+91 98765 43210',
    },
    {
      id: 'addr-2',
      type: 'Work',
      name: 'Venkatesh',
      address: 'Embassy GolfLinks Tech Park, Domlur',
      city: 'Bangalore, Karnataka - 560071',
      phone: '+91 98765 43210',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
              <div className="text-xs text-slate-500 font-medium">Member since Jan 2022</div>
              <div className="text-xs text-amber-500 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>4.9 (48 rating score & buyer reviews)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => dispatch(showToast('Profile edited successfully!'))}
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 font-bold text-xs px-4 py-2 rounded-2xl transition-all"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl space-y-0.5">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Email Address</div>
            <div className="font-extrabold text-slate-800 truncate">venkatesh@gmail.com</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-0.5">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Phone Number</div>
            <div className="font-extrabold text-slate-800">+91 98765 43210</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-0.5">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Primary City</div>
            <div className="font-extrabold text-slate-800">Bangalore, KA</div>
          </div>
        </div>
      </div>

      {/* KYC Seller Identity Verification (Backend KYC endpoint) */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-black text-base">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>Seller KYC Identity Status: Verified</span>
          </div>
          <p className="text-xs text-emerald-100 font-medium">
            Your Govt ID (Aadhaar/PAN) is active. Verified sellers receive 3x more buyer inquiries.
          </p>
        </div>

        <button
          onClick={() => dispatch(setKycModalOpen(true))}
          className="bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs px-5 py-2.5 rounded-2xl shadow transition-all shrink-0"
        >
          Update KYC Docs
        </button>
      </div>

      {/* Saved Addresses (Backend Addresses endpoint) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Saved Addresses</h2>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Manage pickup & delivery locations</p>
          </div>

          <button
            onClick={() => dispatch(setAddressModalOpen(true))}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-2xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {savedAddresses.map((addr) => (
            <div key={addr.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {addr.type}
                </span>
                <button
                  onClick={() => dispatch(showToast('Address edited'))}
                  className="text-xs text-emerald-600 font-bold hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="font-extrabold text-xs text-slate-900">{addr.name}</div>
              <div className="text-xs text-slate-600 font-medium leading-relaxed">
                {addr.address}, {addr.city}
              </div>
              <div className="text-[11px] text-slate-400 font-semibold">{addr.phone}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
