'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';
import { MapPin, ArrowRight, CheckCircle2, Sparkles, Building, Phone } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

export default function OnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [city, setCity] = useState('Bangalore');
  const [area, setArea] = useState('Indiranagar');
  const [bio, setBio] = useState('');

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(showToast('Onboarding complete! Welcome to Loopo!'));
    router.push(ROUTES.HOME);
  };

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto py-10 px-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Welcome to Loopo!</h1>
            <p className="text-xs text-slate-500 font-medium">Let&apos;s quickly set up your profile to find local deals near you.</p>
          </div>

          <form onSubmit={handleComplete} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Select Primary City</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all"
                >
                  <option value="Bangalore">Bangalore, Karnataka</option>
                  <option value="Mumbai">Mumbai, Maharashtra</option>
                  <option value="Delhi">Delhi, NCR</option>
                  <option value="Hyderabad">Hyderabad, Telangana</option>
                  <option value="Chennai">Chennai, Tamil Nadu</option>
                  <option value="Pune">Pune, Maharashtra</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Locality / Area</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Indiranagar, Koramangala"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Short Bio / About You</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tech enthusiast, avid reader, selling quality pre-loved items!"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
