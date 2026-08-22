'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { Bill } from '@/types';
import { StaffNavigationDrawer } from '@/components/layout/StaffNavigationDrawer';
import { ReceiptPreviewModal, BillData } from '@/components/pos/ReceiptPreviewModal';
import { useCafeConfig } from '@/hooks/useCafeConfig';
import { EmptyState } from '@/components/ui/EmptyState';

type DateFilter = 'TODAY' | 'YESTERDAY' | 'WEEK' | 'ALL';

export default function StaffOrderHistoryPage() {
  const { config } = useCafeConfig();
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBillData, setSelectedBillData] = useState<BillData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // EOD PDF & WhatsApp Dispatch Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('TODAY');

  const fetchBills = () => {
    fetch('/api/bills')
      .then((r) => r.json())
      .then((d) => {
        if (d.bills) setBills(d.bills);
      });
  };

  useEffect(() => {
    fetchBills();
    const interval = setInterval(fetchBills, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('chatchaska_eod_phone') || config?.phone || '';
      if (savedPhone) setRecipientPhone(savedPhone);
    }
  }, [config?.phone]);

  const todayRevenue = bills
    .filter((b) => {
      try {
        const d = new Date(b.createdAt || '');
        const today = new Date();
        return d.toDateString() === today.toDateString();
      } catch { return false; }
    })
    .reduce((sum, b) => sum + (b.grandTotal || 0), 0);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleString();
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const handleReprint = (bill: Bill) => {
    const formatted: BillData = {
      billId: bill.id,
      orderId: bill.orderId,
      tokenNumber: bill.tokenNumber || '01',
      restaurantName: bill.restaurantName || config?.cafeName || 'ChatChaska Cafe',
      gstin: bill.gstin || config?.gstin || '27AABCM1234A1Z5',
      fssai: bill.fssai || config?.fssai || '10019022009876',
      address: bill.address || config?.address || 'Shop #4, Main Street, Mumbai',
      date: formatDate(bill.createdAt),
      tableNumber: bill.tableNumber,
      waiterName: bill.waiterName || 'Staff',
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
      customerName: bill.customerName,
      customerPhone: bill.customerPhone,
    };
    setSelectedBillData(formatted);
    setIsReceiptOpen(true);
  };

  const dateFilterLabels: Record<DateFilter, string> = {
    TODAY: 'Today',
    YESTERDAY: 'Yesterday',
    WEEK: 'Last 7 Days',
    ALL: 'All Time',
  };

  const generateDailyPdf = (reportBills: Bill[], filterLabel: string) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const cafeName = config?.cafeName || 'ChatChaska Cafe';
    const gstin = config?.gstin || '27AABCM1234A1Z5';
    const address = config?.address || 'Shop #4, Main Street, Mumbai';

    // Header Ribbon
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(cafeName.toUpperCase(), 14, 11);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${address}  |  GSTIN: ${gstin}`, 14, 18);

    // Title & Metadata
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`DAILY SALES & BILLING AUDIT REPORT`, 14, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Period: ${filterLabel}   |   Generated: ${new Date().toLocaleString('en-IN')}`, 14, 40);

    // Summary Box
    const totalRev = reportBills.reduce((s, b) => s + (b.grandTotal || 0), 0);
    const cashRev = reportBills
      .filter((b) => (b.paymentMode || '').toLowerCase() === 'cash')
      .reduce((s, b) => s + (b.grandTotal || 0), 0);
    const upiRev = reportBills
      .filter((b) => ['upi', 'qr'].includes((b.paymentMode || '').toLowerCase()))
      .reduce((s, b) => s + (b.grandTotal || 0), 0);
    const totalTax = reportBills.reduce((s, b) => s + (b.cgstAmount || 0) + (b.sgstAmount || 0), 0);

    doc.setFillColor(250, 247, 242);
    doc.setDrawColor(195, 162, 124);
    doc.roundedRect(14, 45, 182, 22, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`TOTAL BILLS: ${reportBills.length}`, 20, 53);
    doc.text(`GROSS REVENUE: Rs. ${totalRev.toFixed(2)}`, 100, 53);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Cash: Rs. ${cashRev.toFixed(2)}`, 20, 61);
    doc.text(`UPI / QR: Rs. ${upiRev.toFixed(2)}`, 80, 61);
    doc.text(`GST Tax: Rs. ${totalTax.toFixed(2)}`, 140, 61);

    // Table Header
    let y = 76;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 5, 182, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('BILL ID', 16, y);
    doc.text('DATE / TIME', 55, y);
    doc.text('TABLE / TOKEN', 105, y);
    doc.text('PAYMENT', 145, y);
    doc.text('AMOUNT (Rs.)', 172, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    reportBills.forEach((b) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      const timeStr = b.createdAt
        ? new Date(b.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A';
      doc.text(String(b.id || '').slice(0, 16), 16, y);
      doc.text(timeStr, 55, y);
      doc.text(String(b.tableNumber || b.tokenNumber || 'Takeaway'), 105, y);
      doc.text(String(b.paymentMode || 'CASH').toUpperCase(), 145, y);
      doc.text((b.grandTotal || 0).toFixed(2), 172, y);

      doc.setDrawColor(241, 245, 249);
      doc.line(14, y + 1.5, 196, y + 1.5);
      y += 5.5;
    });

    // Page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `ChatChaska Smart POS • Page ${i} of ${pageCount} • Confidential Daily Audit`,
        14,
        290
      );
    }

    const filename = `ChatChaska_Sales_Report_${filterLabel.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    return filename;
  };

  const handleDispatchReport = async (mode: 'whatsapp' | 'download_only') => {
    setIsGeneratingPdf(true);
    try {
      const activeLabel = dateFilterLabels[dateFilter];
      const filename = generateDailyPdf(filteredBills, activeLabel);

      if (mode === 'whatsapp') {
        const cleanPhone = recipientPhone.replace(/\D/g, '');
        if (cleanPhone) {
          localStorage.setItem('chatchaska_eod_phone', cleanPhone);
        }

        const totalTax = filteredBills.reduce(
          (s, b) => s + (b.cgstAmount || 0) + (b.sgstAmount || 0),
          0
        );

        const waText = 
`*☕ CHATCHASKA CAFE — DAILY SALES REPORT*
📅 *Period:* ${activeLabel} (${new Date().toLocaleDateString('en-IN')})
🕒 *Generated:* ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
---------------------------------
🧾 *Total Bills:* ${filteredStats.count}
💰 *Total Revenue:* ₹${filteredStats.revenue.toLocaleString('en-IN')}
💵 *Cash Collected:* ₹${filteredStats.cash.toLocaleString('en-IN')}
📱 *UPI / QR Sales:* ₹${filteredStats.upi.toLocaleString('en-IN')}
🏛️ *GST Collected:* ₹${totalTax.toFixed(2)}
---------------------------------
📄 *Full PDF audit report:* ${filename} (Downloaded to terminal)
✨ _ChatChaska Smart POS Platform_`;

        const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const waUrl = targetPhone
          ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(waText)}`
          : `https://wa.me/?text=${encodeURIComponent(waText)}`;

        // Open WhatsApp web / mobile app
        window.open(waUrl, '_blank');
        setToastMsg(`✅ PDF report downloaded & WhatsApp dispatched!`);
      } else {
        setToastMsg(`✅ PDF sales report saved to device downloads!`);
      }

      setIsReportModalOpen(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      setToastMsg(`⚠️ Failed to generate report.`);
    } finally {
      setIsGeneratingPdf(false);
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  const filteredBills = bills.filter((b) => {
    let dateMatch = true;
    try {
      const d = new Date(b.createdAt || '');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (dateFilter === 'TODAY') {
        dateMatch = d.toDateString() === today.toDateString();
      } else if (dateFilter === 'YESTERDAY') {
        dateMatch = d.toDateString() === yesterday.toDateString();
      } else if (dateFilter === 'WEEK') {
        dateMatch = d.getTime() >= weekAgo.getTime();
      }
    } catch {
      dateMatch = false;
    }

    if (!dateMatch) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchQuery = 
        (b.id || '').toLowerCase().includes(q) ||
        (b.tableNumber || '').toLowerCase().includes(q) ||
        (b.customerName || '').toLowerCase().includes(q) ||
        (b.customerPhone || '').toLowerCase().includes(q) ||
        (b.paymentMode || '').toLowerCase().includes(q);
      
      if (!matchQuery) return false;
    }

    return true;
  });

  const filteredStats = filteredBills.reduce((acc, b) => {
    acc.count += 1;
    acc.revenue += (b.grandTotal || 0);
    const mode = (b.paymentMode || '').toLowerCase();
    if (mode === 'cash') acc.cash += (b.grandTotal || 0);
    else if (mode === 'upi' || mode === 'qr') acc.upi += (b.grandTotal || 0);
    else if (mode === 'card') acc.card += (b.grandTotal || 0);
    return acc;
  }, { count: 0, revenue: 0, cash: 0, upi: 0, card: 0 });

  return (
    <div className="flex-1 flex flex-col h-full w-full select-none font-sans bg-slate-50 overflow-hidden">
      {/* Custom Header */}
      <header className="h-16 bg-white border-b border-[#EBEBEB] px-5 flex items-center justify-between gap-4 shrink-0 shadow-2xs z-30 sticky top-0">
        {/* Left: Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/staff/pos" className="flex items-center">
            <img src="/chatchaska-logo.png" alt="ChatChaska" className="h-8 w-auto max-w-[160px] object-contain drop-shadow-2xs" />
          </Link>
        </div>

        {/* Center: Summary Badges */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-sm bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
            {bills.length} Bills
          </span>
          <span className="px-2.5 py-1 rounded-sm bg-[#FAF7F2] text-slate-950 border border-[#C3A27C]/50 text-[11px] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">payments</span>
            ₹{todayRevenue.toLocaleString('en-IN')} Today
          </span>
        </div>

        {/* Right: EOD Report + POS + Menu */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-3 py-1.5 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-bold text-xs rounded-md shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 border border-[#B2906A]"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>EOD Report</span>
          </button>
          <Link
            href="/staff/pos"
            className="px-3.5 py-1.5 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs border border-[#B2906A]"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span>POS</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-900 transition-all cursor-pointer border border-slate-200"
            title="Navigation Menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Controls: Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-3 rounded-md shadow-2xs border border-slate-200">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search by Bill ID, Table #, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold outline-none focus:border-[#C3A27C] focus:ring-1 focus:ring-[#C3A27C] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200 gap-1 shrink-0 overflow-x-auto">
            {(['TODAY', 'YESTERDAY', 'WEEK', 'ALL'] as DateFilter[]).map((filter) => {
              const labels = {
                TODAY: 'Today',
                YESTERDAY: 'Yesterday',
                WEEK: 'Last 7 Days',
                ALL: 'All Time'
              };
              const active = dateFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors whitespace-nowrap ${
                    active 
                      ? 'bg-[#C3A27C] text-slate-950 shadow-2xs' 
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {labels[filter]}
                </button>
              );
            })}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">receipt_long</span> Bills Count</span>
            <span className="text-xl font-black text-slate-900">{filteredStats.count}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">account_balance_wallet</span> Total Revenue</span>
            <span className="text-xl font-black text-[#C3A27C]">₹{filteredStats.revenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">payments</span> Cash Collected</span>
            <span className="text-xl font-black text-emerald-600">₹{filteredStats.cash.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">qr_code_scanner</span> UPI/QR</span>
            <span className="text-xl font-black text-slate-900">₹{filteredStats.upi.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-black border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-3.5">Bill ID</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Table / Order</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Grand Total</th>
                  <th className="p-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4">
                      <EmptyState
                        icon="search_off"
                        title="No Bills Found"
                        description="Try adjusting your search query or date filters."
                        actionLabel="Clear Filters"
                        actionHref="#"
                        onAction={() => {
                          setSearchQuery('');
                          setDateFilter('ALL');
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((b) => (
                    <tr 
                      key={b.id} 
                      onClick={() => handleReprint(b)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 font-mono font-black text-slate-900">{b.id}</td>
                      <td className="p-3.5 text-slate-600 font-mono font-bold">{formatDate(b.createdAt)}</td>
                      <td className="p-3.5 font-bold text-slate-800">{b.tableNumber}</td>
                      <td className="p-3.5 uppercase font-black text-slate-900">
                        <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#C3A27C]/50 rounded-sm text-[11px]">
                          {b.paymentMode}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-slate-950 text-sm">₹{b.grandTotal}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReprint(b);
                          }}
                          className="px-3 py-1.5 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 rounded-md font-bold text-xs border border-[#B3926C] shadow-2xs transition-colors cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill Preview Modal */}
        {selectedBillData && (
          <ReceiptPreviewModal
            isOpen={isReceiptOpen}
            onClose={() => setIsReceiptOpen(false)}
            billData={selectedBillData}
            hideGoBack={true}
            hideWhatsApp={false}
          />
        )}

        {/* Daily Report PDF & WhatsApp Modal */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
            <div className="bg-white border border-slate-200 rounded-md p-6 max-w-md w-full shadow-2xl space-y-4 font-sans text-slate-900">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#FAF7F2] border border-[#C3A27C]/40 text-slate-900 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Daily Sales Report & PDF</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Export all bills & dispatch to owner</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Date Filter Pills Inside Modal */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Report Time Period
                </label>
                <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200 gap-1">
                  {(['TODAY', 'YESTERDAY', 'WEEK', 'ALL'] as DateFilter[]).map((filter) => {
                    const active = dateFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setDateFilter(filter)}
                        className={`flex-1 py-1 text-xs font-bold rounded-sm transition-colors ${
                          active
                            ? 'bg-[#C3A27C] text-slate-950 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {dateFilterLabels[filter]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary Stats Box */}
              <div className="bg-[#FAF7F2] border border-[#C3A27C]/40 rounded-md p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold">Total Invoices / Bills</span>
                  <span className="font-mono font-black text-slate-950">{filteredStats.count} bills</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold">Gross Sales Revenue</span>
                  <span className="font-mono font-black text-base text-slate-950">₹{filteredStats.revenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-[#C3A27C]/20 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-medium block">Cash Total</span>
                    <span className="font-mono font-bold text-emerald-700">₹{filteredStats.cash.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-medium block">UPI / QR Total</span>
                    <span className="font-mono font-bold text-slate-900">₹{filteredStats.upi.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Recipient Phone Number Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Owner WhatsApp Phone Number
                </label>
                <div className="flex items-center rounded-md border border-slate-300 focus-within:border-[#C3A27C] focus-within:ring-1 focus-within:ring-[#C3A27C] bg-white overflow-hidden">
                  <span className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold border-r border-slate-200">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  PDF will be generated and WhatsApp chat will open with the formatted daily sales summary.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isGeneratingPdf || filteredBills.length === 0}
                  onClick={() => handleDispatchReport('whatsapp')}
                  className="w-full py-3 bg-[#C3A27C] hover:bg-[#B3926C] disabled:opacity-50 text-slate-950 font-black text-xs rounded-md shadow-2xs transition-all border border-[#B2906A] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF & Send on WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  disabled={isGeneratingPdf || filteredBills.length === 0}
                  onClick={() => handleDispatchReport('download_only')}
                  className="w-full py-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-xs rounded-md border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download PDF Only</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-md text-xs font-black shadow-xl z-50 animate-in fade-in">
            {toastMsg}
          </div>
        )}
      </div>
      <StaffNavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
