'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/ui/ProductCard';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { openReportModal, showToast } from '@/redux/slices/uiSlice';
import { fetchProductsThunk } from '@/redux/slices/productsSlice';
import { userApi, PublicSellerProfile } from '@/services/userApi';
import { ShieldCheck, MapPin, Calendar, Star, Flag, Ban, MessageSquare, Loader2 } from 'lucide-react';
import { ROUTES } from '@/routes/routes';

interface PageProps {
  params: Promise<{ userId: string }>;
}

function formatMemberSince(iso?: string) {
  if (!iso) return '';
  return `Member since ${new Date(iso).getFullYear()}`;
}

export default function SellerProfilePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);

  const [profile, setProfile] = useState<PublicSellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setLoading(true);
    userApi.getPublicProfile(userId).then((res) => {
      setProfile(res.success ? res.data || null : null);
      setLoading(false);
    });
    userApi.getBlockedUsers().then((res) => {
      if (res.success && res.data) {
        setBlocked(res.data.some((u) => u.id === userId));
      }
    });
    dispatch(fetchProductsThunk({ sellerId: userId }));
  }, [userId, dispatch]);

  const sellerListings = products.filter((p) => p.seller.id === userId);
  const displayName = profile?.displayName || 'Seller';

  const handleBlock = async () => {
    const res = blocked ? await userApi.unblockUser(userId) : await userApi.blockUser(userId);
    if (res.success) {
      setBlocked(!blocked);
      dispatch(showToast(blocked ? `Unblocked ${displayName}` : `Blocked ${displayName}`));
    } else {
      dispatch(showToast(res.error || 'Failed to update block status'));
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
          This seller could not be found.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Profile Banner Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={displayName}
                    className="w-20 h-20 rounded-3xl object-cover ring-4 ring-emerald-500/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center ring-4 ring-emerald-500/20 text-2xl font-black">
                    {displayName.trim().charAt(0).toUpperCase()}
                  </div>
                )}
                {profile.verifiedBadge && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">{displayName}</h1>
                  {profile.verifiedBadge && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                      Verified Seller
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatMemberSince(profile.memberSince)}</span>
                  </div>
                  {profile.reviewCount > 0 ? (
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{profile.sellerRating} ({profile.reviewCount} reviews)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-400 font-bold">
                      <Star className="w-3.5 h-3.5" />
                      <span>No reviews yet</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span>{profile.totalListings} active listing{profile.totalListings === 1 ? '' : 's'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{profile.completedSales} sold</span>
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
                onClick={() => dispatch(openReportModal({ targetType: 'USER', targetId: userId, label: displayName }))}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="Report Seller"
              >
                <Flag className="w-4 h-4" />
              </button>

              <button
                onClick={handleBlock}
                className={`p-2.5 rounded-xl transition-colors ${blocked ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                title={blocked ? 'Unblock Seller' : 'Block Seller'}
              >
                <Ban className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Listings by this seller */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            Listings by <span className="text-emerald-600">{displayName}</span> ({sellerListings.length})
          </h2>

          {sellerListings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 font-medium text-sm">
              This seller has no active listings right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sellerListings.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
