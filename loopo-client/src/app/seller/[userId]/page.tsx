'use client';

import React, { use } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/ui/ProductCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setReportModalOpen, showToast } from '@/redux/slices/uiSlice';
import { ShieldCheck, MapPin, Calendar, Star, Flag, Ban, MessageSquare } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default function SellerProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);

  const sellerName = userId.replace(/-/g, ' ');
  const sellerListings = products;

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Profile Banner Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                  alt={sellerName}
                  className="w-20 h-20 rounded-3xl object-cover ring-4 ring-emerald-500/20"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 capitalize">{sellerName}</h1>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Verified Seller
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bangalore, Karnataka</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Member since 2023</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>4.9 (48 reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.CHATS}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Seller</span>
              </Link>

              <button
                onClick={() => dispatch(setReportModalOpen(true))}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Report Seller"
              >
                <Flag className="w-4 h-4" />
              </button>

              <button
                onClick={() => dispatch(showToast(`Blocked seller ${sellerName}`))}
                className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Block Seller"
              >
                <Ban className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Listings by this seller */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            Listings by <span className="capitalize text-emerald-600">{sellerName}</span> ({sellerListings.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sellerListings.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
