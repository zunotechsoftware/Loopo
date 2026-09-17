'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  Plus,
  Edit,
  FileCheck,
  Building,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  setAddressModalOpen,
  setReviewModalOpen,
  showToast,
} from '@/redux/slices/uiSlice';
import { initAuthThunk } from '@/redux/slices/authSlice';
import { userApi, Address, PublicSellerProfile } from '@/services/userApi';
import { ROUTES } from '@/routes/routes';

type KycStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

const KYC_COPY: Record<KycStatus, string> = {
  NOT_STARTED: 'Not started yet. Verify your identity to earn the Verified Seller badge.',
  DRAFT: 'You have a draft application - finish and submit it for review.',
  SUBMITTED: 'Submitted - queued for review.',
  UNDER_REVIEW: 'Currently under review by our moderation team.',
  APPROVED: 'Your Govt ID (Aadhaar/PAN) is verified. Verified sellers receive 3x more buyer inquiries.',
  REJECTED: 'Your last submission was rejected. Tap to review the reason and re-submit.',
};

export default function ProfileView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isAddressModalOpen = useAppSelector((state) => state.ui.isAddressModalOpen);
  const [kycStatus, setKycStatus] = useState<KycStatus>('NOT_STARTED');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [sellerStats, setSellerStats] = useState<PublicSellerProfile | null>(null);

  // If not yet loaded, attempt a refresh
  useEffect(() => {
    if (!user) dispatch(initAuthThunk());
  }, [dispatch, user]);

  useEffect(() => {
    userApi.getMyKyc().then((res) => {
      setKycStatus(res.success && res.data ? (res.data.status as KycStatus) : 'NOT_STARTED');
    });
  }, []);

  const loadAddresses = () => {
    setAddressesLoading(true);
    userApi.getAddresses().then((res) => {
      setAddresses(res.success && res.data ? res.data : []);
      setAddressesLoading(false);
    });
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // The address modal is a single global instance (mounted once in
  // MainLayout) - re-fetch whenever it closes, since a successful Add
  // happens inside it, not here.
  const wasAddressModalOpen = React.useRef(isAddressModalOpen);
  useEffect(() => {
    if (wasAddressModalOpen.current && !isAddressModalOpen) {
      loadAddresses();
    }
    wasAddressModalOpen.current = isAddressModalOpen;
  }, [isAddressModalOpen]);

  // Reuses the same public-profile endpoint the seller-profile page already
  // calls for OTHER users' real rating/review aggregates - here for the
  // current user's own profile.
  useEffect(() => {
    if (!user?.id) return;
    userApi.getPublicProfile(user.id).then((res) => {
      if (res.success && res.data) setSellerStats(res.data);
    });
  }, [user?.id]);

  const handleRemoveAddress = async (id: string) => {
    const res = await userApi.deleteAddress(id);
    if (res.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      dispatch(showToast('Address removed'));
    } else {
      dispatch(showToast(res.error || 'Could not remove address'));
    }
  };

  // Fallback display values when user data hasn't loaded yet
  const displayName = user?.name || 'My Profile';
  const displayEmail = user?.email || '—';
  const displayPhone = user?.phone || '—';
  const displayAvatar =
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop';
  const displayVerified = user?.isVerified ?? false;
  const displaySince = user?.memberSince ? `Member since Jan ${user.memberSince}` : '';
  const displayCity = user?.city ? `${user.city}${user.state ? `, ${user.state}` : ''}` : 'Not set';
  const displayRating = sellerStats && sellerStats.reviewCount > 0
    ? `${sellerStats.sellerRating.toFixed(1)} (${sellerStats.reviewCount} rating${sellerStats.reviewCount === 1 ? '' : 's'} & buyer reviews)`
    : 'No reviews yet';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/20"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{displayName}</h1>
                {displayVerified && (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Seller
                  </span>
                )}
              </div>
              {displaySince && <div className="text-xs text-slate-500 font-medium">{displaySince}</div>}
              <div className="text-xs text-amber-500 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{displayRating}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push(ROUTES.PROFILE_EDIT)}
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 font-bold text-xs px-4 py-2 rounded-2xl transition-all"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl space-y-0.5">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Email Address</div>
            <div className="font-extrabold text-slate-800 truncate">{displayEmail}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-0.5">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Phone Number</div>
            <div className="font-extrabold text-slate-800">{displayPhone || '—'}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-0.5">
            <div className="text-slate-400 font-bold text-[10px] uppercase">Primary City</div>
            <div className="font-extrabold text-slate-800">{displayCity}</div>
          </div>
        </div>
      </div>

      {/* KYC Seller Identity Verification (Backend KYC endpoint) */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-black text-base">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <span>Seller KYC Identity Status: {kycStatus === 'APPROVED' ? 'Verified' : kycStatus.replace('_', ' ')}</span>
          </div>
          <p className="text-xs text-emerald-100 font-medium">{KYC_COPY[kycStatus]}</p>
        </div>

        <button
          onClick={() => router.push(kycStatus === 'NOT_STARTED' || kycStatus === 'DRAFT' || kycStatus === 'REJECTED' ? ROUTES.VERIFICATION_DOCUMENTS : ROUTES.VERIFICATION_REVIEW)}
          className="bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs px-5 py-2.5 rounded-2xl shadow transition-all shrink-0"
        >
          {kycStatus === 'NOT_STARTED' ? 'Start KYC' : kycStatus === 'REJECTED' || kycStatus === 'DRAFT' ? 'Update KYC Docs' : 'View KYC Status'}
        </button>
      </div>

      {/* Saved Addresses (Backend Addresses endpoint) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Saved Addresses</h2>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Manage pickup & delivery locations</p>
          </div>

          <button
            onClick={() => dispatch(setAddressModalOpen(true))}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-2xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        {addressesLoading ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium py-6 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading addresses…
          </div>
        ) : addresses.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-6">
            No saved addresses yet. Add one for faster checkout and pickup.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full capitalize">
                    {addr.type.toLowerCase()}
                  </span>
                  <button
                    onClick={() => handleRemoveAddress(addr.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Remove address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="font-extrabold text-xs text-slate-900">{addr.fullName}</div>
                <div className="text-xs text-slate-600 font-medium leading-relaxed">
                  {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.postalCode}
                </div>
                <div className="text-[11px] text-slate-400 font-semibold">{addr.phone}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
