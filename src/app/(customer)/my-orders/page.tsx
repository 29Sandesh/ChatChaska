'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CustomerOrdersPage() {
  const [orders] = useState([
    {
      id: 'ORD-8921',
      cafe_name: 'ChatChaska Signature Cafe',
      slug: 'chatchaska-cafe',
      table_number: 'Table 4',
      date: 'Today, 2:30 PM',
      total_amount: 380,
      status: 'served',
      items: [
        { name: 'Special Masala Chai', quantity: 2, price: 40 },
        { name: 'Crispy Paneer Tikka (Full)', quantity: 1, price: 220 },
        { name: 'Butter Pav Bhaji', quantity: 1, price: 80 },
      ],
    },
    {
      id: 'ORD-6412',
      cafe_name: 'Royal Spice Kitchen',
      slug: 'royal-spice-kitchen',
      table_number: 'Table 10',
      date: 'Yesterday, 8:15 PM',
      total_amount: 740,
      status: 'served',
      items: [
        { name: 'Butter Chicken Special', quantity: 1, price: 340 },
        { name: 'Garlic Naan', quantity: 3, price: 60 },
        { name: 'Jeera Rice', quantity: 1, price: 160 },
      ],
    },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 max-w-2xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-black">My Table Orders</h1>
        <p className="text-xs text-slate-400 mt-1">Track your past dining receipts and easily reorder your favorites.</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100">{order.cafe_name}</h3>
                <span className="text-[11px] text-slate-400">
                  {order.date} • {order.table_number}
                </span>
              </div>

              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                {order.status}
              </span>
            </div>

            {/* Items */}
            <div className="bg-slate-950/60 rounded-2xl p-3.5 space-y-1.5 border border-slate-900">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-300">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="text-slate-400 font-semibold">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Total & Reorder */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 block">TOTAL BILLED</span>
                <span className="text-base font-black text-emerald-400">₹{order.total_amount}</span>
              </div>

              <Link
                href={`/menu/${order.slug}`}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">restaurant_menu</span>
                <span>Reorder Items</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
