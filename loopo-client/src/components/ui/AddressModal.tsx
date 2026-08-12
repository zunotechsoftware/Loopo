'use client';

import React, { useState } from 'react';
import { X, MapPin, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setAddressModalOpen, showToast } from '@/redux/slices/uiSlice';

export default function AddressModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isAddressModalOpen);

  const [name, setName] = useState('Venkatesh');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('100 Feet Road, Indiranagar');
  const [city, setCity] = useState('Bangalore, Karnataka');
  const [pincode, setPincode] = useState('560038');
  const [type, setType] = useState<'Home' | 'Work'>('Home');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setAddressModalOpen(false));
    dispatch(showToast(`Saved new address: ${address}, ${city}`));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>Add Delivery / Pickup Address</span>
          </div>
          <button
            onClick={() => dispatch(setAddressModalOpen(false))}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Flat / Building / Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">City / State</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pincode</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Address Label</label>
            <div className="flex gap-2">
              {(['Home', 'Work'] as const).map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setType(lbl)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                    type === lbl
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Save Address</span>
          </button>
        </form>
      </div>
    </div>
  );
}
