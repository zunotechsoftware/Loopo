'use client';

import React, { useState } from 'react';
import {
  Search,
  MapPin,
  MessageSquare,
  Bell,
  Heart,
  User,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setActiveTab } from '@/redux/slices/navigationSlice';
import { setSearchQuery } from '@/redux/slices/productsSlice';
import { setLocation, showToast } from '@/redux/slices/uiSlice';

export default function Header() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.navigation.activeTab);
  const location = useAppSelector((state) => state.ui.location);
  const favorites = useAppSelector((state) => state.products.favorites);
  const conversations = useAppSelector((state) => state.chat.conversations);

  const totalUnreadChats = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const [inputSearch, setInputSearch] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const locations = [
    'Bangalore, Karnataka',
    'Mumbai, Maharashtra',
    'Delhi, NCR',
    'Hyderabad, Telangana',
    'Chennai, Tamil Nadu',
    'Pune, Maharashtra',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery(inputSearch));
    dispatch(setActiveTab('explore'));
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div
          onClick={() => dispatch(setActiveTab('home'))}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <img
            src="/loopo.png"
            alt="Loopo"
            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Center: Search Bar & Location */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-2xl flex items-center bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/80 rounded-full p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500"
        >
          <div className="pl-3 pr-2 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search for cars, mobiles, furniture and more..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-medium"
          />

          {/* Location Selector Dropdown */}
          <div className="relative border-l border-slate-200 pl-3 pr-2">
            <button
              type="button"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 whitespace-nowrap hover:text-emerald-600 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{location}</span>
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-full shadow-sm hover:shadow transition-all duration-200 shrink-0"
          >
            Search
          </button>
        </form>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Messages Icon */}
          <button
            onClick={() => dispatch(setActiveTab('messages'))}
            className={`relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors ${
              activeTab === 'messages' ? 'bg-emerald-50 text-emerald-600' : ''
            }`}
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {totalUnreadChats > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                {totalUnreadChats}
              </span>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => dispatch(showToast('Notifications checked'))}
            className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
              5
            </span>
          </button>

          {/* Saved Items */}
          <button
            onClick={() => dispatch(setActiveTab('saved'))}
            className={`relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors ${
              activeTab === 'saved' ? 'bg-emerald-50 text-emerald-600' : ''
            }`}
            title="Saved Items"
          >
            <Heart className="w-5 h-5" />
            {favorites.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
                {favorites.length}
              </span>
            )}
          </button>

          {/* User Profile Avatar Pill */}
          <button
            onClick={() => dispatch(setActiveTab('settings'))}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors ml-1"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
              alt="Venkatesh"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50"
            />
            <div className="text-left hidden xl:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">Venkatesh</div>
              <div className="text-[10px] font-medium text-emerald-600">Verified Seller</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
