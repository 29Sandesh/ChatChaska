'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PaymentSettlementModal } from '@/components/pos/PaymentSettlementModal';
import { ReceiptPreviewModal, type BillData } from '@/components/pos/ReceiptPreviewModal';
import { useCafeConfig } from '@/hooks/useCafeConfig';
import { useToast } from '@/components/ui/Toast';

interface TableData {
  id: string;
  name: string;
  seats: number;
  status: 'free' | 'occupied';
  totalAmount: number;
  itemCount: number;
  items?: Array<{ name: string; quantity: number; price?: number; unitPrice?: number }>;
  activeOrderId?: string;
  orderTime?: string;
}

export default function StaffTablesPage() {
  const router = useRouter();
  const { config } = useCafeConfig();
  const { toast } = useToast();

  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Table Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableSeats, setNewTableSeats] = useState('4');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Settle Bill Modal State
  const [settlingTable, setSettlingTable] = useState<TableData | null>(null);
  const [isSettlingOpen, setIsSettlingOpen] = useState(false);

  // Receipt Preview Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<BillData | null>(null);

  // Fetch tables and live status
  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      if (data.tables) {
        setTables(data.tables);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 3000); // 3s real-time live sync
    return () => clearInterval(interval);
  }, []);

  // Add Table Handler
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber) return;
    setSubmittingAdd(true);

    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTableNumber.startsWith('Table ') ? newTableNumber : `Table ${newTableNumber}`,
          seats: Number(newTableSeats) || 4,
        }),
      });

      if (res.ok) {
        toast.success(`Table added successfully!`);
        setIsAddModalOpen(false);
        setNewTableNumber('');
        setNewTableSeats('4');
        fetchTables();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add table');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Start Bill Settlement for an occupied table
  const handleStartGenerateBill = (table: TableData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSettlingTable(table);
    setIsSettlingOpen(true);
  };

  // Confirm and save payment settlement
  const handleConfirmSettlement = async (details: {
    paymentMethod: 'cash' | 'upi' | 'card';
    customerName: string;
    customerPhone: string;
    txnReference?: string;
  }) => {
    if (!settlingTable) return;

    try {
      const grandTotal = settlingTable.totalAmount || 0;
      const subtotal = Math.round(grandTotal / 1.05);
      const gstAmount = grandTotal - subtotal;
      const cgstAmount = Math.round((gstAmount / 2) * 100) / 100;
      const sgstAmount = Math.round((gstAmount / 2) * 100) / 100;

      const billItems = (settlingTable.items || []).map((item) => ({
        name: item.name,
        quantity: item.quantity || 1,
        unitPrice: item.price || item.unitPrice || 0,
        lineTotal: (item.quantity || 1) * (item.price || item.unitPrice || 0),
      }));

      // If no items in active order, create a generic table bill line
      const finalItems =
        billItems.length > 0
          ? billItems
          : [
              {
                name: `${settlingTable.name} Order`,
                quantity: 1,
                unitPrice: grandTotal,
                lineTotal: grandTotal,
              },
            ];

      const billPayload = {
        restaurantId: config.cafeSlug || 'demo',
        restaurantName: config.cafeName || 'ChatChaska Cafe',
        tableNumber: settlingTable.name,
        waiterName: 'Cashier Terminal',
        orderId: settlingTable.activeOrderId,
        items: finalItems,
        subtotal,
        gstPercent: 5,
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

      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billPayload),
      });

      const data = await res.json();

      if (res.ok && data.bill) {
        // Free the table
        await fetch('/api/tables', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: settlingTable.id, status: 'free' }),
        });

        setIsSettlingOpen(false);

        // Prepare Receipt Data
        setReceiptData({
          billId: data.bill.id,
          orderId: settlingTable.activeOrderId,
          tokenNumber: data.bill.tokenNumber || '01',
          restaurantName: config.cafeName || 'ChatChaska Cafe',
          address: config.address,
          gstin: config.gstin,
          fssai: config.fssai,
          date: new Date().toLocaleString('en-IN'),
          tableNumber: settlingTable.name,
          waiterName: 'Cashier Terminal',
          items: finalItems,
          subtotal,
          cgstAmount,
          sgstAmount,
          grandTotal,
          paymentMode: details.paymentMethod.toUpperCase(),
          customerName: details.customerName,
          customerPhone: details.customerPhone,
        });

        setIsReceiptOpen(true);
        toast.success(`🎉 Bill generated & ${settlingTable.name} is now FREE!`);
        fetchTables();
      } else {
        toast.error(data.error || 'Failed to generate bill');
      }
    } catch {
      toast.error('Network connection error');
    }
  };

  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const freeCount = tables.filter((t) => t.status === 'free').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Clean Minimal Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tables</h1>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              🔴 {occupiedCount} Occupied
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              🟢 {freeCount} Free
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              // Suggest next table number
              const nextNum = tables.length + 1;
              setNewTableNumber(`${nextNum}`);
              setIsAddModalOpen(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Add Table</span>
          </button>

          <Link
            href="/staff/pos"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
          >
            <span>Quick POS</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Table Grid (Only 2 High-Contrast States: Free vs Occupied) */}
      {loading && tables.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-44 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const isOccupied = table.status === 'occupied';

            return (
              <div
                key={table.id}
                onClick={() => {
                  if (isOccupied) {
                    handleStartGenerateBill(table);
                  } else {
                    router.push(`/staff/pos?table=${encodeURIComponent(table.name)}`);
                  }
                }}
                className={`rounded-3xl p-5 h-44 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  isOccupied
                    ? 'bg-amber-50/80 border-2 border-amber-500 shadow-md hover:shadow-lg hover:border-amber-600'
                    : 'bg-white border-2 border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Top Row: Table Name + Status Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-xl text-slate-900 tracking-tight">
                      {table.name}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400">
                      {table.seats} Seats
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide flex items-center gap-1.5 ${
                      isOccupied
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOccupied ? 'bg-white animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                    <span>{isOccupied ? 'OCCUPIED' : 'FREE'}</span>
                  </span>
                </div>

                {/* Center Content */}
                <div>
                  {isOccupied ? (
                    <div className="space-y-0.5">
                      <div className="text-2xl font-black text-amber-900 tracking-tight">
                        ₹{(table.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs font-bold text-amber-700">
                        {table.itemCount || 1} {table.itemCount === 1 ? 'item' : 'items'} ordered
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-medium text-slate-400">
                      Ready for customers
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div>
                  {isOccupied ? (
                    <button
                      type="button"
                      onClick={(e) => handleStartGenerateBill(table, e)}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-black text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">receipt_long</span>
                      <span>Generate Bill</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/staff/pos?table=${encodeURIComponent(table.name)}`);
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-600 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      <span>Take Order</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg text-slate-900">Add New Table</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Table Number or Name *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200">
                    Table
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seating Capacity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['2', '4', '6', '8'].map((seats) => (
                    <button
                      key={seats}
                      type="button"
                      onClick={() => setNewTableSeats(seats)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newTableSeats === seats
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {seats} Seats
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd || !newTableNumber}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submittingAdd ? 'Adding...' : 'Add Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Settlement Modal for "Generate Bill" */}
      {settlingTable && (
        <PaymentSettlementModal
          isOpen={isSettlingOpen}
          onClose={() => setIsSettlingOpen(false)}
          tableNumber={settlingTable.name}
          grandTotal={settlingTable.totalAmount || 0}
          itemCount={settlingTable.itemCount || 1}
          merchantUpiId={config.upiId}
          onConfirm={handleConfirmSettlement}
        />
      )}

      {/* Thermal Receipt Preview Modal */}
      {receiptData && (
        <ReceiptPreviewModal
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setReceiptData(null);
          }}
          billData={receiptData}
        />
      )}
    </div>
  );
}
