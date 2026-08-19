'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './OperationsPanel.module.css';

interface OperationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OperationItem {
  id: string;
  title: string;
  category: 'quick' | 'settings';
  icon: string;
  href: string;
}

const operationsList: OperationItem[] = [
  // Quick Access
  { id: 'pos', title: 'POS Terminal', category: 'quick', icon: 'restaurant_menu', href: '/pos' },
  { id: 'table_map', title: 'Table View Map', category: 'quick', icon: 'grid_view', href: '/floorplan' },
  { id: 'kds', title: 'Kitchen Display (KDS)', category: 'quick', icon: 'soup_kitchen', href: '/kitchen' },
  { id: 'reports', title: 'Order History & Reports', category: 'quick', icon: 'analytics', href: '/pos/history' },

  // System & Settings
  { id: 'shifts', title: 'Staff & Shift Register', category: 'settings', icon: 'point_of_sale', href: '/settings/system' },
  { id: 'receipt_config', title: 'Thermal Receipt Setup', category: 'settings', icon: 'print', href: '/settings/receipt-config' },
  { id: 'gst', title: 'GST & Tax Configuration', category: 'settings', icon: 'receipt_long', href: '/settings/gst' },
  { id: 'kitchen_stations', title: 'Kitchen KOT Routing', category: 'settings', icon: 'local_fire_department', href: '/settings/kitchen-stations' },
  { id: 'desktop', title: 'Desktop & Tray Settings', category: 'settings', icon: 'desktop_windows', href: '/settings/desktop' },
  { id: 'backup', title: 'Database Backup & Restore', category: 'settings', icon: 'cloud_upload', href: '/settings/backup' },
];

export function OperationsPanel({ isOpen, onClose }: OperationsPanelProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredOps = operationsList.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickOps = filteredOps.filter((o) => o.category === 'quick');
  const settingsOps = filteredOps.filter((o) => o.category === 'settings');

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <span className="material-symbols-outlined text-blue-600">apps</span>
            Operations Panel
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search Input */}
        <div className={styles.searchBar}>
          <div className={styles.searchInputBox}>
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search operations & settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Operations Grid */}
        <div className={styles.content}>
          {quickOps.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Quick Access</div>
              <div className={styles.grid}>
                {quickOps.map((op) => (
                  <Link key={op.id} href={op.href} onClick={onClose} className={styles.actionCard}>
                    <div className={styles.iconWrapper}>
                      <span className="material-symbols-outlined">{op.icon}</span>
                    </div>
                    <span className={styles.cardLabel}>{op.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {settingsOps.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>System & Administration</div>
              <div className={styles.grid}>
                {settingsOps.map((op) => (
                  <Link key={op.id} href={op.href} onClick={onClose} className={styles.actionCard}>
                    <div className={styles.iconWrapper}>
                      <span className="material-symbols-outlined">{op.icon}</span>
                    </div>
                    <span className={styles.cardLabel}>{op.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filteredOps.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm font-semibold">
              No matching operations found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
