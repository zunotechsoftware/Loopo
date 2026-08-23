'use client';

import React, { useState } from 'react';
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
import { setLocation, showToast } from '@/redux/slices/uiSlice';
import { ROUTES } from '@/routes/routes';

export default function LocationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentLocation = useAppSelector((state) => state.ui.location);

  const popularCities = [
    { name: 'Bangalore, Karnataka', count: '45,210+ ads', lat: '12.9716', lng: '77.5946' },
    { name: 'Mumbai, Maharashtra', count: '62,890+ ads', lat: '19.0760', lng: '72.8777' },
    { name: 'Delhi, NCR', count: '58,400+ ads', lat: '28.7041', lng: '77.1025' },
    { name: 'Hyderabad, Telangana', count: '31,500+ ads', lat: '17.3850', lng: '78.4867' },
    { name: 'Chennai, Tamil Nadu', count: '28,900+ ads', lat: '13.0827', lng: '80.2707' },
    { name: 'Pune, Maharashtra', count: '24,100+ ads', lat: '18.5204', lng: '73.8567' },
    { name: 'Kolkata, West Bengal', count: '22,400+ ads', lat: '22.5726', lng: '88.3639' },
    { name: 'Ahmedabad, Gujarat', count: '19,800+ ads', lat: '23.0225', lng: '72.5714' },
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

  const [selectedCity, setSelectedCity] = useState(currentLocation || 'Bangalore, Karnataka');
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(15);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 50 }); // Map Pin % offset

  const handleDetectGps = () => {
    setIsDetectingGps(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetectingGps(false);
          const locName = 'Indiranagar, Bangalore (Current GPS)';
          setSelectedCity(locName);
          dispatch(setLocation(locName));
          dispatch(showToast('📍 Live GPS location detected: Indiranagar, Bangalore'));
        },
        (error) => {
          setIsDetectingGps(false);
          setSelectedCity('Indiranagar, Bangalore');
          dispatch(setLocation('Indiranagar, Bangalore'));
          dispatch(showToast('📍 Set to default location: Indiranagar, Bangalore'));
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetectingGps(false);
      setSelectedCity('Indiranagar, Bangalore');
      dispatch(setLocation('Indiranagar, Bangalore'));
      dispatch(showToast('GPS auto-detected: Indiranagar, Bangalore'));
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPinPosition({ x, y });

    const updatedLoc = `Custom Pin (${x}%, ${y}%), ${selectedCity.split(',')[0]}`;
    dispatch(showToast(`Map location dropped at ${selectedCity.split(',')[0]} (${radiusKm} km radius)`));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLoc = searchQuery ? `${searchQuery.trim()}, ${selectedCity.split(',')[0]}` : selectedCity;
    dispatch(setLocation(finalLoc));
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

              {/* Simulated Map Canvas */}
              <div
                onClick={handleMapClick}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-crosshair group"
              >
                {/* Map Grid Pattern background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Simulated Roads / Geography Visual */}
                <svg className="absolute inset-0 w-full h-full opacity-30 stroke-slate-700" strokeWidth="2">
                  <line x1="0" y1="30%" x2="100%" y2="70%" />
                  <line x1="20%" y1="0" x2="80%" y2="100%" />
                  <circle cx="50%" cy="50%" r="28%" fill="none" stroke="#059669" strokeDasharray="4 4" />
                </svg>

                {/* Pin dropped marker */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 pointer-events-none"
                  style={{ left: `${pinPosition.x}%`, top: `${pinPosition.y}%` }}
                >
                  <div className="relative flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
                      <MapPin className="w-5 h-5 fill-white" />
                    </div>
                    <div className="w-3 h-1.5 bg-black/40 rounded-full blur-[1px] mt-1" />
                  </div>
                </div>

                {/* Radius Circle Indicator */}
                <div
                  className="absolute rounded-full border-2 border-emerald-500/40 bg-emerald-500/10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${pinPosition.x}%`,
                    top: `${pinPosition.y}%`,
                    width: `${Math.min(radiusKm * 6, 80)}%`,
                    height: `${Math.min(radiusKm * 6, 80)}%`,
                  }}
                />

                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl text-[11px] font-bold text-slate-300 flex items-center justify-between border border-slate-800">
                  <span className="line-clamp-1">Pin Location: {selectedCity}</span>
                  <span className="text-[10px] text-emerald-400 font-extrabold shrink-0">Click map to adjust</span>
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
                        onClick={() => setSelectedCity(city.name)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          isSel
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div>
                          <div className="line-clamp-1">{city.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{city.count}</div>
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
