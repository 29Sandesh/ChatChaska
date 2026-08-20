'use client';

import React, { useState } from 'react';

export interface MenuItemData {
  id: string;
  name: string;
  category: string;
  price: number;
  available?: boolean;
  popular?: boolean;
  bestseller?: boolean;
  veg?: boolean;
  jain?: boolean;
}

export type DietaryFilter = 'ALL' | 'VEG' | 'NON_VEG' | 'JAIN';

interface MenuItemGridProps {
  items: MenuItemData[];
  onSelectItem: (item: MenuItemData) => void;
  categoryTitle?: string;
  totalCount?: number;
}

export function MenuItemGrid({
  items,
  onSelectItem,
  categoryTitle = 'All Items',
  totalCount = 301,
}: MenuItemGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'dense'>('grid');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF9F7] overflow-hidden select-none">
      {/* Section Header with Title, Count, and View Switcher */}
      <div className="px-5 py-3 bg-white border-b border-[#EBEBEB] flex items-center justify-between shrink-0">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            {categoryTitle}
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {totalCount} Items
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Grid View"
          >
            <span className="material-symbols-outlined text-[17px]">grid_view</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title="List View"
          >
            <span className="material-symbols-outlined text-[17px]">view_list</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('dense')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              viewMode === 'dense'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Compact View"
          >
            <span className="material-symbols-outlined text-[17px]">apps</span>
          </button>
        </div>
      </div>

      {/* Grid Content Area - Exact 5 Columns Grid */}
      <div className="flex-1 overflow-y-auto p-3.5 no-scrollbar">
        {items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
              search_off
            </span>
            <p className="text-xs font-bold text-slate-500">No dishes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2.5">
            {items.map((item) => {
              const isFavorite = favoriteIds.has(item.id);
              // Tag specific items for authentic visuals
              const isBestseller =
                item.bestseller ||
                item.name.toLowerCase().includes('garlic mayo') ||
                item.name.toLowerCase().includes('royal meetha');
              const isPopular =
                item.popular ||
                item.name.toLowerCase().includes('makki di roti');

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="bg-white border border-[#EBEBEB] rounded-2xl p-3 h-[115px] flex flex-col justify-between shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all relative group cursor-pointer active:scale-98"
                >
                  {/* Top: Badges & Title */}
                  <div>
                    {isBestseller ? (
                      <span className="bg-[#FFF4EC] text-[#D97706] text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block mb-1">
                        Bestseller
                      </span>
                    ) : isPopular ? (
                      <span className="bg-[#EFF6FF] text-[#2563EB] text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-block mb-1">
                        Popular
                      </span>
                    ) : null}

                    <h4 className="text-xs font-bold text-slate-900 leading-tight line-clamp-2 pr-4">
                      {item.name}
                    </h4>
                  </div>

                  {/* Favorite Star (Top Right) */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="absolute top-2.5 right-2.5 text-slate-300 hover:text-amber-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isFavorite ? 'star' : 'star_outline'}
                    </span>
                  </button>

                  {/* Bottom Row: Price & Plus Button */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-black text-slate-900">
                      ₹{item.price}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      className="w-5 h-5 rounded-md border border-emerald-500 text-emerald-600 font-bold text-xs flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer active:scale-90"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
