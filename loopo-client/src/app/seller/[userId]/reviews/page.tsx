'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useAppDispatch } from '@/redux/hooks';
import { openReportModal } from '@/redux/slices/uiSlice';
import { userApi, PublicSellerProfile } from '@/services/userApi';
import { reviewsApi, Review, RatingDistribution } from '@/services/reviewsApi';
import { ROUTES } from '@/routes/routes';
import { Star, ShieldCheck, Flag, ChevronLeft, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ userId: string }>;
}

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: '5', label: '5 Star' },
  { key: '4', label: '4 Star' },
  { key: '3', label: '3 Star' },
  { key: '2', label: '2 Star' },
  { key: '1', label: '1 Star' },
  { key: 'positive', label: 'Positive' },
];

const CATEGORY_LABELS: { key: keyof Review['ratings'][number]; label: string }[] = [
  { key: 'communication', label: 'Communication' },
  { key: 'productAccuracy', label: 'Product Accuracy' },
  { key: 'behaviour', label: 'Behaviour' },
  { key: 'deliveryExperience', label: 'Meeting Experience' },
];

const PAGE_SIZE = 10;

function Stars({ value, size = 'w-3.5 h-3.5' }: { value: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${size} ${s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

export default function SellerReviewsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;
  const dispatch = useAppDispatch();

  const [profile, setProfile] = useState<PublicSellerProfile | null>(null);
  const [distribution, setDistribution] = useState<RatingDistribution | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getPublicProfile(userId).then((res) => {
      if (res.success && res.data) setProfile(res.data);
    });
    reviewsApi.getRatingDistribution(userId).then((res) => {
      if (res.success && res.data) setDistribution(res.data);
    });
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    const star = ['1', '2', '3', '4', '5'].includes(filter) ? Number(filter) : undefined;
    const positiveOnly = filter === 'positive';
    reviewsApi.getSellerReviews(userId, { page, limit: PAGE_SIZE, star, positiveOnly }).then((res) => {
      if (res.success && res.data) {
        setReviews(res.data.items);
        setTotal(res.data.total);
      }
      setLoading(false);
    });
  }, [userId, page, filter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const distTotal = distribution ? Object.values(distribution).reduce((a, b) => a + b, 0) : 0;
  const displayName = profile?.displayName || 'Seller';

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
        <Link href={ROUTES.SELLER_PROFILE(userId)} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {displayName}'s profile</span>
        </Link>

        {/* Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h1 className="text-lg font-black text-slate-900 mb-4">Reviews for {displayName}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6">
            <div className="flex flex-col items-center justify-center sm:border-r sm:border-slate-100 sm:pr-6">
              <div className="text-4xl font-black text-slate-900">{(profile?.sellerRating || 0).toFixed(1)}</div>
              <Stars value={Math.round(profile?.sellerRating || 0)} size="w-4 h-4" />
              <div className="text-xs text-slate-400 font-semibold mt-1">{profile?.reviewCount || 0} reviews</div>
              <div className="text-xs text-emerald-600 font-bold mt-0.5">{Math.round(profile?.positivePercent || 0)}% positive</div>
            </div>

            <div className="space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = distribution ? (distribution as any)[String(star)] || 0 : 0;
                const pct = distTotal > 0 ? (count / distTotal) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-500 w-10 shrink-0">{star} star</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-bold text-slate-400 w-8 text-right shrink-0">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setFilter(f.key);
                setPage(1);
              }}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
                filter === f.key ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
            No reviews match this filter yet.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => {
              const overall = review.ratings[0]?.overall || 0;
              const categoryRatings = review.ratings[0];
              return (
                <div key={review.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {review.reviewer.profileImage ? (
                        <img src={review.reviewer.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          {(review.reviewer.firstName || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          {review.reviewer.firstName} {review.reviewer.lastName?.charAt(0)}.
                          {review.isVerified && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> Verified Transaction
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Stars value={overall} />
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        dispatch(openReportModal({ targetType: 'REVIEW', targetId: review.id, label: 'this review' }))
                      }
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                      title="Report review"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {review.content && (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{review.content}</p>
                  )}

                  {categoryRatings && CATEGORY_LABELS.some(({ key }) => (categoryRatings as any)[key]) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 bg-slate-50 rounded-xl p-3">
                      {CATEGORY_LABELS.map(({ key, label }) =>
                        (categoryRatings as any)[key] ? (
                          <div key={key} className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-semibold text-slate-500">{label}</span>
                            <Stars value={(categoryRatings as any)[key]} size="w-3 h-3" />
                          </div>
                        ) : null,
                      )}
                    </div>
                  )}

                  {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {review.tags.map((tag) => (
                        <span key={tag.id} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {review.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {review.photos.map((photo) => (
                        <img key={photo.id} src={photo.fileUrl} alt="Review attachment" className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
                      ))}
                    </div>
                  )}

                  {review.response && (
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 ml-4">
                      <div className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-1">
                        Seller's Response
                      </div>
                      <p className="text-xs text-emerald-900 font-medium">{review.response.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
