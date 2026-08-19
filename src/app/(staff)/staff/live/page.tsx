'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ReceiptPreviewModal, BillData } from '@/components/pos/ReceiptPreviewModal';
import { useCafeConfig } from '@/hooks/useCafeConfig';

interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
}

interface LiveOrder {
  id: string;
  tableNumber: string;
  items?: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  createdAt?: string;
  notes?: string;
}

export default function StaffLiveOrdersPage() {
  const { config } = useCafeConfig();
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [selectedBillData, setSelectedBillData] = useState<BillData | null>(null);

  const fetchOrders = () => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.orders) setOrders(d.orders);
      })
      .catch((err) => {
        console.error('Failed to fetch live orders:', err);
      });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTableLabel = (num?: string) => {
    if (!num) return 'T1';
    if (num.toUpperCase() === 'PICKUP' || num.toUpperCase() === 'PICK UP') return '🛍️ Pick Up';
    if (num.toUpperCase() === 'POS' || num.toUpperCase() === 'DIRECT') return '⚡ POS Direct';
    const clean = num.replace(/^table\s*/i, '').trim();
    return clean.startsWith('T') ? clean : `Table ${clean}`;
  };

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: nextStatus }),
    });
    fetchOrders();
  };

  const handleOpenBill = (ord: LiveOrder) => {
    const formatted: BillData = {
      billId: `MHMMC${ord.id.slice(-5).padStart(5, '0')}`,
      orderId: ord.id,
      tokenNumber: '01',
      restaurantName: config?.cafeName || 'ChatChaska Cafe',
      gstin: config?.gstin || '27AABCM1234A1Z5',
      fssai: config?.fssai,
      address: config?.address || 'Shop #4, Main Street, Mumbai',
      date: new Date().toLocaleString(),
      tableNumber: formatTableLabel(ord.tableNumber),
      waiterName: 'Staff',
      items: (ord.items || []).map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.price ?? 0,
        lineTotal: (i.price ?? 0) * i.quantity,
      })),
      subtotal: ord.totalAmount,
      cgstAmount: Number((ord.totalAmount * 0.025).toFixed(2)),
      sgstAmount: Number((ord.totalAmount * 0.025).toFixed(2)),
      grandTotal: ord.totalAmount,
      paymentMode: 'CASH',
    };
    setSelectedBillData(formatted);
  };

  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending'), [orders]);
  const preparingOrders = useMemo(() => orders.filter((o) => o.status === 'preparing'), [orders]);
  const pendingBillOrders = useMemo(
    () => orders.filter((o) => o.status === 'ready' || o.status === 'served'),
    [orders]
  );

  return (
    <div className="p-4 w-full h-[calc(100vh-1rem)] flex flex-col space-y-3 select-none font-sans overflow-hidden">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 shrink-0">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[22px]">visibility</span>
            Live Orders Tracker
          </h1>
          <p className="text-xs text-slate-500 font-bold">Real-time table order progression across 3 active stages</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-slate-900 text-white font-extrabold text-xs px-3 py-1 rounded-md shadow-2xs">
            Total Active: {pendingOrders.length + preparingOrders.length + pendingBillOrders.length}
          </span>
        </div>
      </div>

      {/* 3 COLUMNS BOARD: FULL WIDTH & FULL HEIGHT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 h-full min-h-0">
        {/* COLUMN 1: PENDING ORDERS */}
        <div className="bg-amber-50/40 border border-amber-300 rounded-md p-3.5 flex flex-col space-y-3 shadow-2xs h-full min-h-0 flex-1">
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-300 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-black text-amber-950 text-xs uppercase tracking-wider">Pending</h2>
            </div>
            <span className="bg-slate-900 text-white text-xs font-black px-2 py-0.5 rounded-md">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto min-h-0 no-scrollbar pr-0.5">
            {pendingOrders.length === 0 ? (
              <div className="py-12 text-center text-amber-800/60 font-bold text-xs">
                No pending orders
              </div>
            ) : (
              pendingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white border border-amber-300 rounded-md p-3.5 space-y-3 shadow-2xs transition-all"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-black text-base text-slate-900">
                      {formatTableLabel(ord.tableNumber)}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-extrabold">#{ord.id.slice(-5)}</span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'preparing')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Approve KOT
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING ORDERS */}
        <div className="bg-blue-50/40 border border-blue-200 rounded-md p-3.5 flex flex-col space-y-3 shadow-2xs h-full min-h-0 flex-1">
          <div className="flex items-center justify-between pb-2.5 border-b border-blue-300 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="font-black text-blue-950 text-xs uppercase tracking-wider">Preparing</h2>
            </div>
            <span className="bg-slate-900 text-white text-xs font-black px-2 py-0.5 rounded-md">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto min-h-0 no-scrollbar pr-0.5">
            {preparingOrders.length === 0 ? (
              <div className="py-12 text-center text-blue-800/60 font-bold text-xs">
                No orders in kitchen
              </div>
            ) : (
              preparingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white border border-blue-200 rounded-md p-3.5 space-y-3 shadow-2xs transition-all"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-black text-base text-slate-900">
                      {formatTableLabel(ord.tableNumber)}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-extrabold">#{ord.id.slice(-5)}</span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'ready')}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Ready
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: PENDING BILL ORDERS */}
        <div className="bg-purple-50/40 border border-purple-300 rounded-md p-3.5 flex flex-col space-y-3 shadow-2xs h-full min-h-0 flex-1">
          <div className="flex items-center justify-between pb-2.5 border-b border-purple-300 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <h2 className="font-black text-purple-950 text-xs uppercase tracking-wider">Pending Bill</h2>
            </div>
            <span className="bg-slate-900 text-white text-xs font-black px-2 py-0.5 rounded-md">
              {pendingBillOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto min-h-0 no-scrollbar pr-0.5">
            {pendingBillOrders.length === 0 ? (
              <div className="py-12 text-center text-purple-800/60 font-bold text-xs">
                No pending bills
              </div>
            ) : (
              pendingBillOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => handleOpenBill(ord)}
                  className="bg-white border border-purple-200 hover:border-purple-400 rounded-md p-3.5 space-y-3 shadow-2xs transition-all cursor-pointer group"
                  title="Click Settle Bill to view receipt and finish payment"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {formatTableLabel(ord.tableNumber)}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-extrabold">#{ord.id.slice(-5)}</span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBill(ord);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      Settle Bill
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bill View Modal */}
      {selectedBillData && (
        <ReceiptPreviewModal
          isOpen={Boolean(selectedBillData)}
          onClose={() => setSelectedBillData(null)}
          billData={selectedBillData}
          hideGoBack={true}
          hideWhatsApp={true}
        />
      )}
    </div>
  );
}
