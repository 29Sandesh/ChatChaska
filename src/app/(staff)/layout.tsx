'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            router.push('/staff/pos');
            break;
          case '2':
            e.preventDefault();
            router.push('/staff/orders');
            break;
          case '3':
            e.preventDefault();
            router.push('/staff/kitchen');
            break;
          case '4':
            e.preventDefault();
            router.push('/staff/tables');
            break;
          case '5':
            e.preventDefault();
            router.push('/staff/history');
            break;
          case '6':
            e.preventDefault();
            router.push('/staff/shift');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-hidden">
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {children}
      </main>
      <OfflineBanner />
    </div>
  );
}
