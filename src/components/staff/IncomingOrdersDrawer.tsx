'use client';

import React from 'react';
import { CloudOrder } from '@/types';

interface IncomingOrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CloudOrder[];
  onAccept: (order: CloudOrder) => void;
  onReject: (order: CloudOrder) => void;
}

export function IncomingOrdersDrawer({
  isOpen,
  onClose,
  orders,
  onAccept,
  onReject,
}: IncomingOrdersDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-lg font-bold text-slate-100">
              Incoming Orders ({orders.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <span className="material-symbols-outlined text-5xl text-slate-700">room_service</span>
              <p className="text-sm font-semibold text-slate-400">No pending customer orders</p>
              <p className="text-xs text-slate-600">New orders from QR codes and the app will appear here live with audio alerts.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id || order.order_number}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 hover:border-slate-700 transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-black px-2.5 py-1 rounded-xl">
                      {order.order_number}
                    </span>
                    <span className="bg-slate-800 text-slate-200 text-xs font-bold px-2.5 py-1 rounded-xl">
                      📍 {order.table_number}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {order.customer_phone ? `📱 ${order.customer_phone}` : 'Guest'}
                  </span>
                </div>

                {/* Items Breakdown */}
                <div className="space-y-1.5 pt-1 border-t border-slate-900">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                      <span className="font-medium">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold text-slate-400">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {order.special_instructions && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-[11px] text-amber-300">
                    <span className="font-bold">Note:</span> {order.special_instructions}
                  </div>
                )}

                {/* Total & Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">TOTAL (INC. GST)</span>
                    <span className="text-base font-black text-emerald-400">₹{order.total_amount}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onReject(order)}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => onAccept(order)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">check</span>
                      <span>Accept KOT</span>
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
