'use client';

import React, { useState } from 'react';
import { calculateBillTotals, formatBillCurrency } from '@/lib/billing';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  veg?: boolean;
}

interface BillPanelProps {
  cart: CartItem[];
  orderType?: 'DINE_IN' | 'PICKUP';
  onOrderTypeChange?: (type: 'DINE_IN' | 'PICKUP') => void;
  selectedTable?: string;
  onTableSelect?: (table: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem?: (itemId: string) => void;
  discountAmount: number;
  onDiscountChange: (amount: number) => void;
  heldCount?: number;
  onHold: () => void;
  onOpenHeld?: () => void;
  onNext: () => void;
}

export function BillPanel({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  discountAmount,
  onDiscountChange,
  onHold,
  onNext,
}: BillPanelProps) {
  const [isEditingDiscount, setIsEditingDiscount] = useState<boolean>(false);

  const { subtotal, totalTax, grandTotal } = calculateBillTotals({
    items: cart.map((c) => ({ price: c.price, quantity: c.quantity })),
    discountAmount,
    gstRate: 5,
  });

  const totalItemsCount = cart.reduce((acc, c) => acc + c.quantity, 0);

  return (
    <aside className="w-[340px] xl:w-[370px] bg-white border-l border-[#EBEBEB] flex flex-col justify-between shrink-0 select-none h-full overflow-hidden">
      {/* 1. Scrollable Cart Items List */}
      <div className="flex-1 overflow-y-auto pt-5 pb-3 px-4 space-y-2.5 divide-y divide-slate-100 no-scrollbar">
        {cart.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-1 text-slate-300">
              shopping_bag
            </span>
            <p className="text-xs font-bold text-slate-500">Order is empty</p>
            <span className="text-[11px] text-slate-400 mt-0.5">Click any dish from the menu to add</span>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2">
              {/* Item Name & Price */}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 leading-snug truncate">
                  {item.name}
                </h4>
                <p className="text-[11px] font-normal text-slate-400 mt-0.5">
                  ₹{item.price} each
                </p>
              </div>

              {/* Stepper: [-] Qty [+] (Box-Shaped) */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-5 h-5 rounded-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
                >
                  -
                </button>
                <span className="w-5 text-center text-xs font-bold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-5 h-5 rounded-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
                >
                  +
                </button>
              </div>

              {/* Line Total */}
              <div className="w-12 text-right font-bold text-xs text-slate-900 shrink-0">
                ₹{item.price * item.quantity}
              </div>

              {/* Red Delete Trash Icon */}
              <button
                type="button"
                onClick={() => (onRemoveItem ? onRemoveItem(item.id) : onUpdateQuantity(item.id, -item.quantity))}
                className="text-rose-400 hover:text-rose-600 p-0.5 rounded-sm transition-colors cursor-pointer shrink-0"
                title="Remove item"
              >
                <span className="material-symbols-outlined text-[16px]">delete_outline</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* 2. Totals & Calculation Section */}
      <div className="px-4 py-3 border-t border-[#EBEBEB] bg-white space-y-1.5 shrink-0">
        {/* Items Summary */}
        <div className="flex justify-between items-center text-xs font-normal text-slate-600">
          <span>Subtotal ({totalItemsCount} items)</span>
          <span className="font-semibold text-slate-900">₹{subtotal}</span>
        </div>

        {/* Discount Row */}
        <div className="flex justify-between items-center text-xs font-normal text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>Discount (₹)</span>
            {!isEditingDiscount && (
              <button
                type="button"
                onClick={() => setIsEditingDiscount(true)}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Add
              </button>
            )}
          </div>
          {isEditingDiscount ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max={subtotal}
                value={discountAmount || ''}
                onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-14 p-0.5 bg-slate-50 border border-slate-300 rounded-sm text-right text-xs font-bold text-slate-900"
                autoFocus
                onBlur={() => setIsEditingDiscount(false)}
              />
            </div>
          ) : (
            <span className="font-semibold text-slate-900">{discountAmount}</span>
          )}
        </div>

        {/* GST (5%) */}
        <div className="flex justify-between items-center text-xs font-normal text-slate-600">
          <span>GST (5%)</span>
          <span className="font-semibold text-slate-900">₹{formatBillCurrency(totalTax, true)}</span>
        </div>

        {/* TOTAL (Deep Black Bold Font) */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
            TOTAL
          </span>
          <span className="text-xl font-black text-black tracking-tight">
            ₹{grandTotal}
          </span>
        </div>
      </div>

      {/* 3. Bottom Action Buttons: EXACTLY 2 BOX-SHAPED BUTTONS (1/3 Hold, 2/3 Next) IN #C3A27C BEIGE */}
      <div className="p-3 bg-white border-t border-[#EBEBEB] flex items-center gap-2 shrink-0">
        {/* Hold Order Button (1/3 width, Box-Shaped rounded-md) */}
        <button
          type="button"
          onClick={onHold}
          disabled={cart.length === 0}
          className="w-1/3 h-11 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B3926C] disabled:opacity-40 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
          title="Hold / Park Order"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-950">pause_circle</span>
          <span className="text-xs font-bold">Hold</span>
        </button>

        {/* Next Button (2/3 width, Box-Shaped rounded-md) */}
        <button
          type="button"
          onClick={onNext}
          disabled={cart.length === 0}
          className="w-2/3 h-11 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B3926C] disabled:opacity-40 font-bold text-xs rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs"
        >
          <span>Next</span>
          <span className="material-symbols-outlined text-[18px] text-slate-950">arrow_forward</span>
        </button>
      </div>
    </aside>
  );
}
