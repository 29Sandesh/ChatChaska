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
  { id: 'reports', label: 'Sales', href: '/admin/reports', icon: 'analytics' },
  { id: 'staff', label: 'Staff', href: '/admin/staff', icon: 'badge' },
  { id: 'settings', label: 'Settings', href: '/admin/settings/gst', icon: 'settings' },
];

export function AdminSidebar({
  isCollapsed = false,
  onToggleCollapse,
}: {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'hidden md:flex bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex-col p-3 z-40 transition-all duration-300 overflow-y-auto no-scrollbar shadow-sm select-none',
        isCollapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Brand Header */}
      <div className={cn('flex items-center justify-between mb-4 pb-2 border-b border-slate-100', isCollapsed ? 'px-0 justify-center' : 'px-1')}>
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/chaska-c-logo.png"
            alt="Chaska"
            className="w-9 h-9 rounded-xl object-contain flex-shrink-0 shadow-2xs"
          />
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-display font-black text-slate-900 text-base leading-tight tracking-tight truncate">
                ChatChaska
              </div>
              <div className="font-body-sm text-[11px] text-slate-500 font-semibold truncate">
                Cafe Admin
              </div>
            </div>
          )}
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

      {/* Staff Portal Switch Link */}
      {!isCollapsed ? (
        <Link href="/staff/pos" className="mb-4">
          <div className="w-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-200">
            <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            Open Staff POS
          </div>
        </Link>
      ) : (
        <Link href="/staff/pos" className="mb-4 flex justify-center">
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

      {/* Sidebar Footer */}
      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 px-1">
        {!isCollapsed && (
          <Link href="/login" className="flex items-center gap-1 font-bold text-slate-500 hover:text-rose-600 text-xs">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Logout
          </Link>
        )}
      </div>
    </aside>
  );
}

