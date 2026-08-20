'use client';

import React from 'react';
import Link from 'next/link';

export interface CategoryInfo {
  id: string;
  name: string;
  count: number;
}

interface CategoryPanelProps {
  categories: CategoryInfo[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CATEGORY_ITEMS = [
  { id: 'starters', name: 'Starters & Tandoor', defaultCount: 36, icon: 'skillet' },
  { id: 'main-course', name: 'Main Course', defaultCount: 60, icon: 'restaurant' },
  { id: 'breads-rice', name: 'Breads, Rice & Biryani', defaultCount: 50, icon: 'bakery_dining' },
  { id: 'soups-salads', name: 'Soups, Salads & Pani Puri', defaultCount: 30, icon: 'ramen_dining' },
  { id: 'raita-curd', name: 'Raita & Sides', defaultCount: 20, icon: 'blender' },
  { id: 'indo-chinese', name: 'Indo-Chinese', defaultCount: 30, icon: 'takeout_dining' },
  { id: 'snacks-chaat', name: 'Chaat & Street Snacks', defaultCount: 25, icon: 'tapas' },
  { id: 'shakes-beverages', name: 'Shakes & Drinks', defaultCount: 20, icon: 'local_bar' },
  { id: 'desserts', name: 'Desserts & Sweets', defaultCount: 18, icon: 'icecream' },
  { id: 'drinks', name: 'Tea, Coffee & Beverages', defaultCount: 12, icon: 'local_cafe' },
];

export function CategoryPanel({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryPanelProps) {
  const countMap: Record<string, number> = {};
  categories.forEach((c) => {
    countMap[c.id] = c.count;
  });

  return (
    <aside className="w-[195px] bg-[#FAFAFA] border-r border-[#EBEBEB] flex flex-col justify-between shrink-0 select-none h-full overflow-hidden">
      {/* Scrollable Categories List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1 no-scrollbar">
        {/* All Items Button (Beige Active Card) */}
        <button
          type="button"
          onClick={() => onSelectCategory('ALL')}
          className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-[#F8EFE7] text-slate-900 font-bold'
              : 'text-slate-700 hover:bg-slate-100 font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[17px] text-slate-900">
            add_box
          </span>
          <span className="text-xs font-bold">All Items</span>
        </button>

        {/* Favorites */}
        <button
          type="button"
          onClick={() => onSelectCategory('FAVORITES')}
          className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
            selectedCategory === 'FAVORITES'
              ? 'bg-[#F8EFE7] text-slate-900 font-bold'
              : 'text-slate-700 hover:bg-slate-100 font-medium'
          }`}
        >
          <span className="material-symbols-outlined text-[17px] text-slate-900">
            star
          </span>
          <span className="text-xs">Favorites</span>
        </button>

        {/* Category List Items */}
        {CATEGORY_ITEMS.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = countMap[cat.id] || cat.defaultCount;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#F8EFE7] text-slate-900 font-bold'
                  : 'text-slate-700 hover:bg-slate-100 font-medium'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-1.5">
                <span className="material-symbols-outlined text-[17px] text-slate-700 shrink-0">
                  {cat.icon}
                </span>
                <span className="text-xs truncate leading-tight">{cat.name}</span>
              </div>

              <span className="text-[10px] font-semibold text-slate-500 bg-[#EFEFEF] px-1.5 py-0.5 rounded-md shrink-0">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Fixed Links: Reports & Settings */}
      <div className="p-2.5 border-t border-[#EBEBEB] bg-[#FAFAFA] flex items-center gap-2">
        <Link
          href="/staff/history"
          className="flex-1 py-2 bg-white hover:bg-slate-50 border border-[#E5E5E5] rounded-xl text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-[15px] text-slate-500">
            description
          </span>
          <span>Reports</span>
        </Link>
        <Link
          href="/admin"
          className="flex-1 py-2 bg-white hover:bg-slate-50 border border-[#E5E5E5] rounded-xl text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-[15px] text-slate-500">
            settings
          </span>
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
