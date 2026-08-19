'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { icon: 'receipt_long', label: 'POS Terminal', href: '/pos' },
  { icon: 'cooking', label: 'Kitchen Display', href: '/kitchen' },
  { icon: 'grid_view', label: 'Table Map', href: '/floorplan' },
  { icon: 'history', label: 'Order History', href: '/pos/history' },
  { icon: 'settings', label: 'Settings', href: '/settings/system' },
];

export function Sidebar({
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
        'hidden md:flex bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex-col p-3 z-40 transition-all duration-300 overflow-y-auto no-scrollbar shadow-sm',
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
                Restaurant POS
              </div>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
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

      {/* POS Quick Action */}
      {!isCollapsed ? (
        <Link href="/pos" className="mb-4">
          <Button fullWidth icon="add_shopping_cart" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            Open POS Terminal
          </Button>
        </Link>
      ) : (
        <Link href="/pos" className="mb-4 flex justify-center">
          <button
            className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm hover:scale-105 transition-transform"
            title="Open POS Terminal"
          >
            +
          </button>
        </Link>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
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
          <span className="font-semibold text-[11px] text-slate-400">Offline-Ready POS v2</span>
        )}
      </div>
    </aside>
  );
}
