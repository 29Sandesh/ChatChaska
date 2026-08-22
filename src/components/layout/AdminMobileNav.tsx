'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'My Cafe Dashboard', icon: 'dashboard' },
  { href: '/admin/menu', label: 'Menu Manager', icon: 'restaurant_menu' },
  { href: '/admin/qr-codes', label: 'QR Codes', icon: 'qr_code_2' },
  { href: '/admin/menu-preview', label: 'Menu Preview', icon: 'phone_iphone' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'reviews' },
  { href: '/admin/reports', label: 'Sales & Reports', icon: 'bar_chart' },
  { href: '/admin/staff', label: 'Staff & PINs', icon: 'group' },
  { href: '/admin/settings/profile', label: 'Settings', icon: 'settings' },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Check if link is active (exact match or starts with for settings)
  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '/admin/settings/profile') return pathname.startsWith('/admin/settings');
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Top Bar - only visible below md */}
      <header className="md:hidden h-14 bg-white border-b border-[#EBEBEB] px-4 flex items-center justify-between shrink-0 shadow-2xs z-30 sticky top-0 select-none font-sans">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-900 cursor-pointer border border-slate-200"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <Link href="/admin" className="flex items-center">
          <img src="/chatchaska-logo.png" alt="ChatChaska" className="h-7 w-auto max-w-[140px] object-contain" />
        </Link>
        <Link
          href="/staff/pos"
          className="px-2.5 py-1 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all shadow-2xs border border-[#B2906A]"
        >
          <span className="material-symbols-outlined text-[14px]">point_of_sale</span>
          <span>POS</span>
        </Link>
      </header>

      {/* Full-screen Nav Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 select-none font-sans md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          />

          {/* Right Slide Panel */}
          <aside className="fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-[#C3A27C]/30">
            {/* Header */}
            <div>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF7F2]">
                <img src="/chatchaska-logo.png" alt="ChatChaska" className="h-7 w-auto max-w-[140px] object-contain" />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-md bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer border border-[#C3A27C]/40 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Owner Info */}
              <div className="px-4 py-3 bg-[#FAF7F2] border-b border-[#C3A27C]/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-black text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">CC</div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Owner Console</h4>
                  <p className="text-[11px] text-slate-500 font-medium truncate">Cafe Admin Panel</p>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar">
                {ADMIN_NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-md transition-all cursor-pointer ${
                      isActive(link.href)
                        ? 'bg-[#C3A27C] text-slate-950 font-bold shadow-2xs border border-[#B2906A]'
                        : 'text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] shrink-0 ${isActive(link.href) ? 'text-slate-950' : 'text-slate-500'}`}>{link.icon}</span>
                    <span className="text-xs font-bold">{link.label}</span>
                  </Link>
                ))}

                {/* Divider + POS Link */}
                <div className="border-t border-slate-200 my-2" />
                <Link
                  href="/staff/pos"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-md text-slate-700 hover:bg-[#FAF7F2] hover:text-slate-950 border border-transparent transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0 text-slate-500">point_of_sale</span>
                  <span className="text-xs font-bold">Switch to POS Terminal</span>
                </Link>
              </nav>
            </div>

            {/* Bottom: Logout */}
            <div className="p-3 border-t border-slate-100 bg-[#FAF7F2]">
              <Link
                href="/login?logout=true"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Logout</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
