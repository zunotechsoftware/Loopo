'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  MapPin,
  Clock,
  Eye,
  Share2,
  Heart,
  Star,
  ShieldCheck,
  MessageSquare,
  Tag,
  ArrowLeft,
  Flag,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveTab } from '@/redux/slices/navigationSlice';
import { toggleFavorite } from '@/redux/slices/productsSlice';
import {
  setOfferModalOpen,
  setReportModalOpen,
  setReviewModalOpen,
  showToast,
} from '@/redux/slices/uiSlice';
import { setActiveConversation } from '@/redux/slices/chatSlice';

export default function ProductDetailView() {
  const dispatch = useAppDispatch();
  const selectedProductId = useAppSelector((state) => state.navigation.selectedProductId);
  const products = useAppSelector((state) => state.products.items);
  const favorites = useAppSelector((state) => state.products.favorites);

  const product = products.find((p) => p?.id === selectedProductId) || products[0];
  const isFavorite = favorites.includes(product?.id || '');

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100">
        Loading listing details...
      </div>
    );
  }

  const priceNum = typeof product.price === 'number' ? product.price : Number(product.price) || 0;
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(priceNum);

  const handleStartChat = () => {
    dispatch(setActiveConversation('conv-buy-1'));
    dispatch(setActiveTab('messages'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={() => dispatch(setActiveTab('home'))}
          className="hover:text-emerald-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span
          onClick={() => dispatch(setActiveTab('categories'))}
          className="hover:text-emerald-600 cursor-pointer"
        >
          {product.category}
        </span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-slate-900 font-bold line-clamp-1">{product.title}</span>
      </div>

      {/* Main Grid: Gallery Left, Details Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-3">
          {/* Main Large Image */}
          <div className="relative aspect-[4/3] rounded-3xl bg-slate-100 overflow-hidden border border-slate-100 shadow-sm">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => dispatch(toggleFavorite(product.id))}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                isFavorite ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/80 text-slate-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Thumbnails Row */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Title & Price Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => dispatch(showToast('Share link copied!'))}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => dispatch(setReportModalOpen(true))}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Report Listing"
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-emerald-600">{formattedPrice}</span>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                {product.condition}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{product.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{product.postedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{product.viewsCount} views</span>
              </div>
            </div>
          </div>

          {/* Seller Info Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                {product.seller.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                )}
              </div>

              <div>
                <div className="font-extrabold text-slate-900 text-sm">{product.seller.name}</div>
                <div className="text-xs text-slate-500 font-medium">
                  Member since {product.seller.memberSince} •{' '}
                  <button
                    onClick={() => dispatch(setReviewModalOpen(true))}
                    className="inline-flex items-center text-amber-500 font-bold hover:underline"
                  >
                    <Star className="w-3 h-3 fill-amber-400 inline mr-0.5" />
                    {product.seller.rating} ({product.seller.reviewCount} reviews)
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => dispatch(setReviewModalOpen(true))}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Rate Seller
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {product.description}
            </p>
          </div>

          {/* Specifications Grid */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Specifications</h3>
            <div className="grid grid-cols-2 gap-2 bg-white rounded-2xl p-4 border border-slate-100 text-xs">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {key}
                  </span>
                  <span className="font-semibold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons: Chat & Make Offer */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleStartChat}
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border-2 border-emerald-600 text-emerald-600 font-bold text-sm py-3.5 rounded-2xl transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat with Seller</span>
            </button>

            <button
              onClick={() => dispatch(setOfferModalOpen(true))}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all"
            >
              <Tag className="w-4 h-4" />
              <span>Make Offer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
