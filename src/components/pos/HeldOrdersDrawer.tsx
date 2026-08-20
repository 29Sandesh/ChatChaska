'use client';

import React from 'react';
import { formatBillCurrency } from '@/lib/billing';
import { BillItem } from '@/types';

export interface HeldOrder {
  id: string;
  tableNumber: string;
  waiterName: string;
  items: BillItem[];
  subtotal: number;
  grandTotal: number;
  heldAt: string;
  note?: string;
}

export interface HeldOrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  heldOrders: HeldOrder[];
  onRecall: (order: HeldOrder) => void;
  onDeleteHeld: (id: string) => void;
}

export function HeldOrdersDrawer({
  isOpen,
  onClose,
  heldOrders,
  onRecall,
  onDeleteHeld,
}: HeldOrdersDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer from the RIGHT */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-50 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#C3A27C]/30 bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-900 text-[20px]">pause_circle</span>
            <h2 className="font-bold text-sm text-slate-900">
              Parked Bills ({heldOrders.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer border border-[#C3A27C]/40 shadow-2xs"
            title="Close Drawer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 no-scrollbar">
          {heldOrders.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <span className="material-symbols-outlined text-[48px] text-slate-300">
                inbox
              </span>
              <p className="font-bold text-xs text-slate-600">No parked bills on hold</p>
              <p className="text-[11px] text-slate-400">
                Click <span className="font-bold text-slate-700">Hold</span> on any active order in POS to park it.
              </p>
            </div>
          ) : (
            heldOrders.map((held) => (
              <div
                key={held.id}
                className="p-4 rounded-md border border-[#C3A27C]/40 bg-white shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-sm text-xs font-black bg-[#C3A27C] text-slate-950 border border-[#B2906A]">
                      {held.tableNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {held.waiterName || 'Staff'}
                    </span>
                  </div>
                  <span className="font-black text-slate-950 text-sm">
                    {formatBillCurrency(held.grandTotal)}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="text-xs text-slate-700 space-y-1 bg-[#FAF7F2] p-2.5 rounded-md border border-slate-100">
                  {held.items.map((i, idx) => (
                    <div key={i.id || idx} className="flex justify-between">
                      <span className="font-medium">
                        {i.quantity}x {i.name}
                      </span>
                      <span className="font-semibold text-slate-900">{formatBillCurrency(i.lineTotal || (i.quantity * i.unitPrice))}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(held.heldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDeleteHeld(held.id)}
                      className="px-2.5 py-1.5 rounded-md text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRecall(held);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">play_arrow</span>
                      <span>Resume Bill</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
