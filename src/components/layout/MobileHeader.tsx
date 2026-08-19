'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MobileHeader() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();
  const activeRestaurantId = pathname?.match(/\/restaurants\/([^/]+)/)?.[1] || 'demo';

  const bottomTabs = [
    { icon: 'dashboard', label: 'Home', href: '/dashboard' },
    { icon: 'menu_book', label: 'Menu', href: `/restaurants/${activeRestaurantId}/items` },
    { icon: 'cooking', label: 'Kitchen', href: '/kitchen' },
    { icon: 'monitoring', label: 'Analytics', href: `/restaurants/${activeRestaurantId}/analytics` },
    { icon: 'more_horiz', label: 'More', href: '#' },
  ];

  const moreLinks = [
    { icon: 'category', label: 'Categories', href: `/restaurants/${activeRestaurantId}/categories` },
    { icon: 'preview', label: 'Live Preview', href: `/restaurants/${activeRestaurantId}/preview` },
    { icon: 'palette', label: 'Theme & Colors', href: `/restaurants/${activeRestaurantId}/themes` },
    { icon: 'qr_code_2', label: 'QR Codes', href: `/restaurants/${activeRestaurantId}/qr-codes` },
    { icon: 'grid_view', label: 'Table Map', href: '/floorplan' },
    { icon: 'event_seat', label: 'Reservations', href: '/reservations' },
    { icon: 'badge', label: 'Staff & Shifts', href: '/shifts' },
    { icon: 'group', label: 'Team Members', href: '/team' },
    { icon: 'inventory_2', label: 'Stock & Availability', href: '/inventory' },
    { icon: 'local_offer', label: 'Offers & Coupons', href: '/discounts' },
    { icon: 'workspace_premium', label: 'Loyalty Cards', href: '/loyalty' },
    { icon: 'campaign', label: 'Send Promos', href: '/marketing' },
    { icon: 'payments', label: 'My Plan', href: '/billing' },
    { icon: 'storefront', label: 'Restaurant Info', href: `/restaurants/${activeRestaurantId}/settings` },
    { icon: 'person', label: 'My Account', href: '/profile' },
  ];

  return (
    <>
      {/* Top Banner (Header Brand) on Mobile only */}
      <header className="mobile-header md:hidden flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 sticky top-0 z-50">
        <Link href="/dashboard" className="font-display font-black text-primary text-headline-md flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/chaska-c-logo.png" alt="Chaska Logo" className="w-8 h-8 object-contain rounded-xl shadow-2xs" />
          <span>ChatChaska</span>
        </Link>
        <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 flex items-center justify-center font-bold text-xs bg-primary-container text-on-primary-container">
          SG
        </Link>
      </header>

      {/* Fixed Bottom Navigation Bar on Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/95 backdrop-blur-md border-t border-outline-variant/10 flex items-center justify-around z-50 pb-safe shadow-lg">
        {bottomTabs.map((tab) => {
          const isMore = tab.icon === 'more_horiz';
          const isActive = isMore ? isMoreOpen : pathname === tab.href;

          return (
            <button
              key={tab.label}
              onClick={() => {
                if (isMore) {
                  setIsMoreOpen(!isMoreOpen);
                } else {
                  setIsMoreOpen(false);
                  window.location.href = tab.href;
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 text-on-surface-variant transition-all py-1.5',
                isActive ? 'text-primary' : 'opacity-70'
              )}
            >
              <span className={cn('material-symbols-outlined text-[22px]', isActive && 'icon-filled')}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-label-md tracking-wide font-bold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* "More" Drawer Panel sheet from bottom */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-fadeIn">
          {/* Dismiss Click Area */}
          <div className="flex-1" onClick={() => setIsMoreOpen(false)} />
          
          <div className="w-full bg-surface-container-lowest border-t border-outline-variant/20 rounded-t-3xl p-6 pb-24 shadow-2xl max-h-[70vh] overflow-y-auto space-y-4 animate-slideUp">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <span className="font-display font-bold text-lg text-on-surface">More Operations</span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              {moreLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface hover:bg-surface-container-low border border-outline-variant/10 text-center gap-1.5 transition-all text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-label-md font-bold leading-tight line-clamp-1">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
