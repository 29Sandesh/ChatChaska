'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { formatBillCurrency } from '@/lib/billing';
import { ReceiptPreviewModal, BillData } from '@/components/pos/ReceiptPreviewModal';
import { PaymentSettlementModal } from '@/components/pos/PaymentSettlementModal';
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

export default function TableQROrdersPage() {
  const { config } = useCafeConfig();
  const [orders, setOrders] = useState<QROrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'KITCHEN' | 'COMPLETED'>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Order Rejection Modal State
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Item Out of Stock');

  // Receipt Preview Modal State
  const [previewBillData, setPreviewBillData] = useState<BillData | null>(null);
  
  // Payment Settlement State
  const [settlingOrder, setSettlingOrder] = useState<QROrder | null>(null);

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

  const handleGenerateBillClick = (order: QROrder) => {
    setSettlingOrder(order);
  };

  const handleConfirmPayment = async (details: {
    paymentMethod: 'cash' | 'upi' | 'card';
    customerName: string;
    customerPhone: string;
    txnReference?: string;
  }) => {
    if (!settlingOrder) return;
    
    const order = settlingOrder;
    const subtotal = (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gstPercent = 5;
    const taxable = subtotal;
    const gstAmount = Math.round((taxable * gstPercent) / 100);
    const cgstAmount = Number((gstAmount / 2).toFixed(2));
    const sgstAmount = Number((gstAmount / 2).toFixed(2));
    const grandTotal = Math.round(taxable + gstAmount);

    const billPayload = {
      orderId: order.id,
      restaurantId: 'demo',
      restaurantName: config?.cafeName || 'ChatChaska Cafe',
      tableNumber: order.tableNumber,
      waiterName: 'Staff',
      items: (order.items || []).map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.price,
        lineTotal: i.price * i.quantity,
      })),
      subtotal,
      gstPercent,
      cgstAmount,
      sgstAmount,
      gstAmount,
      discountAmount: 0,
      grandTotal,
      paymentMode: details.paymentMethod,
      customerName: details.customerName,
      customerPhone: details.customerPhone,
      status: 'paid',
    };

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billPayload),
      });

      const data = await res.json();
      const createdBill = data.bill || data;
      setSettlingOrder(null);

      setPreviewBillData({
        billId: createdBill.id || `MHMMC0000${Math.floor(Math.random() * 90) + 10}`,
        tokenNumber: createdBill.tokenNumber || '01',
        restaurantName: config?.cafeName || 'ChatChaska Cafe',
        gstin: config?.gstin || '27AABCM1234A1Z5',
        fssai: config?.fssai,
        address: config?.address,
        date: new Date().toLocaleString(),
        tableNumber: order.tableNumber,
        waiterName: 'Staff',
        items: billPayload.items,
        subtotal,
        cgstRate: 2.5,
        sgstRate: 2.5,
        cgstAmount,
        sgstAmount,
        grandTotal,
        paymentMode: details.paymentMethod.toUpperCase(),
      });
    } catch (err) {
      console.error('Failed to generate bill:', err);
    }
  };

  const formatTableLabel = (num: string) => {
    if (!num) return 'T1';
    if (num.toUpperCase() === 'PICKUP' || num.toUpperCase() === 'PICK UP') return '🛍️ Pick Up';
    if (num.toUpperCase() === 'POS' || num.toUpperCase() === 'DIRECT') return '⚡ POS Direct';
    const clean = num.replace(/^table\s*/i, '').trim();
    return clean.startsWith('T') ? clean : `Table ${clean}`;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeFilter === 'PENDING') return o.status === 'pending';
      if (activeFilter === 'KITCHEN') return o.status === 'preparing' || o.status === 'ready';
      if (activeFilter === 'COMPLETED') return o.status === 'completed';
      return true;
    });
  }, [orders, activeFilter]);

  const pendingCount = useMemo(() => orders.filter((o) => o.status === 'pending').length, [orders]);
  const kitchenCount = useMemo(() => orders.filter((o) => o.status === 'preparing' || o.status === 'ready').length, [orders]);
  const completedCount = useMemo(() => orders.filter((o) => o.status === 'completed').length, [orders]);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4 select-none font-sans">
      {/* TOP HEADER: TITLE ON LEFT | 4 FILTER BUTTONS ON RIGHT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200">
        <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-[20px]">receipt_long</span>
          Orders
        </h1>

        {/* 4 STATUS FILTERS: ALL | PENDING | KITCHEN | DONE (DARK BADGES WITH WHITE TEXT) */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* All Filter */}
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-md border text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeFilter === 'ALL'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>All</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${activeFilter === 'ALL' ? 'bg-white text-blue-700' : 'bg-slate-900 text-white'}`}>
              {orders.length}
            </span>
          </button>

          {/* Pending Filter */}
          <button
            onClick={() => setActiveFilter(activeFilter === 'PENDING' ? 'ALL' : 'PENDING')}
            className={`px-3 py-1.5 rounded-md border text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeFilter === 'PENDING'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>Pending</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${activeFilter === 'PENDING' ? 'bg-white text-amber-700' : 'bg-slate-900 text-white'}`}>
              {pendingCount}
            </span>
          </button>

          {/* Kitchen Filter */}
          <button
            onClick={() => setActiveFilter(activeFilter === 'KITCHEN' ? 'ALL' : 'KITCHEN')}
            className={`px-3 py-1.5 rounded-md border text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeFilter === 'KITCHEN'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>Kitchen</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${activeFilter === 'KITCHEN' ? 'bg-white text-blue-700' : 'bg-slate-900 text-white'}`}>
              {kitchenCount}
            </span>
          </button>

          {/* Done Filter */}
          <button
            onClick={() => setActiveFilter(activeFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
            className={`px-3 py-1.5 rounded-md border text-xs font-black transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
              activeFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>Done</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-black ${activeFilter === 'COMPLETED' ? 'bg-white text-emerald-700' : 'bg-slate-900 text-white'}`}>
              {completedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs font-bold">
          Loading table QR orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <EmptyState
            icon="receipt_long"
            title="No Orders in this Queue"
            description="Incoming dining table QR orders and POS counter tickets will appear here for preparation and billing."
            actionLabel="Open POS Terminal"
            actionHref="/staff/pos"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'pending';
            const isKitchen = order.status === 'preparing' || order.status === 'ready';
            const isCompleted = order.status === 'completed';
            const isCancelled = order.status === 'cancelled';

            return (
              <div
                key={order.id}
                className={`bg-white border rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all ${
                  isPending
                    ? 'border-2 border-amber-400 bg-amber-50/40 shadow-xs'
                    : isCompleted
                    ? 'border border-emerald-300 bg-emerald-50/30 shadow-2xs'
                    : isCancelled
                    ? 'border border-rose-200 bg-rose-50/30 opacity-75'
                    : 'border border-blue-200 bg-white shadow-2xs'
                }`}
              >
                {/* Card Top Row - Uniform Badge Sizing & Aligned Layout */}
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 h-7 font-black text-xs rounded-md shadow-2xs inline-flex items-center justify-center ${
                        isPending
                          ? 'bg-amber-500 text-white'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCancelled
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {formatTableLabel(order.tableNumber)}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-bold">#{order.id.slice(-5)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Pre-Paid vs Pay at Counter Indicator */}
                    {order.tableNumber.toUpperCase().includes('POS') || order.tableNumber.toUpperCase().includes('PICK') ? (
                      <span className="px-2.5 py-1 h-7 bg-emerald-100 text-emerald-900 text-xs font-black rounded-md border border-emerald-300 inline-flex items-center justify-center">
                        ✓ Paid
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 h-7 bg-amber-100 text-amber-900 text-xs font-black rounded-md border border-amber-300 inline-flex items-center justify-center">
                        ⏳ Post-Pay
                      </span>
                    )}

                    {/* Status Tag (Matching Top Bar Labels) */}
                    <span
                      className={`px-2.5 py-1 h-7 rounded-md text-xs font-black tracking-tight inline-flex items-center justify-center ${
                        isPending
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : isKitchen
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : isCancelled
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-emerald-600 text-white shadow-2xs'
                      }`}
                    >
                      {isPending ? 'Pending' : isKitchen ? 'Kitchen' : isCancelled ? 'Rejected' : 'Done'}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-1 flex-1 py-1 max-h-[170px] overflow-y-auto no-scrollbar border border-slate-100 bg-slate-50/60 p-2.5 rounded-md">
                  <div className="text-[11px] font-extrabold text-slate-400 mb-1">
                    ITEMS ({(order.items || []).length})
                  </div>
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="text-xs font-bold text-slate-800 border-b border-slate-200/40 pb-1 last:border-none">
                      • {item.name} <span className="text-blue-600 font-extrabold ml-1">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Rejection Reason Display if Cancelled */}
                {isCancelled && order.notes && (
                  <div className="bg-rose-100/70 border border-rose-200 text-rose-800 p-2 rounded-md text-xs font-bold">
                    Reason: {order.notes}
                  </div>
                )}

                {/* Card Bottom Actions - Clean Bill Button */}
                <div className="pt-2 border-t border-slate-200">
                  {isPending && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateBillClick(order)}
                        className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs rounded-md border border-slate-300 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                        title="View Bill Details & Reject Option"
                      >
                        <span className="material-symbols-outlined text-[16px] text-blue-600">receipt_long</span>
                        Bill
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                      >
                        Approve & Send KOT
                      </button>
                    </div>
                  )}

                  {isKitchen && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateBillClick(order)}
                        className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs rounded-md border border-slate-300 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px] text-blue-600">receipt_long</span>
                        Bill
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}

                  {/* Completed Order Action: Bill Button */}
                  {isCompleted && (
                    <button
                      onClick={() => handleGenerateBillClick(order)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-md shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      Generate Bill
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Rejection Reason Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Reason for Rejection</h3>
              <button
                onClick={() => setRejectingOrderId(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-bold">Select or type rejection reason:</p>
              
              {[
                'Item Out of Stock',
                'Kitchen Too Busy / Delay',
                'Customer Cancelled Request',
                'Invalid Table Number',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setRejectionReason(reason)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    rejectionReason === reason
                      ? 'bg-rose-50 border-rose-400 text-rose-700 font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {reason}
                </button>
              ))}

              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Or type custom reason..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectingOrderId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal for Generated Bill */}
      {previewBillData && (
        <div className="relative z-50">
          <ReceiptPreviewModal
            isOpen={Boolean(previewBillData)}
            onClose={() => setPreviewBillData(null)}
            billData={previewBillData}
          />
          {/* Floating Reject Order Button inside Bill View */}
          <div className="fixed bottom-6 right-6 z-[60]">
            <button
              onClick={() => {
                const matchedOrder = orders.find(o => o.tableNumber === previewBillData.tableNumber || o.id === previewBillData.orderId);
                if (matchedOrder) {
                  handleInitiateReject(matchedOrder.id);
                  setPreviewBillData(null);
                } else {
                  setPreviewBillData(null);
                }
              }}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-md shadow-xl transition-all cursor-pointer flex items-center gap-1.5 border border-rose-500"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              Reject Order
            </button>
          </div>
        </div>
      )}

      {/* Payment Settlement Modal */}
      {settlingOrder && (
        <PaymentSettlementModal
          isOpen={true}
          onClose={() => setSettlingOrder(null)}
          grandTotal={Math.round(
            (settlingOrder.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.05
          )}
          tableNumber={settlingOrder.tableNumber}
          itemCount={(settlingOrder.items || []).reduce((sum, item) => sum + item.quantity, 0)}
          merchantUpiId={config?.upiId}
          onConfirm={handleConfirmPayment}
        />
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-xl z-50 animate-in fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
