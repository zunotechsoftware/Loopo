'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  MapPin,
  MessageSquare,
  Bell,
  Heart,
  User,
  ChevronDown,
  X,
  LogOut,
  Settings,
  Package,
  Wallet as WalletIcon,
  Tag,
  Clock,
  LogIn,
  ShieldAlert,
  PlusCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setSearchQuery } from '@/redux/slices/productsSlice';
import { setLocation, showToast } from '@/redux/slices/uiSlice';
import { logout } from '@/redux/slices/authSlice';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/routes/routes';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const location = useAppSelector((state) => state.ui.location);
  const favorites = useAppSelector((state) => state.products.favorites);
  const conversations = useAppSelector((state) => state.chat.conversations);
  const notifications = useAppSelector((state) => state.notifications.items);
  const products = useAppSelector((state) => state.products.items);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const isAdmin =
    isAuthenticated &&
    user &&
    ((user as any).role === 'ADMIN' ||
      (user as any).role === 'SUPER_ADMIN' ||
      user.email?.includes('admin') ||
      user.email === 'admin@loopo.com');

  const totalUnreadChats = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const totalUnreadNotifs = notifications.filter((n) => !n.isRead).length;

  const [inputSearch, setInputSearch] = useState('');
  const debouncedSearch = useDebounce(inputSearch, 300);

  const [mounted, setMounted] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [recentSearches, setRecentSearches] = useState<string[]>([
    'iPhone 13',
    'Maruti Swift',
    'L-Shaped Sofa',
    'Royal Enfield',
  ]);

  const searchContainerRef = useRef<HTMLFormElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const locations = [
    'Bangalore, Karnataka',
    'Mumbai, Maharashtra',
    'Delhi, NCR',
    'Hyderabad, Telangana',
    'Chennai, Tamil Nadu',
    'Pune, Maharashtra',
  ];

  // Matching Search Results
  const matchingProducts = debouncedSearch.trim()
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSearch.trim()) {
      if (!recentSearches.includes(inputSearch.trim())) {
        setRecentSearches([inputSearch.trim(), ...recentSearches.slice(0, 4)]);
      }
      dispatch(setSearchQuery(inputSearch.trim()));
      setShowSearchDropdown(false);
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(inputSearch.trim())}`);
    } else {
      setShowSearchDropdown(false);
      router.push(ROUTES.SEARCH);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setShowSearchDropdown(false);
    router.push(ROUTES.LISTING_DETAIL(productId));
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2.5 shrink-0 group select-none">
          <img
            src="/loopo.png"
            alt="Loopo"
            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Header Navigation Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-600">
          <Link
            href={ROUTES.HOME}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === ROUTES.HOME ? 'text-emerald-600 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <Link
            href={ROUTES.CATEGORIES}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname.startsWith(ROUTES.CATEGORIES) ? 'text-emerald-600 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Categories
          </Link>
          <Link
            href={ROUTES.SEARCH}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname.startsWith(ROUTES.SEARCH) ? 'text-emerald-600 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Search
          </Link>
        </nav>

        {/* Center: Global Search Bar */}
        <form
          ref={searchContainerRef}
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-xl flex items-center bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/80 rounded-full p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500"
        >
          <div className="pl-3 pr-2 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            placeholder="Search cars, mobiles, furniture..."
            value={inputSearch}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={(e) => {
              setInputSearch(e.target.value);
              setShowSearchDropdown(true);
            }}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
          />

          {inputSearch && (
            <button
              type="button"
              onClick={() => {
                setInputSearch('');
                dispatch(setSearchQuery(''));
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Location Selector Dropdown */}
          <div className="relative border-l border-slate-200 pl-3 pr-2 hidden sm:block">
            <button
              type="button"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap hover:text-emerald-600 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{location.split(',')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLocationDropdown && (
              <div className="absolute right-0 top-9 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Popular Locations
                </div>
                {locations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      dispatch(setLocation(loc));
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center justify-between ${
                      location === loc ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{loc}</span>
                    {location === loc && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all duration-200 shrink-0"
          >
            Search
          </button>

          {/* Search Suggestions Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-14 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 max-h-96 overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-150">
              {debouncedSearch.trim() ? (
                matchingProducts.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">
                    No results found for &quot;<span className="font-bold text-slate-700">{debouncedSearch}</span>&quot;
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                      Matching Products ({matchingProducts.length})
                    </div>
                    {matchingProducts.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod.id)}
                        className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-900">{prod.title}</div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {prod.category} • {prod.location}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs font-black text-emerald-600">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Recent Searches
                    </span>
                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setRecentSearches([])}
                        className="text-[10px] font-bold text-emerald-600 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setInputSearch(term);
                          dispatch(setSearchQuery(term));
                          setShowSearchDropdown(false);
                          router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(term)}`);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Primary CTA: SELL */}
          <Link
            href={ROUTES.SELL}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-md shadow-emerald-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>SELL</span>
          </Link>

          {/* Messages Icon */}
          <Link
            href={ROUTES.CHATS}
            className={`relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors ${
              pathname.startsWith(ROUTES.CHATS) ? 'bg-emerald-50 text-emerald-600' : ''
            }`}
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {totalUnreadChats > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                {totalUnreadChats}
              </span>
            )}
          </Link>

          {/* Notifications Bell */}
          <Link
            href={ROUTES.NOTIFICATIONS}
            className={`relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors ${
              pathname === ROUTES.NOTIFICATIONS ? 'bg-emerald-50 text-emerald-600' : ''
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {totalUnreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                {totalUnreadNotifs}
              </span>
            )}
          </Link>

          {/* Favorites */}
          <Link
            href={ROUTES.FAVOURITES}
            className={`relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors hidden md:flex ${
              pathname === ROUTES.FAVOURITES ? 'bg-emerald-50 text-emerald-600' : ''
            }`}
            title="Saved Items"
          >
            <Heart className="w-5 h-5" />
            {favorites.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Profile Menu or Login */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50"
                />
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-[10px] font-medium text-emerald-600">
                    {user.isVerified ? 'Verified Seller' : 'User'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <Link
                    href={ROUTES.PROFILE}
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href={ROUTES.MY_LISTINGS}
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>My Listings</span>
                  </Link>

                  <Link
                    href={ROUTES.SETTINGS}
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-emerald-600" />
                    <span>Settings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href={ROUTES.ADMIN}
                      onClick={() => setShowProfileDropdown(false)}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-600" />
                      <span>Admin Portal</span>
                    </Link>
                  )}

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      onClick={() => {
                        dispatch(logout());
                        setShowProfileDropdown(false);
                        dispatch(showToast('Logged out successfully'));
                        router.push(ROUTES.HOME);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={ROUTES.LOGIN}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-sm transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
