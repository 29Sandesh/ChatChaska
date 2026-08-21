'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StaffNavigationDrawer } from '@/components/layout/StaffNavigationDrawer';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
  
  // Real-time tick for elapsed time
  const [currentTime, setCurrentTime] = useState(new Date().getTime());

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
    const interval = setInterval(() => {
      fetchTables();
      setCurrentTime(new Date().getTime());
    }, 3000); // 3s real-time live sync
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

  const handleDeleteTable = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/tables?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Table deleted successfully');
        fetchTables();
      } else {
        toast.error('Failed to delete table');
      }
    } catch (error) {
      toast.error('Network error');
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
  const totalTables = tables.length;

  const getElapsedIndicator = (orderTime?: string) => {
    if (!orderTime) return null;
    const elapsedMs = currentTime - new Date(orderTime).getTime();
    if (elapsedMs < 0) return null;
    const elapsedMins = Math.floor(elapsedMs / 60000);
    
    if (elapsedMins < 30) return <span className="text-slate-500 text-[11px] font-bold">⏱ {elapsedMins}m</span>;
    if (elapsedMins < 60) return <span className="text-amber-600 text-[11px] font-bold">⏱ {elapsedMins}m</span>;
    const h = Math.floor(elapsedMins / 60);
    const m = elapsedMins % 60;
    return <span className="text-rose-600 text-[11px] font-bold">⏱ {h}h {m}m</span>;
  };

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

        {/* Center: Status Badges */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-sm bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1.5">
            Total {totalTables}
          </span>
          <span className="px-2.5 py-1 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[12px] text-emerald-500">circle</span>
            {freeCount} Free
          </span>
          <span className="px-2.5 py-1 rounded-sm bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[12px] text-rose-500">circle</span>
            {occupiedCount} Occupied
          </span>
        </div>

        {/* Right: Add Table + POS + Menu */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const nextNum = tables.length + 1;
              setNewTableNumber(`${nextNum}`);
              setIsAddModalOpen(true);
            }}
            className="px-3 py-1.5 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] rounded-md font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Table</span>
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

      <div className="flex-1 overflow-y-auto p-4">
        {/* Table Grid (Only 2 High-Contrast States: Free vs Occupied) */}
        {loading && tables.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-44 bg-slate-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {tables.map((table) => {
              const isOccupied = table.status === 'occupied';
              const pureNumber = table.name.replace(/\D/g, '') || table.name;

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
                  className={
                    isOccupied
                      ? 'bg-[#FAF7F2] border-2 border-[#C3A27C] rounded-md p-4 min-h-[176px] flex flex-col justify-between shadow-xs cursor-pointer transition-all relative'
                      : 'bg-white border border-slate-200 rounded-md p-4 min-h-[176px] flex flex-col justify-between shadow-2xs hover:border-[#C3A27C] transition-all cursor-pointer relative group'
                  }
                >
                  {/* Top Row: Table Name + Status Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-2xl text-slate-900 tracking-tight leading-none">
                        {pureNumber}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-500">
                        {table.seats} Seats
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isOccupied && getElapsedIndicator(table.orderTime)}
                      <span
                        className={
                          isOccupied
                            ? 'px-2 py-0.5 rounded-sm bg-[#C3A27C] text-slate-950 text-[10px] font-bold flex items-center gap-1.5 shadow-xs'
                            : 'px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1.5'
                        }
                      >
                        {isOccupied ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                        ) : (
                          <span className="material-symbols-outlined text-[10px] text-emerald-500">circle</span>
                        )}
                        <span>{isOccupied ? 'OCCUPIED' : 'FREE'}</span>
                      </span>
                      {!isOccupied && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTable(table.id, table.name, e)}
                          className="w-5 h-5 rounded-sm bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors shadow-2xs border border-slate-200 opacity-0 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Center Content */}
                  <div className="my-2">
                    {isOccupied ? (
                      <div className="space-y-1">
                        <div className="text-xl font-black text-slate-950 tracking-tight">
                          ₹{(table.totalAmount || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs font-bold text-slate-700">
                          {table.itemCount || 1} {table.itemCount === 1 ? 'item' : 'items'}
                        </div>
                        {table.items && table.items.length > 0 && (
                          <div className="text-[10px] text-slate-500 truncate mt-1">
                            {table.items.slice(0, 2).map(i => `${i.name} x${i.quantity}`).join(', ')}
                            {table.items.length > 2 ? ' ...' : ''}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
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
                        className="w-full py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
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
                        className="w-full py-2 bg-white hover:bg-[#FAF7F2] border border-[#C3A27C]/50 text-slate-800 font-bold text-xs rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer"
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
      </div>

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg text-slate-900">Add New Table</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Table Number or Name *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-2.5 rounded-md border border-slate-200">
                    Table
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm font-bold text-slate-900 focus:outline-hidden focus:border-[#C3A27C] focus:bg-white transition-colors"
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
                      className={`py-2 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                        newTableSeats === seats
                          ? 'border-[#C3A27C] bg-[#FAF7F2] text-slate-950'
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
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd || !newTableNumber}
                  className="flex-1 py-3 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 border border-[#B2906A] rounded-md font-bold text-xs shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
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

      <StaffNavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
