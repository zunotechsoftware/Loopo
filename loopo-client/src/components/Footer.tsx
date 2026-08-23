'use client';

import React from 'react';
import { Sparkles, Globe } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { setActiveTab } from '@/redux/slices/navigationSlice';

export default function Footer() {
  const dispatch = useAppDispatch();

  return (
    <footer className="bg-white border-t border-slate-100 pt-12 pb-8 mt-16">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div
              onClick={() => dispatch(setActiveTab('home'))}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img src="/loopo.png" alt="Loopo" className="h-9 w-auto object-contain" />
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs">
              Loopo is the smartest way to buy, sell and discover pre-loved items in your city.
            </p>
          </div>

          {/* Col 2: Company */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Company</h4>
            <ul className="space-y-1.5 text-xs text-slate-500 font-medium">
              <li><button onClick={() => dispatch(setActiveTab('home'))} className="hover:text-emerald-600">About Us</button></li>
              <li><button onClick={() => dispatch(setActiveTab('home'))} className="hover:text-emerald-600">Careers</button></li>
              <li><button onClick={() => dispatch(setActiveTab('home'))} className="hover:text-emerald-600">Blog</button></li>
              <li><button onClick={() => dispatch(setActiveTab('home'))} className="hover:text-emerald-600">Contact Us</button></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Support</h4>
            <ul className="space-y-1.5 text-xs text-slate-500 font-medium">
              <li><button onClick={() => dispatch(setActiveTab('help'))} className="hover:text-emerald-600">Help Center</button></li>
              <li><button onClick={() => dispatch(setActiveTab('help'))} className="hover:text-emerald-600">Safety Tips</button></li>
              <li><button onClick={() => dispatch(setActiveTab('help'))} className="hover:text-emerald-600">Terms & Conditions</button></li>
              <li><button onClick={() => dispatch(setActiveTab('help'))} className="hover:text-emerald-600">Privacy Policy</button></li>
            </ul>
          </div>

          {/* Col 4: For Business */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">For Business</h4>
            <ul className="space-y-1.5 text-xs text-slate-500 font-medium">
              <li><button onClick={() => dispatch(setActiveTab('home'))} className="hover:text-emerald-600">Advertise on Loopo</button></li>
              <li><button onClick={() => dispatch(setActiveTab('home'))} className="hover:text-emerald-600">Partner with Us</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Language */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 text-xs text-slate-400 font-medium">
          <div>© 2026 Loopo Inc. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>English (US)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
