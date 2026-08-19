'use client';

import React from 'react';
import styles from './MenuItemGrid.module.css';

export interface MenuItemData {
  id: string;
  name: string;
  category: string;
  price: number;
  available?: boolean;
  popular?: boolean;
  veg?: boolean;
  jain?: boolean;
}

export type DietaryFilter = 'ALL' | 'VEG' | 'NON_VEG' | 'JAIN';

interface MenuItemGridProps {
  items: MenuItemData[];
  onSelectItem: (item: MenuItemData) => void;
}

export function MenuItemGrid({
  items,
  onSelectItem,
}: MenuItemGridProps) {
  return (
    <div className={styles.container}>
      {/* Grid Content */}
      <div className={styles.gridContent}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined text-[48px] mb-2 text-slate-400">set_meal</span>
            <p className="font-semibold text-slate-500 text-xs">No menu items found</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={styles.itemCard}
              onClick={() => onSelectItem(item)}
            >
              <div className={styles.itemHeader}>
                <span className={styles.itemName}>{item.name}</span>
              </div>

              <div className={styles.itemFooter}>
                <span className={styles.itemPrice}>₹{item.price}</span>
                {item.veg !== undefined && (
                  <div className={item.veg ? styles.vegDot : styles.nonVegDot} title={item.jain ? 'Jain Available' : item.veg ? 'Pure Veg' : 'Non-Veg'}>
                    <div className={item.veg ? styles.vegDotInner : styles.nonVegDotInner} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
