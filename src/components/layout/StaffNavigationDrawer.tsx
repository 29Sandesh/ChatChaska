"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface StaffNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaffNavigationDrawer({ isOpen, onClose }: StaffNavigationDrawerProps) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [kitchenCount, setKitchenCount] = useState(0);
  const [occupiedTables, setOccupiedTables] = useState(0);
  const [totalTables, setTotalTables] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchBadges() {
      try {
        const [ordersRes, tablesRes] = await Promise.all([
          fetch("/api/orders").catch(() => null),
          fetch("/api/tables").catch(() => null),
        ]);

        if (ordersRes?.ok) {
          const ordersData = await ordersRes.json();
          const list = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
          const pending = list.filter((o: any) => o.status === "pending").length;
          const kitchen = list.filter((o: any) => o.status === "preparing" || o.status === "ready").length;
          setPendingCount(pending);
          setKitchenCount(kitchen);
        }

        if (tablesRes?.ok) {
          const tablesData = await tablesRes.json();
          const list = Array.isArray(tablesData) ? tablesData : tablesData.tables || [];
          setTotalTables(list.length);
          setOccupiedTables(list.filter((t: any) => t.status === "occupied").length);
        }
      } catch (err) {
        console.error("Failed to fetch badges", err);
      }
    }

    fetchBadges();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 select-none font-sans text-slate-900">
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Full-Height RIGHT Slide Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-[310px] max-w-[85vw] bg-white text-slate-900 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-[#C3A27C]/30">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F2]">
            <img
              src="/chatchaska-logo.png"
              alt="ChatChaska"
              className="h-8 w-auto max-w-[160px] object-contain drop-shadow-2xs"
            />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-md bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer border border-[#C3A27C]/40 shadow-2xs"
              title="Close Menu"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Staff Info Banner */}
          <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#C3A27C]/20 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-black text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
              CC
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">Staff Terminal</h4>
              <p className="text-[11px] text-slate-500 font-medium truncate">ChatChaska POS</p>
            </div>
          </div>

          {/* Navigation Links with Sections */}
          <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar">
            {/* ESSENTIAL */}
            <div className="space-y-1">
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Essential
              </div>
              <Link
                href="/staff/pos"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/pos"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[20px] ${pathname === '/staff/pos' ? 'text-slate-950' : 'text-slate-600'}`}>point_of_sale</span>
                  <span className={`text-xs font-bold ${pathname === '/staff/pos' ? 'text-slate-950' : 'text-slate-800'}`}>POS Billing Terminal</span>
                </div>
              </Link>

              <Link
                href="/staff/orders"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/orders"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[20px] ${pathname === '/staff/orders' ? 'text-slate-950' : 'text-slate-600'}`}>receipt_long</span>
                  <span className={`text-xs font-bold ${pathname === '/staff/orders' ? 'text-slate-950' : 'text-slate-800'}`}>Orders Queue</span>
                </div>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-sm bg-amber-500 text-white font-black text-[11px] shadow-2xs">
                    {pendingCount}
                  </span>
                )}
              </Link>
            </div>

            {/* MORE TOOLS */}
            <div className="space-y-1">
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                More Tools
              </div>
              <Link
                href="/staff/kitchen"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/kitchen"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[20px] ${pathname === '/staff/kitchen' ? 'text-slate-950' : 'text-slate-600'}`}>soup_kitchen</span>
                  <span className={`text-xs font-bold ${pathname === '/staff/kitchen' ? 'text-slate-950' : 'text-slate-800'}`}>Kitchen Display (KDS)</span>
                </div>
                {kitchenCount > 0 && (
                  <span className="px-2 py-0.5 rounded-sm bg-slate-900 text-white font-black text-[11px]">
                    {kitchenCount}
                  </span>
                )}
              </Link>

              <Link
                href="/staff/tables"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/tables"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[20px] ${pathname === '/staff/tables' ? 'text-slate-950' : 'text-slate-600'}`}>grid_view</span>
                  <span className={`text-xs font-bold ${pathname === '/staff/tables' ? 'text-slate-950' : 'text-slate-800'}`}>Tables Floor Map</span>
                </div>
                {totalTables > 0 && (
                  <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-200 font-bold text-[11px]">
                    {occupiedTables}/{totalTables}
                  </span>
                )}
              </Link>

              <Link
                href="/staff/history"
                onClick={onClose}
                className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
                  pathname === "/staff/history"
                    ? "bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]"
                    : "text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[20px] ${pathname === '/staff/history' ? 'text-slate-950' : 'text-slate-600'}`}>history</span>
                  <span className={`text-xs font-bold ${pathname === '/staff/history' ? 'text-slate-950' : 'text-slate-800'}`}>Bill History & Sales</span>
                </div>
              </Link>

              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-md text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 transition-all border border-transparent"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px] text-slate-600">settings</span>
                  <span className="text-xs font-bold text-slate-800">Cafe Admin Console</span>
                </div>
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom Exit */}
        <div className="p-3 border-t border-slate-200 bg-[#FAF7F2]">
          <Link
            href="/login?logout=true"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-white hover:bg-rose-50 border border-rose-300 text-rose-600 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px] text-rose-600">logout</span>
            <span className="text-rose-600 font-bold">Exit Terminal / Logout</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}

export default StaffNavigationDrawer;
