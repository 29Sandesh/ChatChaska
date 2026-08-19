'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OrderPayload } from '@/app/api/orders/route';
import { formatCurrency } from '@/lib/utils';

type FilterTab = 'all' | 'pending' | 'preparing' | 'ready' | 'served';

export default function TableOrdersPage() {
  const [orders, setOrders] = useState<OrderPayload[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [now, setNow] = useState<number>(Date.now());

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        // Filter to only orders that have a table number
        setOrders(data.orders.filter((o: OrderPayload) => o.tableNumber && o.tableNumber.toLowerCase() !== 'takeaway'));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    const clockTimer = setInterval(() => setNow(Date.now()), 10000);
    return () => {
      clearInterval(interval);
      clearInterval(clockTimer);
    };
  }, [fetchOrders]);

  const updateStatus = async (id: string, newStatus: OrderPayload['status']) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const activeOrdersCount = orders.filter(o => o.status !== 'served' && o.status !== 'cancelled').length;

  const renderOrderCard = (order: OrderPayload) => {
    const orderTime = order.id?.startsWith('ord-') ? parseInt(order.id.replace('ord-', '')) || now : now;
    const elapsedMins = Math.max(0, Math.floor((now - orderTime) / 60000));
    const isDelayed = elapsedMins > 15 && (order.status === 'pending' || order.status === 'preparing');

    const statusColors = {
      pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      preparing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      ready: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      served: 'bg-surface-container-high text-on-surface-variant border-outline-variant/30',
      cancelled: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    };

    const statusLabels = {
      pending: 'Pending KOT',
      preparing: 'Preparing',
      ready: 'Ready',
      served: 'Served',
      cancelled: 'Cancelled',
    };

    const displayItems = order.items.slice(0, 5);
    const hiddenItemsCount = Math.max(0, order.items.length - 5);

    return (
      <div
        key={order.id}
        className={`p-5 bg-surface rounded-2xl border transition-all shadow-xs flex flex-col justify-between space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          isDelayed
            ? 'border-rose-500/80 bg-rose-500/5 shadow-rose-500/10 shadow-lg'
            : 'border-outline-variant/30 hover:border-outline/60'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-outline-variant/20 mb-4">
            <div>
              <h3 className="font-headline-sm text-xl font-black text-on-surface">
                {order.tableNumber}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-outline mt-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">person</span>
                <span>Waiter: Staff</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">
                Main Hall
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors[order.status || 'pending']}`}>
                {statusLabels[order.status || 'pending']}
              </span>
            </div>
          </div>

          {/* Time & Warning */}
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
              <span className={isDelayed ? 'text-rose-500 font-bold animate-pulse' : 'text-outline font-medium'}>
                {elapsedMins === 0 ? 'Just now' : `${elapsedMins} min ago`}
              </span>
            </div>
            {isDelayed && (
              <div className="flex items-center gap-1 text-rose-500 font-bold text-xs bg-rose-500/10 px-2 py-1 rounded-md">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Delayed</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-2.5 mb-4">
            {displayItems.map((item, i) => (
              <div key={i} className="flex items-start justify-between text-sm">
                <div className="flex items-start gap-2.5 text-on-surface">
                  <span className="font-black text-primary bg-primary/10 px-1.5 rounded">{item.quantity}x</span>
                  <span className="font-semibold line-clamp-1">{item.name}</span>
                </div>
              </div>
            ))}
            {hiddenItemsCount > 0 && (
              <div className="text-xs text-outline font-semibold italic pt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">more_horiz</span>
                {hiddenItemsCount} more item{hiddenItemsCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20 mt-4">
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wide">Running Bill</span>
            <span className="text-xl font-black text-on-surface">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link href={`/pos?table=${encodeURIComponent(order.tableNumber)}`} className="col-span-1">
            <Button variant="secondary" fullWidth className="text-sm py-2.5 h-full">
              <span className="material-symbols-outlined text-[18px] mr-1">point_of_sale</span>
              POS
            </Button>
          </Link>
          
          <div className="col-span-1">
            {order.status === 'pending' && (
              <Button
                variant="primary"
                fullWidth
                className="text-sm py-2.5 bg-amber-500 hover:bg-amber-600 border-none font-bold"
                onClick={() => updateStatus(order.id!, 'preparing')}
              >
                Send KOT
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button
                variant="primary"
                fullWidth
                className="text-sm py-2.5 bg-blue-600 hover:bg-blue-700 border-none font-bold"
                onClick={() => updateStatus(order.id!, 'ready')}
              >
                Mark Ready
              </Button>
            )}
            {order.status === 'ready' && (
              <Button
                variant="primary"
                fullWidth
                className="text-sm py-2.5 bg-emerald-600 hover:bg-emerald-700 border-none font-bold"
                onClick={() => updateStatus(order.id!, 'served')}
              >
                Mark Served
              </Button>
            )}
            {(!order.status || order.status === 'served' || order.status === 'cancelled') && (
              <Button
                variant="secondary"
                fullWidth
                disabled
                className="text-sm py-2.5 opacity-50 cursor-not-allowed h-full"
              >
                {order.status === 'cancelled' ? 'Cancelled' : 'Served'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <TopBar
        title="Table Orders"
        actions={
          <div className="flex items-center gap-3">
            {activeOrdersCount > 0 && (
              <Badge variant="neutral" icon="restaurant" className="animate-pulse bg-primary/20 text-primary border border-primary/30">
                {activeOrdersCount} Active Table{activeOrdersCount !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button icon="refresh" variant="secondary" className="text-sm" onClick={fetchOrders}>
              Refresh
            </Button>
          </div>
        }
      />

      <div className="p-6 flex-1 space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 p-1.5 bg-surface-container-high rounded-xl text-sm font-bold overflow-x-auto max-w-full md:max-w-max no-scrollbar">
          {(['all', 'pending', 'preparing', 'ready', 'served'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2.5 rounded-lg whitespace-nowrap transition-all ${
                filter === tab
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab === 'all' ? 'All Tables' : 
               tab === 'pending' ? 'Pending KOT' :
               tab === 'preparing' ? 'Preparing' :
               tab === 'ready' ? 'Ready for Pickup' : 'Served'}
            </button>
          ))}
        </div>

        {/* Grid Content */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map(renderOrderCard)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
            <span className="material-symbols-outlined text-7xl mb-4 text-outline">table_restaurant</span>
            <h3 className="text-2xl font-bold text-on-surface mb-2">No active table orders right now</h3>
            <p className="text-outline text-lg">When tables place orders, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
