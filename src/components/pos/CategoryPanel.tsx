'use client';

import React from 'react';
import Link from 'next/link';

export interface CategoryInfo {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

interface CategoryPanelProps {
  categories: CategoryInfo[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  totalItemsCount?: number;
}

const CATEGORY_ICON_MAP: Record<string, string> = {
  ALL: 'grid_view',
  FAVORITES: 'star',
  starters: 'skillet',
  'main-course': 'soup_kitchen',
  'breads-rice': 'bakery_dining',
  'soups-salads': 'ramen_dining',
  'raita-curd': 'blender',
  'indo-chinese': 'takeout_dining',
  'snacks-chaat': 'tapas',
  'shakes-beverages': 'local_bar',
  desserts: 'icecream',
  drinks: 'local_cafe',
};

export function CategoryPanel({
  categories,
  selectedCategory,
  onSelectCategory,
  totalItemsCount = 301,
}: CategoryPanelProps) {
  return (
    <aside className="w-[210px] bg-[#FAF9F7] border-r border-slate-200/90 flex flex-col justify-between shrink-0 select-none h-full overflow-hidden">
      {/* Scrollable Categories List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
        {/* All Items Button (Beige Active Card) */}
        <button
          type="button"
          onClick={() => onSelectCategory('ALL')}
          className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-[#F5ECE2] text-[#2C241E] font-black border border-[#E8DCCF] shadow-2xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200/80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-[20px] text-[#2C241E]">
              grid_view
            </span>
            <span className="text-xs font-black truncate">All Items</span>
          </div>
        </button>

        {/* Favorites */}
        <button
          type="button"
          onClick={() => onSelectCategory('FAVORITES')}
          className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
            selectedCategory === 'FAVORITES'
              ? 'bg-[#F5ECE2] text-[#2C241E] font-black border border-[#E8DCCF]'
              : 'text-slate-700 hover:bg-slate-100/80 font-bold'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-[19px] text-amber-500">
              star
            </span>
            <span className="text-xs truncate">Favorites</span>
          </div>
        </button>

        {/* Dynamic Category List */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const icon = CATEGORY_ICON_MAP[cat.id] || 'restaurant';

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#F5ECE2] text-[#2C241E] font-black border border-[#E8DCCF] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span
                  className={`material-symbols-outlined text-[19px] ${
                    isSelected ? 'text-[#2C241E]' : 'text-slate-500'
                  }`}
                >
                  {icon}
                </span>
                <span className="text-xs truncate leading-tight">{cat.name}</span>
              </div>

              {cat.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isSelected
                      ? 'bg-[#EBDBCB] text-[#2C241E]'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Fixed Links: Reports & Settings */}
      <div className="p-3 border-t border-slate-200/90 bg-[#FAF9F7] flex items-center gap-2">
        <Link
          href="/staff/history"
          className="flex-1 py-2 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-sm text-slate-500">
            description
          </span>
          <span>Reports</span>
        </Link>
        <Link
          href="/admin"
          className="flex-1 py-2 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-sm text-slate-500">
            settings
          </span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
