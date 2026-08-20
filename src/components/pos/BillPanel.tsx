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
  orderType: 'DINE_IN' | 'PICKUP';
  onOrderTypeChange: (type: 'DINE_IN' | 'PICKUP') => void;
  selectedTable: string;
  onTableSelect: (table: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem?: (itemId: string) => void;
  paymentMethod: 'cash' | 'upi' | 'card';
  onPaymentMethodChange: (method: 'cash' | 'upi' | 'card') => void;
  discountAmount: number;
  onDiscountChange: (amount: number) => void;
  heldCount: number;
  onHold: () => void;
  onOpenHeld: () => void;
  onSaveBill: () => void;
  onSendKOT: () => void;
}

export function BillPanel({
  cart,
  selectedTable,
  onTableSelect,
  onUpdateQuantity,
  onRemoveItem,
  discountAmount,
  onDiscountChange,
  onHold,
  onSaveBill,
}: BillPanelProps) {
  const [guestCount, setGuestCount] = useState<number>(6);
  const [orderNote, setOrderNote] = useState<string>('');
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [isEditingDiscount, setIsEditingDiscount] = useState<boolean>(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);

  const { subtotal, totalTax, grandTotal } = calculateBillTotals({
    items: cart.map((c) => ({ price: c.price, quantity: c.quantity })),
    discountAmount,
    gstRate: 5,
  });

  const totalItemsCount = cart.reduce((acc, c) => acc + c.quantity, 0);

  return (
    <aside className="w-[340px] xl:w-[370px] bg-white border-l border-[#EBEBEB] flex flex-col justify-between shrink-0 select-none h-full overflow-hidden">
      {/* 1. Header Bar: Table Name + Guest Counter */}
      <div className="px-4 py-3 border-b border-[#EBEBEB] flex items-center justify-between bg-white shrink-0">
        {/* Table Selector / Label with Edit Pen */}
        <button
          type="button"
          onClick={() => setIsTableModalOpen(!isTableModalOpen)}
          className="flex items-center gap-1 text-slate-900 font-bold text-xs hover:text-blue-600 transition-colors cursor-pointer"
        >
          <span>Table: {selectedTable.replace('Table ', '')}</span>
          <span className="material-symbols-outlined text-[15px] text-slate-400">
            edit
          </span>
        </button>

        {/* Guests Counter: Guests: 6 [-] [+] */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-700">Guests: {guestCount}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
              className="w-5 h-5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => setGuestCount((g) => g + 1)}
              className="w-5 h-5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Quick Table Switcher Dropdown (If Table edit is clicked) */}
      {isTableModalOpen && (
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-1 animate-in fade-in">
          {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7', 'Table 8'].map(
            (t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onTableSelect(t);
                  setIsTableModalOpen(false);
                }}
                className={`py-1 px-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  selectedTable === t
                    ? 'border-black bg-black text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            )
          )}
        </div>
      )}

      {/* 2. Scrollable Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 divide-y divide-slate-100 no-scrollbar">
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

              {/* Stepper: [-] Qty [+] */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="w-5 h-5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
                >
                  -
                </button>
                <span className="w-5 text-center text-xs font-bold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="w-5 h-5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer transition-all active:scale-95"
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
                className="text-rose-400 hover:text-rose-600 p-0.5 rounded-md transition-colors cursor-pointer shrink-0"
                title="Remove item"
              >
                <span className="material-symbols-outlined text-[16px]">delete_outline</span>
              </button>
            </div>
          ))
        )}

        {/* Add Order Note Link */}
        <div className="pt-2">
          {isEditingNote ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="e.g. Less spicy, Extra tissue"
                className="flex-1 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-black"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsEditingNote(false)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingNote(true)}
              className="text-[11px] font-normal text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <span>+</span>
              <span>{orderNote ? `Note: "${orderNote}"` : 'Add Order Note'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Totals & Calculation Section */}
      <div className="px-4 py-3 border-t border-[#EBEBEB] bg-white space-y-1.5 shrink-0">
        {/* Items Summary */}
        <div className="flex justify-between items-center text-xs font-normal text-slate-600">
          <span>Items ({totalItemsCount})</span>
          <span className="font-semibold text-slate-900">₹{subtotal}</span>
        </div>

        {/* Discount Row */}
        <div className="flex justify-between items-center text-xs font-normal text-slate-600">
          <div className="flex items-center gap-1.5">
            <span>Discount</span>
            {!isEditingDiscount && (
              <button
                type="button"
                onClick={() => setIsEditingDiscount(true)}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
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
                className="w-14 p-0.5 bg-slate-50 border border-slate-300 rounded text-right text-xs font-bold text-slate-900"
                autoFocus
                onBlur={() => setIsEditingDiscount(false)}
              />
            </div>
          ) : (
            <span className="font-semibold text-slate-900">₹{discountAmount}</span>
          )}
        </div>

        {/* GST (5%) */}
        <div className="flex justify-between items-center text-xs font-normal text-slate-600">
          <span>GST (5%)</span>
          <span className="font-semibold text-slate-900">{formatBillCurrency(totalTax, true)}</span>
        </div>

        {/* TOTAL (Large Blue Font text-[#2563EB]) */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
            TOTAL
          </span>
          <span className="text-xl font-black text-[#2563EB] tracking-tight">
            ₹{grandTotal}
          </span>
        </div>
      </div>

      {/* 4. Bottom 3 Action Buttons (Hold Order | Pay / Checkout | Save & Print) */}
      <div className="p-3 bg-white border-t border-[#EBEBEB] grid grid-cols-3 gap-2 shrink-0">
        {/* Hold Order */}
        <button
          type="button"
          onClick={onHold}
          disabled={cart.length === 0}
          className="bg-[#F8EFE7] hover:bg-[#F2E5D9] text-slate-800 disabled:opacity-40 font-bold text-xs py-3 px-1 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
        >
          <span className="material-symbols-outlined text-[17px]">pause_circle</span>
          <span className="leading-tight">Hold Order</span>
        </button>

        {/* Pay / Checkout (F5) - Black Center Button */}
        <button
          type="button"
          onClick={onSaveBill}
          disabled={cart.length === 0}
          className="bg-black hover:bg-slate-900 text-white disabled:opacity-40 font-bold text-xs py-3 px-2 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95 shadow-md"
        >
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span className="leading-tight">Pay / Checkout</span>
          </div>
          <span className="text-[9px] font-normal text-slate-400">(F5)</span>
        </button>

        {/* Save & Print (F6) */}
        <button
          type="button"
          onClick={onSaveBill}
          disabled={cart.length === 0}
          className="bg-[#F8EFE7] hover:bg-[#F2E5D9] text-slate-800 disabled:opacity-40 font-bold text-xs py-3 px-1 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
        >
          <span className="material-symbols-outlined text-[17px]">print</span>
          <span className="leading-tight">Save & Print</span>
          <span className="text-[9px] font-normal text-slate-500">(F6)</span>
        </button>
      </div>
    </aside>
  );
}
