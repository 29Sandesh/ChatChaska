'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

const navLinks: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard Overview', href: '/owner-console' },
  { icon: 'key', label: 'API Keys & Secrets', href: '/owner-console/api-keys' },
  { icon: 'group', label: 'All Users & Shops', href: '/owner-console/users' },
  { icon: 'payments', label: 'Revenue & Billing', href: '/owner-console/revenue' },
  { icon: 'monitor_heart', label: 'Infrastructure Health', href: '/owner-console/infrastructure' },
  { icon: 'history', label: 'Audit Trail', href: '/owner-console/audit' },
  { icon: 'settings', label: 'Platform Settings', href: '/owner-console/settings' },
];

export function OwnerSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('owner-auth');
    window.location.reload();
  };

  return (
    <aside className="hidden md:flex flex-col w-[260px] bg-[#101625] border-r border-slate-800/80 h-screen fixed left-0 top-0 p-4 gap-2 z-40 overflow-y-auto text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6 px-2 py-3 border-b border-slate-800/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/chaska-c-logo.png"
          alt="Chaska Logo"
          className="w-10 h-10 object-contain rounded-xl shadow-2xs"
        />
        <div>
          <div className="font-display font-black text-indigo-400 text-sm leading-tight tracking-tight">
            ChatChaska Console
          </div>
          <div className="font-body-sm text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[10px] text-emerald-400 icon-filled">lock</span>
            <span>Platform Owner</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-slate-800/40 hover:text-white',
                isActive
                  ? 'bg-indigo-600/90 text-white font-bold border border-indigo-500/25 shadow-lg shadow-indigo-650/15'
                  : 'text-slate-400'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[18px]',
                  isActive ? 'text-white' : 'text-slate-500'
                )}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-auto pt-4 border-t border-slate-800/60 flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-500">arrow_back</span>
          <span>Back to App</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-350 transition-all text-left w-full"
        >
          <span className="material-symbols-outlined text-[18px] text-rose-500">logout</span>
          <span>Lock Console</span>
        </button>
      </div>
    </aside>
  );
}
