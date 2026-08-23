'use client';

import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setReviewModalOpen, showToast } from '@/redux/slices/uiSlice';

export default function ReviewModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isReviewModalOpen);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setReviewModalOpen(false));
    dispatch(showToast(`Review submitted with ${rating} stars! Thank you for rating the seller.`));
    setComment('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Rate & Review Seller</span>
          </div>
          <button
            onClick={() => dispatch(setReviewModalOpen(false))}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Share your transaction experience with this seller to build trust in our community.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Rating
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Your Review
            </label>
            <textarea
              rows={3}
              placeholder="Was the seller responsive? Was the item as described?..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Review</span>
          </button>
        </form>
      </div>
    </div>
  );
}
