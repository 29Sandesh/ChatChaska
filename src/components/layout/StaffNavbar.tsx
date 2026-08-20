'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavLinkItem[] = [
  { id: 'pos', label: 'POS Billing', href: '/staff/pos', icon: 'point_of_sale' },
  { id: 'tables', label: 'Tables', href: '/staff/tables', icon: 'grid_view' },
  { id: 'orders', label: 'Orders', href: '/staff/orders', icon: 'receipt_long' },
  { id: 'kitchen', label: 'Kitchen Display', href: '/staff/kitchen', icon: 'soup_kitchen' },
  { id: 'history', label: 'Bill History', href: '/staff/history', icon: 'history' },
];

export function StaffNavbar() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.href = '/login?logout=true';
  };

  // If on POS page, the POS page has its own top header with search & filters
  // but we provide a floating drawer trigger if needed.
  const isPOS = pathname === '/staff/pos';

  return (
    <>
      {!isPOS && (
        <header className="h-16 bg-white border-b border-[#EBEBEB] px-5 flex items-center justify-between gap-4 shrink-0 select-none shadow-2xs z-30 sticky top-0">
          {/* Left: Official Logo */}
          <div className="flex items-center gap-4">
            <Link href="/staff/pos" className="flex items-center">
              <img
                src="/chatchaska-logo.png"
                alt="ChatChaska"
                className="h-8 w-auto max-w-[160px] object-contain"
              />
            </Link>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-[#FAF9F7] p-1 rounded-2xl border border-slate-200/80">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  )}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick POS Return + CC Avatar + Hamburger Menu ☰ */}
          <div className="flex items-center gap-3">
            <Link
              href="/staff/pos"
              className="px-3.5 py-2 bg-[#F8EFE7] hover:bg-[#F2E5D9] text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              <span>Back to POS</span>
            </Link>

            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs">
              CC
            </div>

            <button
              type="button"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-900 transition-all cursor-pointer"
              title="Navigation Menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          </div>
        </header>
      )}

      {/* Slide-out Navigation Drawer (Accessible on all pages when clicking ☰) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
          />

          {/* Slide Drawer */}
          <div className="relative w-72 max-w-full bg-white h-full shadow-2xl p-5 flex flex-col justify-between z-10 border-l border-slate-200 animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <img
                  src="/chatchaska-logo.png"
                  alt="ChatChaska"
                  className="h-7 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2">
                  Staff Terminal
                </span>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all',
                        isActive
                          ? 'bg-black text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Management Links */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2">
                  Administration
                </span>
                <Link
                  href="/admin"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    storefront
                  </span>
                  <span>Cafe Admin Panel</span>
                </Link>
                <Link
                  href="/admin/settings/profile"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    settings
                  </span>
                  <span>Cafe Settings</span>
                </Link>
              </div>
            </div>

            {/* Bottom: User & Logout */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                  CC
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">
                    Staff Terminal
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    Logged in
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  logout
                </span>
                <span>Exit Terminal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
