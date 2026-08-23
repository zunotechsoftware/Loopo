'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ShieldCheck, Lock, AlertTriangle, Users, MapPin, Eye } from 'lucide-react';

export default function SafetyPage() {
  const guidelines = [
    {
      icon: MapPin,
      title: 'Meet in Public Places',
      desc: 'Always arrange product inspection in well-lit public places like shopping malls, metro stations, or cafes.',
    },
    {
      icon: Eye,
      title: 'Inspect Before Paying',
      desc: 'Carefully verify item condition, authenticity, serial numbers, and working functionality before transferring funds.',
    },
    {
      icon: Lock,
      title: 'Beware of Advance Money Scams',
      desc: 'Never transfer advance token payments or shipping fees to sellers before seeing the item physically.',
    },
    {
      icon: ShieldCheck,
      title: 'Use Loopo Verified Sellers',
      desc: 'Look for the green Verified Seller badge on user profiles for verified identity trust.',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Trust & Safety Guidelines</h1>
              <p className="text-xs text-slate-500 font-medium">Tips for safe transactions, scam prevention, and secure trading.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guidelines.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.title} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">{g.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{g.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
