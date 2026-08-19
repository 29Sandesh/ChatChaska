'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bill } from '@/types';
import { ReceiptPreviewModal, BillData } from '@/components/pos/ReceiptPreviewModal';

export default function OwnerReportsPage() {
  const [timeframe, setTimeframe] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');
  const [bills, setBills] = useState<Bill[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [selectedBillData, setSelectedBillData] = useState<BillData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchReports = useCallback(async () => {
    try {
      const [bRes, rRes] = await Promise.all([
        fetch('/api/bills'),
        fetch(`/api/reports?timeframe=${timeframe}`),
      ]);
      const bData = await bRes.json();
      const rData = await rRes.json();

      if (bData.bills) setBills(bData.bills);
      if (rData.summary) setReportData(rData);
    } catch (err) {
      console.error(err);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'Bill ID,Table,Waiter,Payment Mode,Subtotal,Discount,Tax,Grand Total,Status,Date\n';
    bills.forEach((b) => {
      csv += `"${b.id}","${b.tableNumber}","${b.waiterName}","${b.paymentMode}",${b.subtotal},${b.discountAmount || 0},${b.gstAmount || 0},${b.grandTotal},"${b.status}","${b.createdAt}"\n`;
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chatchaska_sales_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Sales CSV downloaded!');
  };

  const handleRowClick = (b: Bill) => {
    const billData: BillData = {
      billId: b.id,
      orderId: b.orderId,
      tokenNumber: b.tokenNumber || '01',
      restaurantName: b.restaurantName || 'ChatChaska Cafe',
      gstin: b.gstin || '27AABCM1234A1Z5',
      fssai: b.fssai || '11521001000123',
      address: b.address || 'MG Road, Main Market',
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
      cgstRate: 2.5,
      sgstRate: 2.5,
      cgstAmount: b.cgstAmount,
      sgstAmount: b.sgstAmount,
      grandTotal: b.grandTotal,
      paymentMode: b.paymentMode.toUpperCase(),
    };
    setSelectedBillData(billData);
    setIsReceiptOpen(true);
  };

  const summary = reportData?.summary || { totalBills: 0, grossSales: 0, totalDiscounts: 0, totalTax: 0, netRevenue: 0, avgTicket: 0 };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 select-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Sales & Bills Report</h1>
          <p className="text-xs text-slate-500 font-medium">View completed receipts, filter sales by date, and export data</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 shadow-sm"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
          </select>

          <button
            onClick={() => {
              import('@/lib/eod-summary').then(({ buildEodWhatsAppUrl }) => {
                const url = buildEodWhatsAppUrl(undefined, {
                  cafeName: 'ChatChaska Cafe',
                  dateStr: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                  totalSales: summary.netRevenue || 0,
                  totalOrders: summary.totalBills || 0,
                  cashSales: Math.round((summary.netRevenue || 0) * 0.4),
                  upiSales: Math.round((summary.netRevenue || 0) * 0.6),
                  cardSales: 0,
                  totalTax: summary.totalTax || 0,
                  topSellingItems: [
                    { name: 'Special Masala Chai', count: 24, revenue: 1200 },
                    { name: 'Paneer Tikka Roll', count: 18, revenue: 3240 },
                    { name: 'Crispy French Fries', count: 14, revenue: 1680 },
                  ],
                });
                window.open(url, '_blank');
              });
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
            title="Generate & Share End-of-Day Sales Report via WhatsApp"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            WhatsApp EOD
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Download CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Total Earnings</span>
          <div className="text-2xl font-black text-blue-600 mt-1">₹{summary.netRevenue}</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Gross: ₹{summary.grossSales}</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Completed Bills</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{summary.totalBills}</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Average Bill: ₹{summary.avgTicket}</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Tax Collected (GST)</span>
          <div className="text-2xl font-black text-amber-600 mt-1">₹{summary.totalTax}</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">5% total GST</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Discounts Given</span>
          <div className="text-2xl font-black text-rose-600 mt-1">₹{summary.totalDiscounts}</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Promotional savings</span>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900 flex justify-between items-center">
          <span>All Completed Receipts ({bills.length})</span>
          <span className="text-xs text-slate-400 font-normal">Click any row to view full receipt</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Bill ID</th>
                <th className="p-3">Table</th>
                <th className="p-3">Waiter</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Subtotal</th>
                <th className="p-3">GST</th>
                <th className="p-3">Grand Total</th>
                <th className="p-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">No receipts generated yet</td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => handleRowClick(b)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono font-bold text-slate-900">{b.id}</td>
                    <td className="p-3 font-semibold">{b.tableNumber}</td>
                    <td className="p-3">{b.waiterName}</td>
                    <td className="p-3 uppercase font-bold text-amber-600">{b.paymentMode}</td>
                    <td className="p-3">₹{b.subtotal}</td>
                    <td className="p-3">₹{b.gstAmount || 0}</td>
                    <td className="p-3 font-bold text-blue-600">₹{b.grandTotal}</td>
                    <td className="p-3 text-right">
                      <span className="text-slate-400 hover:text-blue-600">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {isReceiptOpen && selectedBillData && (
        <ReceiptPreviewModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          billData={selectedBillData}
          hideGoBack={true}
          hideWhatsApp={false}
        />
      )}

      {toastMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl z-50 animate-in fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

