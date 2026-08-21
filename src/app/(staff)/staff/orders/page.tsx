'use client';

import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatBillCurrency } from '@/lib/billing';
import { ReceiptPreviewModal, BillData } from '@/components/pos/ReceiptPreviewModal';
import { PaymentSettlementModal } from '@/components/pos/PaymentSettlementModal';
import { StaffNavigationDrawer } from '@/components/layout/StaffNavigationDrawer';
import { useCafeConfig } from '@/hooks/useCafeConfig';
import { EmptyState } from '@/components/ui/EmptyState';

interface QROrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
}

interface QROrder {
  id: string;
  tableNumber: string;
  items: QROrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt?: string;
  customerName?: string;
  notes?: string;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialFilterParam = searchParams.get('filter');

  const { config } = useCafeConfig();
  const [orders, setOrders] = useState<QROrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TABLE_QR' | 'PENDING' | 'KITCHEN' | 'COMPLETED'>(
    initialFilterParam === 'table' ? 'TABLE_QR' : 'ALL'
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Order Rejection Modal State
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Item Out of Stock');

  // Receipt Preview Modal State
  const [previewBillData, setPreviewBillData] = useState<BillData | null>(null);
  
  // Payment Settlement State
  const [settlingOrder, setSettlingOrder] = useState<QROrder | null>(null);

