'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface StaffNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const staffNavItems: StaffNavItem[] = [
  { id: 'pos', label: 'POS Billing', href: '/staff/pos', icon: 'restaurant_menu' },
  { id: 'orders', label: 'Waiter Order Pad', href: '/staff/orders', icon: 'tablet_mac' },
  { id: 'kitchen', label: 'Kitchen Display', href: '/staff/kitchen', icon: 'soup_kitchen' },
  { id: 'tables', label: 'Table Map', href: '/staff/tables', icon: 'grid_view' },
  { id: 'live', label: 'Live Orders', href: '/staff/live', icon: 'visibility' },
  { id: 'history', label: 'Order History', href: '/staff/history', icon: 'receipt_long' },
  { id: 'shift', label: 'Shift Register', href: '/staff/shift', icon: 'point_of_sale' },
];

export function StaffTopBar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 select-none">
      {/* Left: Brand */}
      <div className="flex items-center gap-2">
        <img
          src="/chaska-c-logo.png"
          alt="Chaska"
          className="w-8 h-8 rounded-lg object-contain shadow-2xs"
        />
        <span className="font-black text-slate-900 text-sm hidden sm:inline tracking-tight">ChatChaska Staff</span>
      </div>

      {/* Middle: Navigation Links */}
      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
        {staffNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right: Switch Portal / Logout */}
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          title="Switch Role / Logout"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="hidden md:inline">Exit</span>
        </Link>
      </div>
    </header>
  );
}
