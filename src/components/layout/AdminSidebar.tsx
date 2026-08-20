'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const adminNavItems: AdminNavItem[] = [
  { id: 'dashboard', label: 'My Cafe', href: '/admin', icon: 'dashboard' },
  { id: 'menu', label: 'Menu', href: '/admin/menu', icon: 'restaurant_menu' },
  { id: 'reservations', label: 'Bookings', href: '/admin/reservations', icon: 'table_restaurant' },
  { id: 'qr-codes', label: 'QR Codes', href: '/admin/qr-codes', icon: 'qr_code_2' },
  { id: 'menu-preview', label: 'Menu Preview', href: '/admin/menu-preview', icon: 'visibility' },
  { id: 'reviews', label: 'Reviews', href: '/admin/reviews', icon: 'reviews' },
  { id: 'reports', label: 'Sales', href: '/admin/reports', icon: 'analytics' },
  { id: 'staff', label: 'Staff', href: '/admin/staff', icon: 'badge' },
  { id: 'settings', label: 'Settings', href: '/admin/settings/profile', icon: 'settings' },
];

export function AdminSidebar({
  isCollapsed = false,
  onToggleCollapse,
}: {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
        'hidden md:flex bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex-col p-3 z-40 transition-all duration-300 overflow-y-auto no-scrollbar shadow-sm select-none',
        isCollapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Brand Header */}
      <div className={cn('flex items-center justify-between mb-4 pb-2 border-b border-slate-100', isCollapsed ? 'px-0 justify-center' : 'px-1')}>
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/chatchaska-logo.png"
            alt="ChatChaska"
            className={cn('object-contain transition-all', isCollapsed ? 'w-8 h-8' : 'h-8 w-auto max-w-[140px]')}
          />
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95',
              isCollapsed && 'mt-1'
            )}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCollapsed ? 'menu' : 'menu_open'}
            </span>
          </button>
        )}
      </div>

      {/* Quick POS Mode Card */}
      {!isCollapsed ? (
        <Link
          href="/staff/pos"
          className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all mb-4 group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
            <span>Billing POS Terminal</span>
          </div>
          <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
        </Link>
      ) : (
        <Link href="/staff/pos" className="flex justify-center mb-4 cursor-pointer">
          <div
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 flex items-center justify-center font-bold transition-all border border-slate-200"
            title="Open Staff POS"
          >
            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
          </div>
        </Link>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'sidebar-link group flex items-center transition-all',
                isCollapsed ? 'justify-center p-2.5 rounded-xl text-center' : 'gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[20px]',
                  isActive ? 'icon-filled text-blue-600' : 'text-slate-400 group-hover:text-slate-600 transition-colors'
                )}
              >
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer with Real Logout */}
      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 px-1">
        {!isCollapsed ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-rose-600 text-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center text-slate-400 hover:text-rose-600 py-1 cursor-pointer"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
