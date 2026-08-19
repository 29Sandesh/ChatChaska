'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bill } from '@/types';
import { ReceiptPreviewModal, BillData } from '@/components/pos/ReceiptPreviewModal';

interface ReportSummary {
  totalBills: number;
  grossSales: number;
  totalDiscounts: number;
  totalTax: number;
  netRevenue: number;
  avgTicket: number;
}

interface ItemSale {
  name: string;
  qty: number;
  revenue: number;
}

interface PaymentSplit {
  payment_mode: string;
  count: number;
  amount: number;
}

export default function OrderHistoryAndReportsPage() {
  const [activeTab, setActiveTab] = useState<'bills' | 'items' | 'payments' | 'gst'>('bills');
  const [timeframe, setTimeframe] = useState<'today' | 'yesterday' | 'week' | 'month'>('today');
  
  const [bills, setBills] = useState<Bill[]>([]);
  const [reportData, setReportData] = useState<{
    summary: ReportSummary;
    paymentBreakdown: PaymentSplit[];
    itemSales: ItemSale[];
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedBillData, setSelectedBillData] = useState<BillData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchHistoryAndReports = useCallback(async () => {
    try {
      const [billsRes, reportsRes] = await Promise.all([
        fetch('/api/bills'),
        fetch(`/api/reports?timeframe=${timeframe}`),
      ]);
      const billsJson = await billsRes.json();
      const reportsJson = await reportsRes.json();

      if (billsJson.bills) setBills(billsJson.bills);
      if (reportsJson.summary) setReportData(reportsJson);
    } catch (err) {
      console.error('Failed to load history reports:', err);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchHistoryAndReports();
  }, [fetchHistoryAndReports]);

  const handleReprint = (bill: Bill) => {
    const formattedBillData: BillData = {
      billId: bill.id,
      restaurantName: bill.restaurantName || 'ChatChaska Cafe',
      date: bill.createdAt ? new Date(bill.createdAt).toLocaleString() : new Date().toLocaleString(),
      tableNumber: bill.tableNumber,
      waiterName: bill.waiterName,
      items: (bill.items || []).map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.lineTotal,
      })),
      subtotal: bill.subtotal,
      discountAmount: bill.discountAmount || 0,
      cgstAmount: bill.cgstAmount || 0,
      sgstAmount: bill.sgstAmount || 0,
      grandTotal: bill.grandTotal,
      paymentMode: (bill.paymentMode || 'cash').toUpperCase(),
    };

    setSelectedBillData(formattedBillData);
    setIsReceiptOpen(true);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeTab === 'bills') {
      csvContent += 'Bill ID,Table,Waiter,Payment Mode,Subtotal,Discount,Tax,Grand Total,Status,Date\n';
      bills.forEach((b) => {
        csvContent += `"${b.id}","${b.tableNumber}","${b.waiterName}","${b.paymentMode}",${b.subtotal},${b.discountAmount || 0},${b.gstAmount || 0},${b.grandTotal},"${b.status}","${b.createdAt}"\n`;
      });
    } else if (activeTab === 'items' && reportData) {
      csvContent += 'Item Name,Quantity Sold,Total Revenue (INR)\n';
      reportData.itemSales.forEach((i) => {
        csvContent += `"${i.name}",${i.qty},${i.revenue}\n`;
      });
    } else if (activeTab === 'payments' && reportData) {
      csvContent += 'Payment Mode,Transaction Count,Total Amount (INR)\n';
      reportData.paymentBreakdown.forEach((p) => {
        csvContent += `"${p.payment_mode}",${p.count},${p.amount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chatchaska_${activeTab}_report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`CSV report downloaded for ${activeTab}!`);
  };

  const summary = reportData?.summary || {
    totalBills: 0,
    grossSales: 0,
    totalDiscounts: 0,
    totalTax: 0,
    netRevenue: 0,
    avgTicket: 0,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[32px] text-blue-600">analytics</span>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Order History & Reports Hub</h1>
            <p className="text-xs text-slate-500 font-medium">Real-time sales performance, item analytics, and GST reports</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 shadow-sm"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Net Sales Revenue</span>
          <div className="text-2xl font-black text-blue-600 mt-1">₹{summary.netRevenue}</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Gross: ₹{summary.grossSales}</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Total Orders</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{summary.totalBills}</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Avg Ticket: ₹{summary.avgTicket}</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">GST Tax Collected</span>
          <div className="text-2xl font-black text-amber-600 mt-1">₹{summary.totalTax}</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">CGST + SGST (5%)</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Discounts Given</span>
          <div className="text-2xl font-black text-rose-600 mt-1">₹{summary.totalDiscounts}</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-medium">Total promotional discounts</span>
        </div>
      </div>

      {/* Report Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('bills')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'bills' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Bills & Receipts
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'items' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Item-wise Sales Breakdown
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'payments' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Payment Mode Split
        </button>
        <button
          onClick={() => setActiveTab('gst')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'gst' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          GST Tax Report
        </button>
      </div>

      {/* Tab 1: All Bills Table */}
      {activeTab === 'bills' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
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
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">No bills generated yet</td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{bill.id}</td>
                      <td className="p-3 font-semibold">{bill.tableNumber}</td>
                      <td className="p-3">{bill.waiterName}</td>
                      <td className="p-3 uppercase font-bold text-amber-600">{bill.paymentMode}</td>
                      <td className="p-3">₹{bill.subtotal}</td>
                      <td className="p-3">₹{bill.gstAmount || 0}</td>
                      <td className="p-3 font-bold text-blue-600">₹{bill.grandTotal}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleReprint(bill)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold transition-colors border border-slate-300"
                        >
                          Reprint Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Item Sales Table */}
      {activeTab === 'items' && reportData && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Quantity Sold</th>
                  <th className="p-3">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.itemSales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400 font-medium">No item sales data for this timeframe</td>
                  </tr>
                ) : (
                  reportData.itemSales.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3 font-mono font-bold text-amber-600">{item.qty} units</td>
                      <td className="p-3 font-bold text-blue-600">₹{item.revenue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Payment Breakdown */}
      {activeTab === 'payments' && reportData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportData.paymentBreakdown.map((pm) => (
            <div key={pm.payment_mode} className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase block">{pm.payment_mode} Collections</span>
                <span className="text-3xl font-black text-blue-600 mt-2 block">₹{pm.amount}</span>
              </div>
              <span className="text-xs text-slate-400 mt-4 block font-semibold">{pm.count} transactions</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: GST Tax Report */}
      {activeTab === 'gst' && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">GST CGST/SGST Tax Filing Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-semibold block">Total Taxable Turnover</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">₹{summary.grossSales - summary.totalDiscounts}</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-semibold block">CGST (2.5%)</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">₹{(summary.totalTax / 2).toFixed(2)}</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-semibold block">SGST (2.5%)</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">₹{(summary.totalTax / 2).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 text-xs font-bold z-50 shadow-2xl animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* Thermal Receipt Preview Modal */}
      {selectedBillData && (
        <ReceiptPreviewModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          billData={selectedBillData}
        />
      )}
    </div>
  );
}
