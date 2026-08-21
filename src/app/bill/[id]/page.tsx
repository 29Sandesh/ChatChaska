'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface BillItem {
  name: string;
  quantity: number;
  price: number;
}

interface HostedBill {
  id: string;
  tokenNumber: string;
  restaurantName: string;
  tableNumber: string;
  waiterName: string;
  items: BillItem[];
  subtotal: number;
  gstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMode: string;
  status: string;
  createdAt: string;
}

export default function HostedBillPage() {
  const params = useParams();
  const billId = (params?.id as string) || 'bill-demo';
  const [bill, setBill] = useState<HostedBill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt fetching live bill from local API, or load mock/cached invoice
    fetch(`/api/bills?id=${billId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.bill) {
          const raw = data.bill;
          let items: BillItem[] = [];
          try {
            items = typeof raw.items_json === 'string' ? JSON.parse(raw.items_json) : raw.items_json;
          } catch {
            items = [];
          }

          setBill({
            id: raw.id,
            tokenNumber: raw.token_number || raw.id.slice(-4),
            restaurantName: raw.restaurant_name || 'ChatChaska Cafe',
            tableNumber: raw.table_number || 'Takeaway',
            waiterName: raw.waiter_name || 'Staff',
            items,
            subtotal: raw.subtotal || raw.grand_total,
            gstPercent: raw.gst_percent || 5,
            cgstAmount: raw.cgst_amount || 0,
            sgstAmount: raw.sgst_amount || 0,
            discountAmount: raw.discount_amount || 0,
            grandTotal: raw.grand_total,
            paymentMode: raw.payment_mode || 'cash',
            status: raw.status || 'paid',
            createdAt: raw.created_at || new Date().toISOString(),
          });
        } else {
          // Fallback demo bill if ID not in current local DB
          setBill({
            id: billId,
            tokenNumber: '104',
            restaurantName: 'ChatChaska Cafe',
            tableNumber: 'Table 4',
            waiterName: 'Rahul',
            items: [
              { name: 'Special Masala Chai', quantity: 2, price: 50 },
              { name: 'Paneer Tikka Roll', quantity: 1, price: 180 },
              { name: 'Crispy French Fries', quantity: 1, price: 120 },
            ],
            subtotal: 400,
            gstPercent: 5,
            cgstAmount: 10,
            sgstAmount: 10,
            discountAmount: 0,
            grandTotal: 420,
            paymentMode: 'UPI',
            status: 'paid',
            createdAt: new Date().toISOString(),
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setBill({
          id: billId,
          tokenNumber: '104',
          restaurantName: 'ChatChaska Cafe',
          tableNumber: 'Table 4',
          waiterName: 'Staff',
          items: [
            { name: 'Special Masala Chai', quantity: 2, price: 50 },
            { name: 'Paneer Tikka Roll', quantity: 1, price: 180 },
          ],
          subtotal: 280,
          gstPercent: 5,
          cgstAmount: 7,
          sgstAmount: 7,
          discountAmount: 0,
          grandTotal: 294,
          paymentMode: 'UPI',
          status: 'paid',
          createdAt: new Date().toISOString(),
        });
        setLoading(false);
      });
  }, [billId]);

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!bill) return;
    const text = `*${bill.restaurantName} - Invoice #${bill.tokenNumber}*\nTotal: ₹${bill.grandTotal.toFixed(2)}\nLink: ${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading || !bill) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
          <span className="w-5 h-5 border-2 border-[#C3A27C] border-t-transparent rounded-full animate-spin" />
          Loading digital tax invoice...
        </div>
      </div>
    );
  }

  const formattedDate = new Date(bill.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center justify-center font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-md shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-black text-white p-6 text-center relative rounded-t-md">
          <img
            src="/chatchaska-logo.png"
            alt="ChatChaska"
            className="h-10 object-contain mx-auto mb-2 drop-shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/chaska-c-logo.png';
            }}
          />
          <h1 className="text-xl font-black tracking-tight">{bill.restaurantName}</h1>
          <p className="text-xs text-[#C3A27C] font-medium mt-0.5">Tax Invoice &amp; Digital Receipt</p>
          
          <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wide">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {bill.status === 'paid' ? `Payment Completed via ${bill.paymentMode}` : bill.status}
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="p-6 border-b border-dashed border-slate-200 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px]">Invoice #</span>
            <span className="font-mono font-black text-slate-950">#{bill.tokenNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-bold block uppercase text-[10px]">Date &amp; Time</span>
            <span className="font-semibold text-slate-950">{formattedDate}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold block uppercase text-[10px]">Table / Section</span>
            <span className="font-bold text-slate-950">{bill.tableNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-bold block uppercase text-[10px]">Payment Mode</span>
            <span className="font-bold text-slate-950 uppercase">{bill.paymentMode}</span>
          </div>
        </div>

        {/* Itemized Breakdown */}
        <div className="p-6 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 flex justify-between">
            <span>Ordered Items</span>
            <span>Total</span>
          </div>
          <div className="space-y-3">
            {bill.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs">
                <div className="flex-1 pr-2">
                  <span className="font-bold text-slate-950 block">{item.name}</span>
                  <span className="text-slate-500 font-medium">₹{item.price.toFixed(2)} x {item.quantity}</span>
                </div>
                <span className="font-bold font-mono text-slate-950">
                  ₹{(item.quantity * item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-semibold text-slate-950">₹{bill.subtotal.toFixed(2)}</span>
            </div>

            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount Applied</span>
                <span className="font-mono">-₹{bill.discountAmount.toFixed(2)}</span>
              </div>
            )}

            {bill.cgstAmount > 0 && (
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>CGST ({(bill.gstPercent / 2).toFixed(1)}%)</span>
                <span className="font-mono text-slate-700">₹{bill.cgstAmount.toFixed(2)}</span>
              </div>
            )}

            {bill.sgstAmount > 0 && (
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>SGST ({(bill.gstPercent / 2).toFixed(1)}%)</span>
                <span className="font-mono text-slate-700">₹{bill.sgstAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-300 flex justify-between items-baseline mt-2">
              <span className="text-base font-black text-slate-950 uppercase tracking-wide">Grand Total</span>
              <span className="text-2xl font-black font-mono text-slate-950">
                ₹{bill.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="px-6 pb-2">
          <div className="bg-[#C3A27C]/10 border border-[#C3A27C]/30 p-4 rounded-md text-center">
            <span className="material-symbols-outlined text-[#C3A27C] text-2xl mb-1">star</span>
            <h3 className="font-bold text-slate-950 text-sm">Rate Us on Google</h3>
            <p className="text-xs text-slate-600 mt-1">We hope you enjoyed your meal! Leave us a review to help us improve.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3 rounded-b-md">
          <button
            onClick={handleDownloadPdf}
            className="w-full bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-bold py-3 rounded-md text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print / Download PDF
          </button>
          
          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 rounded-md text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Share on WhatsApp
          </button>
          
          <p className="text-[11px] text-center text-slate-400 font-medium mt-4">
            Thank you for dining with us!<br />
            Powered by <strong>ChatChaska POS</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
