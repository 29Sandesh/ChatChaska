'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface StaffNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  {
    href: '/staff/pos',
    label: 'POS Billing Terminal',
    description: 'Create bills, KOTs & take orders',
    icon: 'point_of_sale',
  },
  {
    href: '/staff/tables',
    label: 'Tables Floor Map',
    description: 'Live table occupancy & status',
    icon: 'grid_view',
  },
  {
    href: '/staff/orders',
    label: 'Orders Queue',
    description: 'Incoming table QR & counter tickets',
    icon: 'receipt_long',
  },
  {
    href: '/staff/kitchen',
    label: 'Kitchen Display (KDS)',
    description: 'Live cooking orders & timers',
    icon: 'soup_kitchen',
  },
  {
    href: '/staff/history',
    label: 'Bill History & Sales',
    description: 'Past receipts, EOD & daily reports',
    icon: 'history',
  },
  {
    href: '/staff/shift',
    label: 'Shift & Cash Drawer',
    description: 'Opening float, Z-reading & reconciliation',
    icon: 'point_of_sale',
  },
  {
    href: '/admin',
    label: 'Cafe Admin Console',
    description: 'Menu, UPI QR, Printer & Staff setup',
    icon: 'settings',
  },
];

export function StaffNavigationDrawer({ isOpen, onClose }: StaffNavigationDrawerProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 select-none font-sans">
      {/* 1. Backdrop Overlay to Hide/Dim the Rest of Page */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* 2. Full-Height RIGHT Slide Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-[310px] max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-[#C3A27C]/30">
        {/* Top Header with Logo & Close Button */}
        <div>
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

          {/* Navigation Links (Box Shaped with #C3A27C Beige) */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-start gap-3 p-3 rounded-md transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]'
                      : 'text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                      isActive ? 'text-slate-950 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {link.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-snug">{link.label}</div>
                    <div className={`text-[11px] font-normal leading-tight mt-0.5 ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                      {link.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Exit / Logout Link */}
        <div className="p-3 border-t border-slate-100 bg-[#FAF7F2]">
          <Link
            href="/login?logout=true"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Exit Terminal / Logout</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
