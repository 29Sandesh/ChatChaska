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
  { id: 'orders', label: 'Orders', href: '/staff/orders', icon: 'receipt_long' },
  { id: 'kitchen', label: 'Kitchen Display', href: '/staff/kitchen', icon: 'soup_kitchen' },
  { id: 'tables', label: 'Table Map', href: '/staff/tables', icon: 'grid_view' },
  { id: 'shift', label: 'Shift / Cash Drawer', href: '/staff/shift', icon: 'point_of_sale' },
  { id: 'live', label: 'Live Orders', href: '/staff/live', icon: 'visibility' },
  { id: 'history', label: 'Order History', href: '/staff/history', icon: 'history' },
];

export function StaffRightSidebar({
  isExpanded = false,
  onToggleExpand,
}: {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.href = '/login?logout=true';
  };

  return (
    <aside
      className={cn(
        'fixed right-0 top-0 bottom-0 z-50 bg-white border-l border-slate-200 flex flex-col p-3 shadow-2xl transition-all duration-300 select-none overflow-visible',
        isExpanded ? 'w-[240px]' : 'w-[72px]'
      )}
    >
      {/* Floating Toggle Arrow Button - Centered Vertically on Left Edge */}
      {onToggleExpand && (
        <button
          onClick={onToggleExpand}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-7 rounded-md bg-white border border-slate-300 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all z-50 cursor-pointer"
          title={isExpanded ? 'Collapse Panel' : 'Expand Panel'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isExpanded ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      )}

      {/* Header / Brand */}
      <div className={cn('flex items-center pb-3 mb-3 border-b border-slate-100', isExpanded ? 'px-1' : 'justify-center')}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs shadow-xs flex-shrink-0">
            CC
          </div>
          {isExpanded && (
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-sm leading-tight truncate">
                Staff Portal
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {staffNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center transition-all',
                isExpanded
                  ? 'gap-3 px-3 py-2.5 rounded-md text-xs font-bold'
                  : 'justify-center p-2.5 rounded-md text-center',
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
              title={!isExpanded ? item.label : undefined}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {isExpanded && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Exit Button */}
      <div className="pt-3 mt-auto border-t border-slate-100">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center text-xs font-bold text-slate-500 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer',
            isExpanded ? 'gap-2 px-3 py-2.5' : 'justify-center p-2.5'
          )}
          title="Exit / Logout"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
