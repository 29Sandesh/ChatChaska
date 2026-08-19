'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { OperationsPanel } from '@/components/pos/OperationsPanel';
import styles from './POSLayout.module.css';

interface POSLayoutProps {
  children: React.ReactNode;
  heldCount?: number;
  onOpenHeld?: () => void;
  onNewOrder?: () => void;
}

/**
 * POSLayout wraps the Point of Sale screens with a clean, functional top header bar.
 */
export function POSLayout({ children, heldCount = 0, onOpenHeld, onNewOrder }: POSLayoutProps) {
  const pathname = usePathname();
  const [isOpsOpen, setIsOpsOpen] = useState<boolean>(false);

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <div className={styles.mainBar}>
          <div className={styles.leftSection}>
            <div className={styles.logo}>
              <img
                src="/chaska-c-logo.png"
                alt="Chaska"
                className="w-7 h-7 rounded-lg object-contain"
              />
              <span className="font-black tracking-tight">ChatChaska POS</span>
            </div>
            <button className={styles.menuBtn} onClick={() => setIsOpsOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
              Operations
            </button>
            <button className={styles.newOrderBtn} onClick={onNewOrder}>
              + New Order
            </button>
          </div>

          <div className={styles.rightSection}>
            <Link href="/table-orders" className={cn(styles.navItem, pathname === '/table-orders' && styles.active)}>
              <span className="material-symbols-outlined">visibility</span>
              Live View
            </Link>

            <Link href="/pos/history" className={cn(styles.navItem, pathname?.startsWith('/pos/history') && styles.active)}>
              <span className="material-symbols-outlined">receipt_long</span>
              Orders & Reports
            </Link>

            <button className={styles.navItem} onClick={onOpenHeld}>
              <span className="material-symbols-outlined">pause_circle</span>
              Hold Bills
              {heldCount > 0 && <span className={styles.badge}>{heldCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        {children}
      </main>

      {/* Operations Slide-Over Panel */}
      <OperationsPanel isOpen={isOpsOpen} onClose={() => setIsOpsOpen(false)} />
    </div>
  );
}
