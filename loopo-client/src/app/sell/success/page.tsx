'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { resetSellForm } from '@/redux/slices/sellSlice';
import { ROUTES } from '@/routes/routes';
import { CheckCircle2, Eye, Package, PlusCircle, ArrowRight } from 'lucide-react';

export default function SellSuccessPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const publishedListingId = useAppSelector((state) => state.sell.publishedListingId) || 'p1';

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center space-y-6 max-w-lg mx-auto animate-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900">Listing Published!</h1>
        <p className="text-xs text-slate-500 font-medium">
          Your ad has been successfully posted to the Loopo marketplace.
        </p>
        <div className="inline-block bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-700 mt-1">
          Reference ID: #{publishedListingId}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <Link
          href={ROUTES.LISTING_DETAIL(publishedListingId)}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all"
        >
          <Eye className="w-4 h-4" />
          <span>View Listing</span>
        </Link>

        <Link
          href={ROUTES.MY_LISTINGS}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-xl transition-all"
        >
          <Package className="w-4 h-4" />
          <span>Go to My Listings</span>
        </Link>

        <button
          onClick={() => {
            dispatch(resetSellForm());
            router.push(ROUTES.SELL_CATEGORY);
          }}
          className="w-full text-xs font-bold text-emerald-600 hover:underline pt-2"
        >
          Post Another Listing
        </button>
      </div>
    </div>
  );
}
