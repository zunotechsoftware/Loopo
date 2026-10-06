'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toggleFavoriteThunk } from '@/redux/slices/productsSlice';
import { openProductDetail } from '@/redux/slices/navigationSlice';

import { setAuthModalOpen, showToast } from '@/redux/slices/uiSlice';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const favorites = useAppSelector((state) => state.products.favorites);
  const myAcceptedOffer = useAppSelector((state) => state.offers.myAcceptedOffers[product?.id || '']);
  const isFavorite = favorites.includes(product?.id || '');
  const isSold = product?.status === 'SOLD';


  const listingPriceNum = typeof product?.price === 'number' ? product.price : Number(product?.price) || 0;
  // Once this buyer's offer on this listing has been accepted, that's the
  // real price they agreed to pay - showing the seller's original listing
  // price here instead would contradict what Offers/the chat with the
  // seller already tell them.
  const priceNum = myAcceptedOffer ?? listingPriceNum;
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const formattedPrice = formatCurrency(priceNum);

  const locationStr = typeof product?.location === 'string' ? product.location : (product?.location as any)?.city || 'India';
  const displayLocation = locationStr.split(',')[0] || 'India';

  const dateStr = typeof product?.postedDate === 'string' ? product.postedDate : 'Recently';
  const displayDate = dateStr.replace(/^Posted\s*/i, '');

  const handleCardClick = () => {
    if (product?.id) {
      dispatch(openProductDetail(product.id));
      router.push(`/listing/${encodeURIComponent(product.id)}`);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100/90 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer">
      <div onClick={handleCardClick}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          {product?.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product?.title || 'Product'}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isSold ? 'grayscale-[40%] opacity-80' : ''}`}
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
              No Image
            </div>
          )}

          {/* Condition Tag */}
          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {product?.condition || 'Used'}
          </div>

          {/* Sold Ribbon */}
          {isSold && (
            <div className="absolute inset-x-0 bottom-0 bg-slate-900/85 backdrop-blur-sm text-white text-[10px] font-extrabold tracking-wide text-center py-1.5">
              SOLD
            </div>
          )}

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                dispatch(setAuthModalOpen(true));
                dispatch(showToast('Please log in to save favorites'));
                return;
              }
              if (product?.id) dispatch(toggleFavoriteThunk({ productId: product.id, isFavorited: isFavorite }));
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 ${
              isFavorite
                ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                : 'bg-white/80 hover:bg-white text-slate-600 shadow-sm'
            }`}
          >

            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
              {product?.title || 'Untitled Listing'}
              {product?.seller?.isVerified && (
                <span title="Verified seller" className="shrink-0 inline-flex">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-label="Verified seller" />
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-emerald-600">{formattedPrice}</span>
            {myAcceptedOffer != null && (
              <>
                <span className="text-[11px] text-slate-400 line-through">{formatCurrency(listingPriceNum)}</span>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  Your offer accepted
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-1 border-t border-slate-50">
            <div className="flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>
                {displayLocation}
                {typeof product?.distance === 'number' || (typeof product?.distance === 'string' && product.distance !== '')
                  ? ` · ${Number(product.distance).toFixed(1)} km away`
                  : ''}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{displayDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
