'use client';

import React, { useState, useEffect } from 'react';

export interface OrderTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTable: string;
  orderType: 'DINE_IN' | 'PICKUP';
  onProceed: (orderType: 'DINE_IN' | 'PICKUP', tableNumber: string) => void;
}

interface TableMapItem {
  id: string;
  name: string;
  isOccupied: boolean;
}

export function OrderTypeModal({
  isOpen,
  onClose,
  selectedTable: initialTable,
  orderType: initialOrderType,
  onProceed,
}: OrderTypeModalProps) {
  const [orderType, setOrderType] = useState<'DINE_IN' | 'PICKUP'>(initialOrderType || 'DINE_IN');
  const [selectedTable, setSelectedTable] = useState<string>(initialTable || 'Table 1');
  const [allTables, setAllTables] = useState<TableMapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setOrderType(initialOrderType || 'DINE_IN');
      setSelectedTable(initialTable || 'Table 1');
      setLoading(true);

      fetch('/api/tables')
        .then((res) => res.json())
        .then((data) => {
          if (data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
            const mapped: TableMapItem[] = data.tables.map((t: any) => ({
              id: t.id || t.name,
              name: t.name || t.id,
              isOccupied: t.status === 'occupied' || t.status === 'running',
            }));
            setAllTables(mapped);

            // Auto-select first free table if current table is occupied
            const isCurrentFree = mapped.some((t) => (t.name === selectedTable || t.id === selectedTable) && !t.isOccupied);
            if (!isCurrentFree) {
              const firstFree = mapped.find((t) => !t.isOccupied);
              if (firstFree) setSelectedTable(firstFree.name);
            }
          } else {
            // Default 12-table floor map fallback
            const fallback: TableMapItem[] = Array.from({ length: 12 }, (_, i) => ({
              id: `T${i + 1}`,
              name: `Table ${i + 1}`,
              isOccupied: false,
            }));
            setAllTables(fallback);
          }
        })
        .catch(() => {
          const fallback: TableMapItem[] = Array.from({ length: 12 }, (_, i) => ({
            id: `T${i + 1}`,
            name: `Table ${i + 1}`,
            isOccupied: false,
          }));
          setAllTables(fallback);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, initialTable, initialOrderType]);

  if (!isOpen) return null;

  const handleContinue = () => {
    onProceed(orderType, orderType === 'DINE_IN' ? selectedTable : 'Pick Up');
  };

  const freeCount = allTables.filter((t) => !t.isOccupied).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none font-sans">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-[#C3A27C]/40 overflow-hidden flex flex-col">
        
        {/* Brand Themed Header (#C3A27C Beige) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#FAF7F2] border-b border-[#C3A27C]/30">
          <h3 className="text-sm font-bold text-black">Select Order Type</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-sm hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 bg-white">
          {/* Order Type Toggle: Dine In vs Pick Up */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className={`py-3 px-3 rounded-md border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                orderType === 'DINE_IN'
                  ? 'bg-[#C3A27C] border-[#B2906A] text-slate-950 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-[#FAF7F2]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">table_restaurant</span>
              <span>Dine In</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderType('PICKUP')}
              className={`py-3 px-3 rounded-md border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                orderType === 'PICKUP'
                  ? 'bg-[#C3A27C] border-[#B2906A] text-slate-950 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-[#FAF7F2]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              <span>Pick Up</span>
            </button>
          </div>

          {/* Table Map (Only when Dine In is active) */}
          {orderType === 'DINE_IN' && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Table Map</span>
                <div className="flex items-center gap-2 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-slate-700">
                    <span className="w-2 h-2 rounded-2xs bg-white border border-[#C3A27C] inline-block" />
                    <span>{freeCount} Free</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-2xs bg-slate-300 inline-block opacity-40" />
                    <span>{allTables.length - freeCount} Busy</span>
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4 text-xs text-slate-400">Loading tables...</div>
              ) : (
                /* Table Grid: Free tables are clean WHITE boxes, Taken tables are DULL, FADED, and NON-CLICKABLE */
                <div className="grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto no-scrollbar pt-1">
                  {allTables.map((tbl) => {
                    const isSelected = selectedTable === tbl.name || selectedTable === tbl.id;
                    const displayNum = tbl.name.replace(/\D/g, '') || tbl.id.replace(/\D/g, '') || tbl.name;

                    if (tbl.isOccupied) {
                      return (
                        <div
                          key={tbl.id}
                          className="py-2.5 px-1 text-xs font-bold rounded-sm border border-slate-200 bg-slate-100 text-slate-400 opacity-30 flex flex-col items-center justify-center cursor-not-allowed select-none"
                          title={`Table ${displayNum} is currently occupied`}
                        >
                          <span>{displayNum}</span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={tbl.id}
                        type="button"
                        onClick={() => setSelectedTable(tbl.name)}
                        className={`py-2.5 px-1 text-xs font-bold rounded-sm border transition-all cursor-pointer shadow-2xs flex flex-col items-center justify-center active:scale-95 ${
                          isSelected
                            ? 'bg-[#C3A27C] text-slate-950 border-[#B2906A] shadow-xs'
                            : 'bg-white border-[#C3A27C]/50 text-slate-900 hover:border-[#C3A27C] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span>{displayNum}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Brand Themed Footer Actions */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#C3A27C]/30 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-md border border-[#C3A27C]/50 bg-white hover:bg-[#FAF7F2] text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 py-2.5 rounded-md bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
