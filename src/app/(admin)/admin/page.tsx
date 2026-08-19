'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bill } from '@/types';
import { ReceiptPreviewModal, BillData } from '@/components/pos/ReceiptPreviewModal';
import { useCafeConfig } from '@/hooks/useCafeConfig';

interface DashboardMetrics {
  totalBills: number;
  grossSales: number;
  totalDiscounts: number;
  totalTax: number;
  netRevenue: number;
  avgTicket: number;
}

interface PaymentItem {
  payment_mode: string;
  count: number;
  amount: number;
}

interface ItemSale {
  name: string;
  qty: number;
  revenue: number;
}

export default function OwnerDashboardPage() {
  const { config } = useCafeConfig();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalBills: 0,
    grossSales: 0,
    totalDiscounts: 0,
    totalTax: 0,
    netRevenue: 0,
    avgTicket: 0,
  });

  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentItem[]>([]);
  const [topItems, setTopItems] = useState<ItemSale[]>([]);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [selectedBillData, setSelectedBillData] = useState<BillData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [tableStats, setTableStats] = useState<{ occupied: number; total: number }>({ occupied: 0, total: 0 });
  const [setupCompleted, setSetupCompleted] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [repRes, billsRes, tablesRes, settingRes] = await Promise.all([
          fetch('/api/reports?timeframe=today'),
          fetch('/api/bills'),
          fetch('/api/tables'),
          fetch('/api/settings?key=setup_completed'),
        ]);

        const repData = await repRes.json();
        const billsData = await billsRes.json();
        const tablesData = await tablesRes.json();
        const settingData = await settingRes.json();

        if (repData.summary) setMetrics(repData.summary);
        if (repData.paymentBreakdown) setPaymentBreakdown(repData.paymentBreakdown);
        if (repData.itemSales) setTopItems(repData.itemSales.slice(0, 5));
        if (billsData.bills) setRecentBills(billsData.bills.slice(0, 6));

        if (tablesData.tables && Array.isArray(tablesData.tables)) {
          const total = tablesData.tables.length;
          const occupied = tablesData.tables.filter((t: any) => t.status === 'occupied' || t.status === 'running').length;
          setTableStats({ occupied, total });
        }

        if (settingData && settingData.value !== 'true') {
          setSetupCompleted(false);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleRowClick = (b: Bill) => {
    const billData: BillData = {
      billId: b.id,
      orderId: b.orderId,
      tokenNumber: b.tokenNumber || '01',
      restaurantName: config.cafeName || b.restaurantName || 'ChatChaska Cafe',
      gstin: config.gstin || b.gstin || '',
      fssai: config.fssai || b.fssai || '',
      address: config.address || b.address || '',
      date: new Date(b.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      tableNumber: b.tableNumber,
      waiterName: b.waiterName,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      items: b.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice || 0,
        lineTotal: i.lineTotal || 0,
      })),
      subtotal: b.subtotal,
      discountAmount: b.discountAmount,
      cgstRate: config.cgstRate || 2.5,
      sgstRate: config.sgstRate || 2.5,
      cgstAmount: b.cgstAmount,
      sgstAmount: b.sgstAmount,
      grandTotal: b.grandTotal,
      paymentMode: (b.paymentMode || 'CASH').toUpperCase(),
    };
    setSelectedBillData(billData);
    setIsReceiptOpen(true);
  };

  const totalPaymentSum = paymentBreakdown.reduce((acc, p) => acc + (p.amount || 0), 0) || 1;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Cafe</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })} • Live store overview
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/menu"
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-500">restaurant_menu</span>
            Edit Menu
          </Link>
          <Link
            href="/staff/pos"
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            Open POS
          </Link>
        </div>
      </div>

      {/* Setup Wizard Incomplete Banner */}
      {!setupCompleted && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
              🚀
            </div>
            <div>
              <h3 className="font-bold text-sm">Finish Setting Up Your Cafe Workspace</h3>
              <p className="text-xs text-blue-100">
                Configure your GST/FSSAI numbers, dining tables, and staff PINs in 2 minutes.
              </p>
            </div>
          </div>

          <Link
            href="/admin/setup"
            className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 font-black rounded-xl text-xs shadow-xs shrink-0 transition-all cursor-pointer"
          >
            Launch Setup Wizard →
          </Link>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today&apos;s Sales</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl md:text-3xl font-black text-blue-600">₹{metrics.netRevenue}</div>
          <div className="text-[11px] text-slate-400 font-medium truncate">From {metrics.totalBills} completed bills</div>
        </div>

        <div className="p-4.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Bills</span>
          <div className="text-2xl md:text-3xl font-black text-slate-900">{metrics.totalBills}</div>
          <div className="text-[11px] text-slate-400 font-medium">Avg Ticket: ₹{metrics.avgTicket}</div>
        </div>

        <div className="p-4.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Live Dining</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">LIVE</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-600">
            {tableStats.occupied}/{tableStats.total || 8}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Tables Occupied</div>
        </div>

        <div className="p-4.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">GST Collected</span>
          <div className="text-2xl md:text-3xl font-black text-amber-600">₹{metrics.totalTax}</div>
          <div className="text-[11px] text-slate-400 font-medium">CGST + SGST</div>
        </div>

        <div className="p-4.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Discounts</span>
          <div className="text-2xl md:text-3xl font-black text-rose-600">₹{metrics.totalDiscounts}</div>
          <div className="text-[11px] text-slate-400 font-medium">Promotional savings</div>
        </div>
      </div>

      {/* Middle Section: Top Dishes & Payment Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Selling Dishes */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🔥</span>
              <h2 className="font-bold text-sm text-slate-900">Top Selling Dishes Today</h2>
            </div>
            <Link href="/admin/menu" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View All Menu →
            </Link>
          </div>

          {topItems.length === 0 ? (
            <div className="text-xs text-slate-400 py-8 text-center font-medium">
              No orders settled yet today. Generate bills on POS to see top sellers!
            </div>
          ) : (
            <div className="space-y-2.5">
              {topItems.map((item, idx) => {
                const maxRevenue = topItems[0]?.revenue || 1;
                const pct = Math.min(100, Math.round((item.revenue / maxRevenue) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] flex items-center justify-center font-mono text-slate-500">
                          {idx + 1}
                        </span>
                        <span>{item.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal">×{item.qty} sold</span>
                      </div>
                      <span className="font-extrabold text-slate-900">₹{item.revenue}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Modes Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">💳</span>
              <h2 className="font-bold text-sm text-slate-900">Payment Modes</h2>
            </div>
          </div>

          {paymentBreakdown.length === 0 ? (
            <div className="text-xs text-slate-400 py-8 text-center font-medium">
              No payments recorded today
            </div>
          ) : (
            <div className="space-y-3">
              {paymentBreakdown.map((pm, idx) => {
                const pct = Math.round((pm.amount / totalPaymentSum) * 100);
                const isUpi = (pm.payment_mode || '').toLowerCase() === 'upi';
                const isCash = (pm.payment_mode || '').toLowerCase() === 'cash';

                return (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold uppercase tracking-wide text-slate-800 flex items-center gap-1.5">
                        <span>{isUpi ? '📱' : isCash ? '💵' : '💳'}</span>
                        {pm.payment_mode}
                      </span>
                      <span className="font-black text-slate-900">₹{pm.amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                      <span>{pm.count} bills</span>
                      <span>{pct}% of total</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isUpi ? 'bg-blue-600' : isCash ? 'bg-emerald-600' : 'bg-purple-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Completed Bills */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-base">🧾</span>
            <h2 className="font-bold text-sm text-slate-900">Recent Bills Today</h2>
          </div>
          <Link href="/admin/reports" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View All Sales →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold border-b border-slate-200/80">
              <tr>
                <th className="p-3">Token</th>
                <th className="p-3">Bill ID</th>
                <th className="p-3">Table</th>
                <th className="p-3">Waiter</th>
                <th className="p-3">Payment</th>
                <th className="p-3 font-bold text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
                    No bills generated yet today.
                  </td>
                </tr>
              ) : (
                recentBills.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => handleRowClick(b)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono font-bold text-slate-800">#{b.tokenNumber || '01'}</td>
                    <td className="p-3 font-mono font-semibold text-slate-600">{b.id}</td>
                    <td className="p-3 font-medium">{b.tableNumber}</td>
                    <td className="p-3 text-slate-500">{b.waiterName}</td>
                    <td className="p-3 uppercase font-bold text-[11px] text-amber-600">{b.paymentMode}</td>
                    <td className="p-3 font-black text-blue-600 text-right">₹{b.grandTotal}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {isReceiptOpen && selectedBillData && (
        <ReceiptPreviewModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          billData={selectedBillData}
          hideGoBack={true}
          hideWhatsApp={false}
        />
      )}
    </div>
  );
}
