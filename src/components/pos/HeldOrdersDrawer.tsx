'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 pr-[72px]">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Drawer Header with single Cross button on the left */}
        <div className="flex items-center gap-3 p-3.5 border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
            title="Close Drawer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
          
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-amber-500 text-[20px]">pause_circle</span>
            <h2 className="font-bold text-sm text-slate-900 truncate">
              Parked Bills ({heldOrders.length})
            </h2>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {heldOrders.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant space-y-2">
              <span className="material-symbols-outlined text-[48px] text-outline opacity-40">
                inbox
              </span>
              <p className="font-medium text-sm">No parked bills on hold</p>
              <p className="text-xs text-outline">
                Use <kbd className="px-1.5 py-0.5 bg-surface-container-high rounded border border-outline-variant/30 font-mono text-[10px]">F4</kbd> to park a running bill in POS.
              </p>
            </div>
          ) : (
            heldOrders.map((held) => (
              <div
                key={held.id}
                className="p-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-xs hover:border-outline/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {held.tableNumber}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {held.waiterName || 'Staff'}
                    </span>
                  </div>
                  <span className="font-black text-primary text-base">
                    {formatCurrency(held.grandTotal)}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="text-xs text-on-surface-variant space-y-1 bg-surface-container-low/50 p-2.5 rounded-xl">
                  {held.items.map((i) => (
                    <div key={i.id} className="flex justify-between">
                      <span>
                        {i.quantity}x {i.name}
                      </span>
                      <span className="font-semibold">{formatCurrency(i.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-outline">
                    Held at {new Date(held.heldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDeleteHeld(held.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      Discard
                    </button>
                    <Button
                      variant="primary"
                      className="text-xs py-1.5 px-3 h-auto"
                      onClick={() => {
                        onRecall(held);
                        onClose();
                      }}
                    >
                      Recall Bill
                    </Button>
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
