'use client';

import React, { useState } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { showToast } from '@/redux/slices/uiSlice';

export default function OrdersView() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState<'buying' | 'selling'>('buying');

  const orders = [
    {
      id: 'ord-1',
      title: 'iPhone 13 128GB',
      price: '₹32,000',
      date: '10 May 2024',
      status: 'Delivered',
      type: 'buying',
      image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'ord-2',
      title: 'Dining Table',
      price: '₹12,000',
      date: '08 May 2024',
      status: 'Shipped',
      type: 'buying',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'ord-3',
      title: 'Sony Headphones',
      price: '₹8,500',
      date: '02 May 2024',
      status: 'Delivered',
      type: 'selling',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
    },
  ];

  const filtered = orders.filter((o) => o.type === tab);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Orders & Purchases</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Track your purchases and sales transactions.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setTab('buying')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'buying' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            Buying (2)
          </button>
          <button
            onClick={() => setTab('selling')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === 'selling' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            Selling (1)
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((ord) => (
          <div
            key={ord.id}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <img src={ord.image} alt={ord.title} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{ord.title}</h3>
                <div className="text-sm font-black text-emerald-600">{ord.price}</div>
                <div className="text-[11px] text-slate-400 font-medium">{ord.date}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${
                  ord.status === 'Delivered'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {ord.status === 'Delivered' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                <span>{ord.status}</span>
              </span>

              <button
                onClick={() => dispatch(showToast('Order details opened'))}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Track
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
