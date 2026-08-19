'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';

interface OrderItem {
  name: string;
  quantity: number;
}

interface KOTOrder {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  createdAt: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
}

const MAX_ITEMS_PER_CARD = 6;
let globalAudioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!globalAudioCtx) {
    try {
      globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported', e);
    }
  }
  return globalAudioCtx;
};

export default function StaffKitchenPage() {
  const [orders, setOrders] = useState<KOTOrder[]>([]);
  const [now, setNow] = useState(new Date());
  const prevCountRef = useRef<number>(0);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        // Filter out completed, served, and cancelled orders so they vanish from chef view!
        const activeOnly = data.orders.filter(
          (o: KOTOrder) => o.status !== 'served' && o.status !== 'completed' && o.status !== 'cancelled'
        );

        if (prevCountRef.current > 0 && activeOnly.length > prevCountRef.current) {
          playChime();
        }
        prevCountRef.current = activeOnly.length;
        setOrders(activeOnly);
      }
    } catch (err) {
      console.error('Failed to fetch kitchen orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    const timeInterval = setInterval(() => setNow(new Date()), 30000); // update timer every 30s
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const playChime = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  // Button Action Handler: Pending (Start) -> Preparing (Ready) -> Ready (Served) -> Vanishes!
  const handleBump = async (id: string, currentStatus: string) => {
    let nextStatus = 'preparing';
    if (currentStatus === 'pending') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready') nextStatus = 'served'; // Marked served -> vanishes!

    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: nextStatus }),
    });

    fetchOrders();
  };

  const formatTableLabel = (num: string) => {
    if (!num) return 'T1';
    const clean = num.replace(/^table\s*/i, '').trim();
    return clean.startsWith('T') ? clean : `Table ${clean}`;
  };

  // Flatten active orders into continuation tickets
  const displayTickets = useMemo(() => {
    const tickets: {
      orderId: string;
      tableNumber: string;
      status: string;
      items: OrderItem[];
      createdAt: string;
      partLabel?: string;
    }[] = [];

    orders.forEach((ord) => {
      if ((ord.items || []).length <= MAX_ITEMS_PER_CARD) {
        tickets.push({
          orderId: ord.id,
          tableNumber: ord.tableNumber,
          status: ord.status,
          createdAt: ord.createdAt,
          items: ord.items || [],
        });
      } else {
        const totalParts = Math.ceil(ord.items.length / MAX_ITEMS_PER_CARD);
        for (let p = 0; p < totalParts; p++) {
          const chunk = ord.items.slice(p * MAX_ITEMS_PER_CARD, (p + 1) * MAX_ITEMS_PER_CARD);
          tickets.push({
            orderId: ord.id,
            tableNumber: ord.tableNumber,
            status: ord.status,
            createdAt: ord.createdAt,
            items: chunk,
            partLabel: `(${p + 1}/${totalParts})`,
          });
        }
      }
    });

    return tickets;
  }, [orders]);

  const visibleTickets = displayTickets;
  const queueCount = 0;

  return (
    <div className="p-3 bg-black min-h-screen text-white select-none font-mono flex flex-col justify-between">
      {/* Top Header Queue Indicator */}
      <div className="flex justify-between items-center px-2 py-2 mb-2 border-b border-neutral-800 bg-black">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-white text-[24px]">soup_kitchen</span>
          <h1 className="font-black text-white text-base tracking-tight">KITCHEN DISPLAY SYSTEM</h1>
        </div>

        <div className="flex items-center gap-3">
          {queueCount > 0 && (
            <span className="bg-neutral-900 border border-white text-white font-black text-xs px-3 py-1 rounded-none animate-pulse">
              + {queueCount} MORE TICKETS IN QUEUE
            </span>
          )}
          <span className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs font-bold px-3 py-1 rounded-none">
            {displayTickets.length} ACTIVE TICKETS
          </span>
        </div>
      </div>

      {/* Grid of 8 Layout (Strictly 4 columns x 2 rows = 8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
        {visibleTickets.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-black border border-neutral-800 rounded-none space-y-3">
            <span className="material-symbols-outlined text-[64px] text-white">check_circle</span>
            <h3 className="font-black text-white text-xl uppercase tracking-wider">KITCHEN QUEUE ALL CLEAR</h3>
            <p className="text-neutral-400 text-xs font-mono">Served tickets vanish automatically.</p>
          </div>
        ) : (
          visibleTickets.map((ticket, index) => {
            const isPending = ticket.status === 'pending';
            const isPreparing = ticket.status === 'preparing';

            return (
              <div
                key={`${ticket.orderId}-${index}`}
                className={`rounded-none p-4 flex flex-col justify-between shadow-none transition-all h-[calc(47vh-1.5rem)] min-h-[280px] bg-black ${
                  isPending
                    ? 'border-2 border-white'
                    : isPreparing
                    ? 'border-2 border-neutral-400'
                    : 'border-2 border-neutral-700'
                }`}
              >
                <div>
                  {/* Top Line: Sharp Table Badge + Action Button */}
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-800 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="px-3 py-1 bg-white text-black font-black text-base rounded-none flex-shrink-0 inline-block w-fit">
                        {formatTableLabel(ticket.tableNumber)} {ticket.partLabel || ''}
                      </span>
                      {(() => {
                        const created = new Date(ticket.createdAt || now);
                        const mins = Math.max(0, Math.floor((now.getTime() - created.getTime()) / 60000));
                        let colorClass = 'text-emerald-400';
                        if (mins >= 10 && mins <= 20) colorClass = 'text-amber-400';
                        else if (mins > 20) colorClass = 'text-rose-500 font-extrabold animate-pulse';
                        return (
                          <span className={`text-xs ${colorClass}`}>
                            ⏱ {mins} min ago
                          </span>
                        );
                      })()}
                    </div>

                    {/* Action Button: Pending -> Start | Preparing -> Ready | Ready -> Served */}
                    <button
                      onClick={() => handleBump(ticket.orderId, ticket.status)}
                      className="px-4 py-1 bg-white hover:bg-neutral-200 text-black font-black text-sm rounded-none border border-white cursor-pointer flex-shrink-0 transition-colors"
                    >
                      {isPending ? 'Start' : isPreparing ? 'Ready' : 'Served'}
                    </button>
                  </div>

                  {/* Sharp High-Contrast Monochrome Items List - Completely Scrollbar-Free */}
                  <div className="py-2.5 space-y-2 overflow-hidden no-scrollbar">
                    {ticket.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-neutral-900 pb-1.5 last:border-none">
                        <span className="text-sm font-bold text-white truncate pr-2">• {i.name}</span>
                        <span className="px-2.5 py-0.5 bg-white text-black rounded-none font-black text-xs flex-shrink-0">
                          x{i.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
