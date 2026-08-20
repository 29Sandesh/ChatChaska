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
  totalCount,
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

  const displayedCount = totalCount !== undefined ? totalCount : items.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF9F7] overflow-hidden select-none">
      {/* Section Header with Title, Count, and View Switcher */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-200/90 flex items-center justify-between shrink-0">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            {categoryTitle}
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {displayedCount} {displayedCount === 1 ? 'item' : 'Items'}
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
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
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
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
            <span className="material-symbols-outlined text-[18px]">view_list</span>
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
            <span className="material-symbols-outlined text-[18px]">apps</span>
          </button>
        </div>
      </div>

      {/* Grid Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 no-scrollbar">
        {items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
              search_off
            </span>
            <p className="text-xs font-bold text-slate-500">No dishes match your filter</p>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-2 max-w-4xl mx-auto">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="text-slate-300 hover:text-amber-500"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {favoriteIds.has(item.id) ? 'star' : 'star_border'}
                    </span>
                  </button>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[11px] font-black text-slate-900">₹{item.price}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-7 h-7 rounded-lg border border-emerald-500 text-emerald-600 font-bold text-base flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Grid View & Dense View */
          <div
            className={`grid gap-3.5 ${
              viewMode === 'dense'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            }`}
          >
            {items.map((item, idx) => {
              const isFavorite = favoriteIds.has(item.id);
              // Mark some items as Bestseller / Popular if tagged or based on index for realism
              const isBestseller = item.bestseller || (idx % 9 === 2);
              const isPopular = item.popular || (idx % 11 === 4);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between min-h-[118px] shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-150 relative group cursor-pointer active:scale-98"
                >
                  {/* Top Area: Badges, Title, and Favorite Star */}
                  <div>
                    {/* Badges */}
                    {isBestseller ? (
                      <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mb-1 tracking-tight">
                        Bestseller
                      </span>
                    ) : isPopular ? (
                      <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[9px] font-black px-1.5 py-0.5 rounded-md inline-block mb-1 tracking-tight">
                        Popular
                      </span>
                    ) : null}

                    {/* Title */}
                    <h4 className="text-xs font-bold text-slate-900 leading-snug pr-4 line-clamp-2">
                      {item.name}
                    </h4>
                  </div>

                  {/* Favorite Star (Top Right) */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="absolute top-3 right-3 text-slate-300 group-hover:text-slate-400 hover:!text-amber-500 transition-colors"
                  >
                    <span className={`material-symbols-outlined text-[17px] ${isFavorite ? 'text-amber-500 font-filled' : ''}`}>
                      {isFavorite ? 'star' : 'star'}
                    </span>
                  </button>

                  {/* Bottom Row: Price and Green Add Button */}
                  <div className="flex items-center justify-between pt-2 mt-auto">
                    <span className="text-xs font-black text-slate-900 tracking-tight">
                      ₹{item.price}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      className="w-6 h-6 rounded-md border border-emerald-500 text-emerald-600 font-bold text-sm flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer active:scale-90"
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