  const prevPendingCountRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatchaska_sound_enabled');
    if (saved === 'true') {
      setSoundEnabled(true);
    }
  }, []);

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('chatchaska_sound_enabled', newVal.toString());
  };

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchQROrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch table QR orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQROrders();
    const interval = setInterval(fetchQROrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = useMemo(() => orders.filter((o) => o.status === 'pending').length, [orders]);

  useEffect(() => {
    if (prevPendingCountRef.current !== null && pendingCount > prevPendingCountRef.current) {
      if (soundEnabled) {
        playChime();
      }
    }
    prevPendingCountRef.current = pendingCount;
  }, [pendingCount, soundEnabled]);

  const handleUpdateStatus = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus, rejectionReason: notes }),
      });

      if (res.ok) {
        showToast(
          newStatus === 'preparing'
            ? 'Order approved & sent to kitchen'
            : newStatus === 'cancelled'
            ? `Order rejected: "${notes || 'Cancelled'}"`
            : `Status updated to ${newStatus}`
        );
        fetchQROrders();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleInitiateReject = (orderId: string) => {
    setRejectingOrderId(orderId);
    setRejectionReason('Item Out of Stock');
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrderId) return;
    await handleUpdateStatus(rejectingOrderId, 'cancelled', rejectionReason);
    setRejectingOrderId(null);
  };

  const handleInitiateBill = (order: QROrder) => {
    setSettlingOrder(order);
  };

  const handlePaymentConfirmed = async (details: {
    paymentMethod: 'cash' | 'upi' | 'card';
    customerName: string;
    customerPhone: string;
    txnReference?: string;
    isPayLater?: boolean;
  }) => {
    if (!settlingOrder) return;
    const order = settlingOrder;
    setSettlingOrder(null);

    const subtotal = order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const gstRate = 5;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const cgstAmount = Number((gstAmount / 2).toFixed(2));
    const sgstAmount = Number((gstAmount / 2).toFixed(2));
    const grandTotal = subtotal + gstAmount;

    const billPayload = {
      orderId: order.id,
      restaurantId: (config as any)?.restaurantId || 'demo',
      restaurantName: config.cafeName || 'ChatChaska Cafe',
      tableNumber: order.tableNumber || 'Table 1',
      waiterName: 'Staff',
      customerName: details.customerName,
      customerPhone: details.customerPhone,
      items: order.items.map((i) => ({
        id: i.id || (i.name || 'dish').toLowerCase().replace(/\s+/g, '-'),
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.price,
        lineTotal: i.price * i.quantity,
        veg: true,
      })),
      subtotal,
      gstPercent: gstRate,
      cgstAmount,
      sgstAmount,
      gstAmount,
      discountAmount: 0,
      grandTotal,
      paymentMode: details.paymentMethod,
      status: details.isPayLater ? 'open' : 'paid',
    };

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billPayload),
      });

      if (res.ok) {
        const data = await res.json();
        const savedBill = data.bill;

        // Auto mark order completed
        await handleUpdateStatus(order.id, 'completed');

        const newBillData: BillData = {
          billId: savedBill?.id || `BILL-${order.id.slice(-4)}`,
          orderId: order.id,
          tokenNumber: savedBill?.tokenNumber || '01',
          restaurantName: config.cafeName || 'ChatChaska Cafe',
          address: config.address || 'Shop #4, Main Street, Mumbai',
          fssai: config.fssai || '10019022009876',
          gstin: config.gstin || '27AABCM1234A1Z5',
          date: new Date().toLocaleString('en-IN'),
          tableNumber: order.tableNumber,
          waiterName: 'Staff',
          items: billPayload.items,
          subtotal,
          discountAmount: 0,
          cgstRate: 2.5,
          sgstRate: 2.5,
          cgstAmount,
          sgstAmount,
          roundOff: 0,
          grandTotal,
          paymentMode: details.paymentMethod.toUpperCase(),
          customerName: details.customerName,
          customerPhone: details.customerPhone,
        };

        setPreviewBillData(newBillData);
        showToast('🎉 Bill settled & saved successfully!');
      } else {
        showToast('Failed to save bill. Please retry.');
      }
    } catch (err) {
      console.error('Error saving bill:', err);
      showToast('Network error while saving bill.');
    }
  };

  // Filter orders based on active filter:
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const isDone = order.status === 'completed';
      const isCancelled = order.status === 'cancelled';

      if (activeFilter === 'COMPLETED') {
        return isDone;
      }

      // Hide completed/cancelled orders from the live active queues
      if (isDone || isCancelled) {
        return false;
      }

      if (activeFilter === 'TABLE_QR') {
        return Boolean(order.tableNumber);
      }
      if (activeFilter === 'PENDING') return order.status === 'pending';
      if (activeFilter === 'KITCHEN') return order.status === 'preparing' || order.status === 'ready';
      return true;
    });
  }, [orders, activeFilter]);

  const activeOrdersCount = useMemo(() => orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length, [orders]);
  const tableQrCount = useMemo(() => orders.filter((o) => Boolean(o.tableNumber) && o.status !== 'completed' && o.status !== 'cancelled').length, [orders]);
  const kitchenCount = useMemo(() => orders.filter((o) => o.status === 'preparing' || o.status === 'ready').length, [orders]);
  const completedCount = useMemo(() => orders.filter((o) => o.status === 'completed').length, [orders]);

  return (
    <div className="flex-1 flex flex-col h-full w-full select-none font-sans bg-slate-50 overflow-hidden">
      {/* 1. TOP HEADER: LOGO ON LEFT | FILTERS IN CENTER | [ POS ] + [ ☰ ] ON RIGHT */}
      <header className="h-16 bg-white border-b border-[#EBEBEB] px-5 flex items-center justify-between gap-4 shrink-0 select-none shadow-2xs z-30 sticky top-0">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/staff/pos" className="flex items-center">
            <img
              src="/chatchaska-logo.png"
              alt="ChatChaska"
              className="h-8 w-auto max-w-[160px] object-contain drop-shadow-2xs"
            />
          </Link>
        </div>

        {/* Center: The 5 Filter Buttons (Placed right in the header bar!) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* All Active Orders Filter */}
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-md border text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeFilter === 'ALL'
                ? 'bg-black text-white border-black'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>All</span>
            <span className={`px-2 py-0.5 rounded-sm text-xs font-black ${activeFilter === 'ALL' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
              {activeOrdersCount}
            </span>
          </button>

          {/* Table QR Orders Filter (#C3A27C Beige) */}
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'TABLE_QR' ? 'ALL' : 'TABLE_QR')}
            className={`px-3 py-1.5 rounded-md border text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeFilter === 'TABLE_QR'
                ? 'bg-[#C3A27C] text-slate-950 border-[#B2906A]'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-[#FAF7F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
            <span>Table QR</span>
            <span className={`px-2 py-0.5 rounded-sm text-xs font-black ${activeFilter === 'TABLE_QR' ? 'bg-white text-slate-950' : 'bg-[#C3A27C] text-slate-950'}`}>
              {tableQrCount}
            </span>
          </button>

          {/* Pending Filter */}
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'PENDING' ? 'ALL' : 'PENDING')}
            className={`px-3 py-1.5 rounded-md border text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeFilter === 'PENDING'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>Pending</span>
            <span className={`px-2 py-0.5 rounded-sm text-xs font-black ${activeFilter === 'PENDING' ? 'bg-white text-amber-700' : 'bg-slate-900 text-white'}`}>
              {pendingCount}
            </span>
          </button>

          {/* Kitchen Filter */}
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'KITCHEN' ? 'ALL' : 'KITCHEN')}
            className={`px-3 py-1.5 rounded-md border text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeFilter === 'KITCHEN'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>Kitchen</span>
            <span className={`px-2 py-0.5 rounded-sm text-xs font-black ${activeFilter === 'KITCHEN' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
              {kitchenCount}
            </span>
          </button>

          {/* Done Filter */}
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
            className={`px-3 py-1.5 rounded-md border text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>Done</span>
            <span className={`px-2 py-0.5 rounded-sm text-xs font-black ${activeFilter === 'COMPLETED' ? 'bg-white text-emerald-700' : 'bg-slate-900 text-white'}`}>
              {completedCount}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`px-2 py-1.5 ml-2 rounded-md border text-xs font-black transition-all cursor-pointer flex items-center shadow-2xs ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
            }`}
            title={soundEnabled ? 'Mute new order chime' : 'Enable new order chime'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
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
            className="w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-900 transition-all cursor-pointer border border-slate-200"
            title="Navigation Menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN ORDERS GRID CONTENT: FULL WIDTH EDGE-TO-EDGE & 4 CARDS PER ROW */}
      <div className="flex-1 overflow-y-auto p-4 w-full no-scrollbar space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-md p-12 text-center text-slate-400 text-xs font-bold">
            Loading table QR orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-xs">
            <EmptyState
              icon="receipt_long"
              title="No Orders in this Queue"
              description="Incoming dining table QR orders and POS counter tickets will appear here for preparation and billing."
              actionLabel="Open POS Terminal"
              actionHref="/staff/pos"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 w-full">
            {filteredOrders.map((order) => {
              const isPending = order.status === 'pending';
              const isKitchen = order.status === 'preparing' || order.status === 'ready';
              const isCompleted = order.status === 'completed';
              const isCancelled = order.status === 'cancelled';

              return (
                <div
                  key={order.id}
                  className={`bg-white border rounded-md p-4 flex flex-col justify-between space-y-3 transition-all ${
                    isPending
                      ? 'border-2 border-amber-400 bg-amber-50/40 shadow-xs'
                      : isCompleted
                      ? 'border border-emerald-300 bg-emerald-50/30 shadow-2xs'
                      : isCancelled
                      ? 'border border-rose-200 bg-rose-50/30 opacity-75'
                      : 'border border-slate-300 bg-white shadow-2xs'
                  }`}
                >
                  {/* Card Top Row */}
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 h-7 font-black text-xs rounded-sm shadow-2xs inline-flex items-center justify-center min-w-[28px] ${
                          isPending
                            ? 'bg-amber-500 text-white'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCancelled
                            ? 'bg-rose-500 text-white'
                            : 'bg-black text-white'
                        }`}
                      >
                        {(() => {
                          const raw = order.tableNumber || '';
                          if (raw.toLowerCase().includes('pickup') || raw.toLowerCase().includes('takeaway')) return 'Takeaway';
                          const digits = raw.replace(/\D/g, '');
                          return digits ? digits : raw || '1';
                        })()}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] font-bold">
                        #{order.id.slice(-5)}
                      </span>
                      {isPending && (
                        <span className="relative flex h-2 w-2 ml-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Payment Indicator: Payment Pending vs Payment Done */}
                      {isCompleted || (order.notes && order.notes.includes('Paid via')) ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-sm inline-flex items-center gap-1 h-6">
                          <span className="material-symbols-outlined text-[13px] text-emerald-700">payments</span>
                          <span>Payment Done</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-sm inline-flex items-center gap-1 h-6">
                          <span className="material-symbols-outlined text-[13px] text-amber-700">payments</span>
                          <span>Payment Pending</span>
                        </span>
                      )}

                      {/* Kitchen / Order Status */}
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-sm h-6 inline-flex items-center justify-center ${
                          isPending
                            ? 'bg-amber-500 text-white animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCancelled
                            ? 'bg-rose-500 text-white'
                            : 'bg-black text-white'
                        }`}
                      >
                        {order.status === 'preparing' ? 'Kitchen' : order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 text-xs flex-1">
                    <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <span>ITEMS ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
                    </div>
                    <ul className="space-y-1 font-medium text-slate-800">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span className="truncate pr-2">
                            • {item.name} <strong className="text-black font-bold">x{item.quantity}</strong>
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Customer Cooking Note (Only shown for actual custom requests, not auto-payment messages) */}
                    {order.notes &&
                      !order.notes.startsWith('Paid via') &&
                      !order.notes.startsWith('Pay Later') &&
                      order.notes.trim().length > 0 && (
                        <p className="text-[11px] text-slate-700 bg-slate-100 p-2 rounded-md border border-slate-200 mt-2 font-medium">
                          📝 {order.notes}
                        </p>
                      )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleInitiateBill(order)}
                      className="flex-1 py-2 bg-white hover:bg-[#FAF7F2] text-slate-900 font-bold text-xs rounded-md border border-[#C3A27C]/50 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px] text-slate-800">
                        receipt_long
                      </span>
                      <span>Bill</span>
                    </button>

                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          className="flex-1 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-md transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          Accept & Cook
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInitiateReject(order.id)}
                          className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-md border border-rose-200 transition-all cursor-pointer"
                          title="Reject Order"
                        >
                          ✕
                        </button>
                      </>
                    )}

                    {isKitchen && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="flex-1 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-md transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global Staff Right Navigation Drawer */}
      <StaffNavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
      />

      {/* Receipt Preview Modal */}
      {previewBillData && (
        <ReceiptPreviewModal
          isOpen={Boolean(previewBillData)}
          onClose={() => setPreviewBillData(null)}
          billData={previewBillData}
          hideGoBack={true}
        />
      )}

      {/* Payment Settlement Modal */}
      {settlingOrder && (
        <PaymentSettlementModal
          isOpen={Boolean(settlingOrder)}
          onClose={() => setSettlingOrder(null)}
          grandTotal={
            settlingOrder.items.reduce((s, i) => s + i.price * i.quantity, 0) +
            Math.round((settlingOrder.items.reduce((s, i) => s + i.price * i.quantity, 0) * 5) / 100)
          }
          tableNumber={settlingOrder.tableNumber || 'Table 1'}
          itemCount={settlingOrder.items.reduce((s, i) => s + i.quantity, 0)}
          onConfirm={handlePaymentConfirmed}
        />
      )}

      {/* Reject Reason Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white border border-slate-200 rounded-md p-5 max-w-sm w-full shadow-2xl space-y-4 font-sans">
            <h3 className="font-bold text-slate-900 text-sm">Select Rejection Reason</h3>
            <div className="space-y-2">
              {[
                'Item Out of Stock',
                'Kitchen Overloaded / Too Busy',
                'Closing Time / Kitchen Closed',
                'Duplicate Order',
                'Customer Requested Cancellation',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
                    rejectionReason === reason
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                    className="accent-rose-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="flex-1 py-2 rounded-md border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-md shadow-xl text-xs font-bold z-50 animate-in fade-in border border-slate-700">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

export default function TableQROrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-700 font-bold text-sm">Loading Orders Queue...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
