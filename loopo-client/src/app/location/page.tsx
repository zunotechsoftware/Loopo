'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import {
  MapPin,
  Navigation,
  Check,
  ArrowRight,
  Search,
  Sliders,
  Compass,
  Map as MapIcon,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLocationData, showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';

// Leaflet touches `window` at import time, so it can only ever run in the
// browser - loading it during SSR/static generation throws immediately.
const LocationPickerMap = dynamic(() => import('@/components/ui/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
      Loading map...
    </div>
  ),
});

export default function LocationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentLocation = useAppSelector((state) => state.ui.location);

  const popularCities = [
    { name: 'Bangalore, Karnataka', lat: 12.9716, lng: 77.5946 },
    { name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi, NCR', lat: 28.7041, lng: 77.1025 },
    { name: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
    { name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
    { name: 'Kolkata, West Bengal', lat: 22.5726, lng: 88.3639 },
    { name: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
  ];

  const popularLocalities = [
    'Indiranagar, Bangalore',
    'Koramangala, Bangalore',
    'Whitefield, Bangalore',
    'HSR Layout, Bangalore',
    'Bandra West, Mumbai',
    'Andheri East, Mumbai',
    'Connaught Place, Delhi',
    'Gachibowli, Hyderabad',
  ];

  const currentLocationData = useAppSelector((state) => state.ui.locationData);
  const cityCoords = (name: string) => popularCities.find((c) => c.name === name);

  const [selectedCity, setSelectedCity] = useState(currentLocation || 'Bangalore, Karnataka');
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(currentLocationData.radiusKm || 15);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  // Real coordinates backing the current selection - kept in sync so Save
  // always has something to feed the backend's radius search with, not
  // just a display string it can't compute a "nearby" query from.
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>(
    currentLocationData.latitude !== undefined && currentLocationData.longitude !== undefined
      ? { lat: currentLocationData.latitude, lng: currentLocationData.longitude }
      : cityCoords(selectedCity)
      ? { lat: cityCoords(selectedCity)!.lat, lng: cityCoords(selectedCity)!.lng }
      : undefined
  );

  const applyIpFallback = async (lat?: number, lng?: number) => {
    try {
      let city: string, state: string, country: string;
      if (lat !== undefined && lng !== undefined) {
        // Real reverse-geocoding of the actual GPS fix, via BigDataCloud's
        // free, keyless client-side endpoint. ipapi.co (used here
        // previously, including in an earlier "fix" that still got this
        // wrong) is an IP-lookup service - it has no way to accept
        // coordinates, so passing lat/lng into its URL just silently fell
        // through to an IP-based guess (your ISP's location), completely
        // ignoring the real GPS fix. Confirmed live: Coimbatore's real
        // coordinates correctly resolve to Coimbatore here, not whatever
        // city your network happens to egress through.
        const geo = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        ).then((r) => r.json());
        city = geo?.city || geo?.locality || 'Bangalore';
        state = geo?.principalSubdivision || 'Karnataka';
        country = geo?.countryName || 'India';
      } else {
        const ipRes = await fetch('https://ipapi.co/json/').then((r) => r.json());
        city = ipRes?.city || 'Bangalore';
        state = ipRes?.region || 'Karnataka';
        country = ipRes?.country_name || 'India';
      }
      const displayName = `${city}, ${state}`;
      setSelectedCity(displayName);
      setCoords(lat !== undefined && lng !== undefined ? { lat, lng } : undefined);
      dispatch(setLocationData({ displayName, city, state, country, latitude: lat, longitude: lng, radiusKm }));
      dispatch(showToast(`📍 Location detected: ${city}, ${state}`));
    } catch {
      const fallback = { name: 'Bangalore, Karnataka', lat: 12.9716, lng: 77.5946 };
      setSelectedCity(fallback.name);
      setCoords({ lat: fallback.lat, lng: fallback.lng });
      dispatch(setLocationData({
        displayName: fallback.name, city: 'Bangalore', state: 'Karnataka', country: 'India',
        latitude: fallback.lat, longitude: fallback.lng, radiusKm,
      }));
      dispatch(showToast('Could not detect location. Using default.'));
    }
  };

  const handleDetectGps = () => {
    setIsDetectingGps(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setIsDetectingGps(false);
          await applyIpFallback(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setIsDetectingGps(false);
          applyIpFallback();
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetectingGps(false);
      applyIpFallback();
    }
  };

  // Clicking or dragging the pin on the real map - sets the real
  // coordinates immediately (for instant visual feedback) and reverse-
  // geocodes them the same way GPS detection does, so the city/state shown
  // and the coordinates actually saved always agree with where the pin
  // really is, not just whatever was last picked from a city list.
  const handleMapPick = async (lat: number, lng: number) => {
    setCoords({ lat, lng });
    await applyIpFallback(lat, lng);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLoc = searchQuery ? `${searchQuery.trim()}, ${selectedCity.split(',')[0]}` : selectedCity;
    const [cityPart, statePart] = selectedCity.split(',').map((s) => s.trim());
    dispatch(setLocationData({
      displayName: finalLoc,
      city: cityPart,
      state: statePart,
      country: 'India',
      latitude: coords?.lat,
      longitude: coords?.lng,
      radiusKm,
    }));
    dispatch(showToast(`Marketplace location updated to ${finalLoc}`));
    router.push(ROUTES.HOME);
  };

  const filteredLocalities = popularLocalities.filter((loc) =>
    loc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
        {/* Header Title Banner */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Set Marketplace Location</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Filter nearby listings, products, and verified sellers around your area.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDetectGps}
            disabled={isDetectingGps}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shrink-0"
          >
            {isDetectingGps ? (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-emerald-600" />
            )}
            <span>{isDetectingGps ? 'Locating...' : 'Use Current GPS Location'}</span>
          </button>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Map View */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 space-y-3 shadow-md text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">Interactive Location Pin Map</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {radiusKm} km radius
                </span>
              </div>

              {/* Real interactive map (Leaflet + OpenStreetMap, no API key
                  needed) - click anywhere or drag the pin to set your real
                  coordinates, reverse-geocoded live via the same BigDataCloud
                  lookup GPS detection uses. */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-800">
                {coords && (
                  <LocationPickerMap
                    lat={coords.lat}
                    lng={coords.lng}
                    radiusKm={radiusKm}
                    onPick={handleMapPick}
                  />
                )}

                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between border border-slate-800 pointer-events-none z-[1000]">
                  <span className="line-clamp-1">Pin Location: {selectedCity}</span>
                  <span className="text-[10px] text-emerald-400 font-extrabold shrink-0">Click or drag pin to adjust</span>
                </div>
              </div>

              {/* Radius Distance Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Search Radius</span>
                  <span className="text-emerald-400 font-extrabold">{radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={50}
                  step={1}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>2 km (Local)</span>
                  <span>15 km (City)</span>
                  <span>50 km (Metro)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Search Input & City Directory */}
          <div className="lg:col-span-6 space-y-4">
            <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              {/* Search locality input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Search Locality or Pincode</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter locality (e.g. Indiranagar, Koramangala, 560038)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Locality Quick Suggestions */}
              {searchQuery && filteredLocalities.length > 0 && (
                <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto space-y-1">
                  {filteredLocalities.map((loc) => (
                    <div
                      key={loc}
                      onClick={() => {
                        setSelectedCity(loc);
                        setSearchQuery('');
                        const cityGuess = loc.split(',').pop()?.trim();
                        const match = popularCities.find((c) => c.name.startsWith(cityGuess || '\0'));
                        if (match) setCoords({ lat: match.lat, lng: match.lng });
                      }}
                      className="p-2 hover:bg-emerald-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{loc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Popular Cities List */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">Select Major Metro City</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {popularCities.map((city) => {
                    const isSel = selectedCity === city.name;
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => { setSelectedCity(city.name); setCoords({ lat: city.lat, lng: city.lng }); }}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          isSel
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="line-clamp-1">{city.name}</div>
                        </div>
                        {isSel && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all mt-4"
              >
                <span>Save Location & Explore Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
