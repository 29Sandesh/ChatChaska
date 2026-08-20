'use client';

import React from 'react';

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
  viewMode?: 'grid' | 'list' | 'dense';
}

export function MenuItemGrid({
  items,
  onSelectItem,
  viewMode = 'grid',
}: MenuItemGridProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF9F7] overflow-hidden select-none">
      {/* Grid Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 no-scrollbar">
        {items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">
              search_off
            </span>
            <p className="text-xs font-bold text-slate-500">No dishes found</p>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-2 max-w-4xl mx-auto">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="bg-white border border-[#EBEBEB] rounded-2xl p-3 flex items-center justify-between hover:border-slate-300 hover:shadow-2xs transition-all cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                  <span className="text-[11px] font-black text-slate-900">₹{item.price}</span>
                </div>

                <button
                  type="button"
                  className="w-6 h-6 rounded-md border border-emerald-500 text-emerald-600 font-bold text-sm flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Grid & Dense Views */
          <div
            className={`grid gap-2.5 ${
              viewMode === 'dense'
                ? 'grid-cols-6'
                : 'grid-cols-5'
            }`}
          >
            {items.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="bg-white border border-[#EBEBEB] rounded-2xl p-3.5 h-[115px] flex flex-col justify-between shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all relative group cursor-pointer active:scale-98"
                >
                  {/* Top: Title */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                      {item.name}
                    </h4>
                  </div>

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
