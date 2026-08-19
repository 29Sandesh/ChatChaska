'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CafePublicProfile } from '@/types';

export default function ExploreDiscoveryPage() {
  const [cafes, setCafes] = useState<CafePublicProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'popular' | 'newest'>('rating');
  const [loading, setLoading] = useState(true);

  const cities = ['All', 'Pune', 'Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad'];
  const cuisines = [
    'All',
    'Cafe',
    'North Indian',
    'Tea & Coffee',
    'Street Snacks',
    'Fast Food',
    'Biryani',
    'Desserts',
  ];

  useEffect(() => {
    async function fetchCafes() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedCity !== 'All') params.set('city', selectedCity);
        if (selectedCuisine !== 'All') params.set('cuisine', selectedCuisine);
        if (vegOnly) params.set('veg', 'true');
        params.set('sort', sortBy);

        const res = await fetch(`/api/public/cafes?${params.toString()}`);
        const data = await res.json();
        setCafes(data.cafes || []);
      } catch (err) {
        console.error('Error loading cafes:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchCafes();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCity, selectedCuisine, vegOnly, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-b from-orange-950/40 via-slate-900 to-slate-950 pt-8 pb-6 px-4 md:px-8 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Top Bar: Brand & City Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/chaska-c-logo.png" alt="ChatChaska" className="w-8 h-8 rounded-xl object-contain shadow-md" />
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                ChatChaska
              </span>
            </div>

            {/* City Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-200">
              <span className="material-symbols-outlined text-orange-400 text-base">location_on</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-white focus:outline-hidden cursor-pointer"
              >
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Heading */}
          <div className="pt-2">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-100">
              Discover Top Cafes & Diners
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Explore menus, check live reviews, and scan table QR codes for instant self-ordering.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative pt-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by cafe name, dish, cuisine, or area..."
              className="w-full bg-slate-900/90 border border-slate-700/90 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500 shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Filters Horizontal Bar */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              vegOnly
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Pure Veg</span>
          </button>

          {/* Cuisine Chips */}
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                selectedCuisine === c
                  ? 'bg-orange-500 border-orange-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>{cafes.length} food places available</span>
          <div className="flex items-center gap-1.5">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-hidden"
            >
              <option value="rating">Top Rated ⭐</option>
              <option value="popular">Most Popular 🔥</option>
              <option value="newest">Newly Listed ✨</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Cafe Discovery Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-3xl h-72 animate-pulse" />
            ))}
          </div>
        ) : cafes.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <span className="material-symbols-outlined text-5xl text-slate-600">storefront</span>
            <h3 className="text-lg font-bold text-slate-300">No cafes found matching filters</h3>
            <p className="text-xs text-slate-500">Try searching a different city or clearing cuisine tags.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cafes.map((cafe) => (
              <Link
                key={cafe.id}
                href={`/cafe/${cafe.slug}`}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group flex flex-col cursor-pointer"
              >
                {/* Banner Hero */}
                <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                  <img
                    src={cafe.banner_url || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80'}
                    alt={cafe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-amber-300 shadow-md">
                    <span>⭐</span>
                    <span>{cafe.avg_rating || '4.8'}</span>
                    <span className="text-slate-400 text-[10px]">({cafe.total_reviews || 120})</span>
                  </div>

                  {/* Pure Veg Tag */}
                  {cafe.is_pure_veg && (
                    <div className="absolute top-3 left-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>PURE VEG</span>
                    </div>
                  )}

                  {/* Cost Pill */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-medium text-slate-200">
                    ₹{cafe.avg_cost_for_two || 350} for two
                  </div>
                </div>

                {/* Cafe Info Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-black text-lg text-slate-100 group-hover:text-orange-400 transition-colors">
                      {cafe.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {cafe.cuisine_tags?.join(' • ') || 'Artisan Cafe & Gourmet Bites'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-slate-500">location_on</span>
                      <span className="truncate">{cafe.address ? `${cafe.address}, ${cafe.city}` : cafe.city || 'India'}</span>
                    </p>
                  </div>

                  {/* Action Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Open Now</span>
                    </span>

                    <span className="text-orange-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>View Menu</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
