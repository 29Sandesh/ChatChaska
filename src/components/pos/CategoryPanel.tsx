'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import styles from './CategoryPanel.module.css';

export interface CategoryInfo {
  id: string;
  name: string;
  count: number;
}

interface CategoryPanelProps {
  categories: CategoryInfo[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

/**
 * CategoryPanel component displays a vertical list of menu categories on the left side of the POS.
 */
export function CategoryPanel({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryPanelProps) {
  return (
    <aside className={styles.panel}>
      <div className={styles.categoryList}>
        <button
          className={cn(
            styles.categoryItem,
            selectedCategory === 'ALL' && styles.active
          )}
          onClick={() => onSelectCategory('ALL')}
        >
          <span>All Items</span>
        </button>
        
        <button
          className={cn(
            styles.categoryItem,
            selectedCategory === 'FAVORITES' && styles.active
          )}
          onClick={() => onSelectCategory('FAVORITES')}
        >
          <span>★ Favorites</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            className={cn(
              styles.categoryItem,
              selectedCategory === cat.id && styles.active
            )}
            onClick={() => onSelectCategory(cat.id)}
          >
            <span className="truncate">{cat.name}</span>
            {cat.count > 0 && <span className={styles.countBadge}>{cat.count}</span>}
          </button>
        ))}
      </div>
    </aside>
  );
}
