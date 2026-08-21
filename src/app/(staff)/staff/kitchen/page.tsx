'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { StaffNavigationDrawer } from '@/components/layout/StaffNavigationDrawer';

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
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);
  const [activeStation, setActiveStation] = useState<string>('All Stations');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  
  const prevCountRef = useRef<number>(0);
  const isSoundEnabledRef = useRef<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem('chatchaska_kds_sound');
    if (saved !== null) {
      const val = saved === 'true';
      setIsSoundEnabled(val);
      isSoundEnabledRef.current = val;
    }
  }, []);

  const toggleSound = () => {
    const newVal = !isSoundEnabled;
    setIsSoundEnabled(newVal);
    isSoundEnabledRef.current = newVal;
    localStorage.setItem('chatchaska_kds_sound', String(newVal));
  };

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
          if (isSoundEnabledRef.current) {
            playChime();
          }
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
    if (!num) return '1';
    if (num.toLowerCase().includes('pickup') || num.toLowerCase().includes('takeaway')) return 'Takeaway';
    const digits = num.replace(/\D/g, '');
    return digits ? digits : num;
  };

  const isDrink = (name: string) => ['chai', 'coffee', 'shake', 'mojito', 'soda'].some(k => name.toLowerCase().includes(k));
  const isDessert = (name: string) => ['ice cream', 'brownie', 'cake'].some(k => name.toLowerCase().includes(k));
  const isFood = (name: string) => !isDrink(name) && !isDessert(name);

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
      const filteredItems = (ord.items || []).filter(item => {
        if (activeStation === 'All Stations') return true;
        if (activeStation === 'Drinks & Beverages') return isDrink(item.name);
        if (activeStation === 'Desserts & Bakery') return isDessert(item.name);
        if (activeStation === 'Food / Kitchen') return isFood(item.name);
        return true;
      });

      if (filteredItems.length === 0) return;

      if (filteredItems.length <= MAX_ITEMS_PER_CARD) {
        tickets.push({
          orderId: ord.id,
          tableNumber: ord.tableNumber,
          status: ord.status,
          createdAt: ord.createdAt,
          items: filteredItems,
        });
      } else {
        const totalParts = Math.ceil(filteredItems.length / MAX_ITEMS_PER_CARD);
        for (let p = 0; p < totalParts; p++) {
          const chunk = filteredItems.slice(p * MAX_ITEMS_PER_CARD, (p + 1) * MAX_ITEMS_PER_CARD);
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
  }, [orders, activeStation]);

  const visibleTickets = displayTickets;

  return (
    <div className="bg-black flex-1 flex flex-col h-full w-full text-white select-none font-mono justify-between overflow-hidden">
      {/* 1. TOP BLACK HEADER: LOGO ON LEFT | ACTIVE TICKETS BADGE IN CENTER | [ POS ] + [ ☰ ] ON RIGHT */}
      <header className="h-16 bg-black border-b border-neutral-800 px-5 flex items-center justify-between gap-4 shrink-0 select-none sticky top-0 z-30 font-sans">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3.5 shrink-0">
          <Link href="/staff/pos" className="flex items-center">
            <img
              src="/chatchaska-logo.png"
              alt="ChatChaska"
              className="h-8 w-auto max-w-[160px] object-contain drop-shadow-2xs brightness-0 invert"
            />
          </Link>
          <div className="h-5 w-px bg-neutral-800 hidden sm:block" />
          <div className="flex items-center gap-1.5 text-white font-black text-sm tracking-wide">
            <span className="material-symbols-outlined text-[20px] text-amber-400">soup_kitchen</span>
            <span className="hidden sm:inline">KITCHEN DISPLAY</span>
          </div>
        </div>

        {/* Center: Active Tickets Counter Badge & Sound Toggle */}
        <div className="flex items-center gap-2">
          <span className="bg-neutral-900 border border-neutral-700 text-amber-400 text-xs font-mono font-bold px-3.5 py-1.5 rounded-md tracking-wider flex items-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>{displayTickets.length} ACTIVE TICKETS</span>
          </span>
          <button 
            onClick={toggleSound}
            className="w-8 h-8 rounded-md hover:bg-neutral-900 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer border border-neutral-800"
            title={isSoundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSoundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>
        </div>

        {/* Right: POS Quick Button + Right Navigation Drawer Trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/staff/pos"
            className="px-3.5 py-1.5 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs border border-[#B2906A]"
          >
            <span className="material-symbols-outlined text-[16px]">
              point_of_sale
            </span>
            <span>POS</span>
          </Link>

          {/* Hamburger ☰ (Opens Navigation Drawer from the RIGHT) */}
          <button
            type="button"
            onClick={() => setIsNavDrawerOpen(true)}
            className="w-9 h-9 rounded-md hover:bg-neutral-900 flex items-center justify-center text-white transition-all cursor-pointer border border-neutral-800"
            title="Navigation Menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        </div>
      </header>

      {/* Station Filtering Tabs */}
      <div className="bg-[#1a1a1a] border-b border-neutral-800 px-5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 h-12 font-sans">
        {['All Stations', 'Food / Kitchen', 'Drinks & Beverages', 'Desserts & Bakery'].map(station => (
          <button
            key={station}
            onClick={() => setActiveStation(station)}
            className={`px-4 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeStation === station
                ? 'bg-[#C3A27C] text-slate-950'
                : 'bg-transparent text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-500'
            }`}
          >
            {station}
          </button>
        ))}
      </div>

      {/* 2. GRID OF KITCHEN TICKETS (Full Height, No Second Subheader Line!) */}
      <div className="p-3 flex-1 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 min-h-full">
          {visibleTickets.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-black border border-neutral-800 rounded-none space-y-3 my-auto">
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

                    {/* Sharp High-Contrast Monochrome Items List */}
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

      {/* Global Staff Right Navigation Drawer */}
      <StaffNavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
      />
    </div>
  );
}
