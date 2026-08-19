'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  expiryDate?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    unit: 'kg',
    currentStock: 10,
    minStock: 5,
    costPerUnit: 150,
  });
  const [notification, setNotification] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setItems(data.items);
      } else {
        // Seed default items if empty
        const defaults: InventoryItem[] = [
          { id: 'inv-1', name: 'Fresh Paneer', unit: 'kg', currentStock: 24, minStock: 5, costPerUnit: 350, expiryDate: '2026-08-18' },
          { id: 'inv-2', name: 'Hung Curd / Yogurt', unit: 'kg', currentStock: 2.5, minStock: 5, costPerUnit: 120, expiryDate: '2026-08-14' },
          { id: 'inv-3', name: 'Chicken Wings', unit: 'kg', currentStock: 0, minStock: 10, costPerUnit: 280, expiryDate: '2026-08-13' },
          { id: 'inv-4', name: 'Basmati Rice Special', unit: 'kg', currentStock: 45, minStock: 10, costPerUnit: 110 },
        ];
        for (const item of defaults) {
          await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });
        }
        setItems(defaults);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.unit) return;
    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      setIsModalOpen(false);
      setNotification('Ingredient saved to SQLite database.');
      fetchItems();
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const lowStockCount = items.filter((i) => i.currentStock <= i.minStock).length;

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      <TopBar
        title="Stock & Raw Material Inventory"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/inventory/recipes">
              <Button variant="secondary" className="text-xs">
                <span className="material-symbols-outlined text-[18px] mr-1">menu_book</span>
                Recipe Builder & Food Cost
              </Button>
            </Link>
            <Button
              icon="add"
              variant="primary"
              className="text-xs"
              onClick={() => setIsModalOpen(true)}
            >
              Add Raw Material
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Intro & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface">
              Raw Material Stock Tracker
            </h2>
            <p className="text-xs text-outline">
              Persistent inventory linked with recipe auto-deductions.
            </p>
          </div>

          <div className="relative w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search raw ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant/40 rounded-xl text-xs text-on-surface font-medium focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Low Stock Warning Banner */}
        {lowStockCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex justify-between items-center text-amber-900 dark:text-amber-300">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">
                warning
              </span>
              <div>
                <p className="font-bold text-xs uppercase tracking-wider">
                  Low Stock Threshold Alert
                </p>
                <p className="text-xs opacity-90">
                  {lowStockCount} raw material items are below minimum reorder thresholds.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="p-4">Raw Ingredient</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Min Threshold</th>
                <th className="p-4">Cost / Unit</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-xs font-semibold text-on-surface">
              {filtered.map((item) => {
                const isLow = item.currentStock <= item.minStock;
                const isOut = item.currentStock === 0;
                return (
                  <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-sm block">{item.name}</span>
                    </td>
                    <td className="p-4 font-black text-sm">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      {item.minStock} {item.unit}
                    </td>
                    <td className="p-4">{formatCurrency(item.costPerUnit)} / {item.unit}</td>
                    <td className="p-4 text-on-surface-variant">
                      {item.expiryDate || 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      {isOut ? (
                        <Badge variant="error">Out of Stock</Badge>
                      ) : isLow ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ingredient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Raw Material Ingredient"
        size="md"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-on-surface-variant block mb-1">
              Ingredient Name:
            </label>
            <input
              type="text"
              placeholder="e.g. Mustard Oil"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:border-primary font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">Unit:</label>
              <select
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface font-semibold"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="pcs">pcs</option>
                <option value="packet">packet</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">
                Cost per Unit (₹):
              </label>
              <input
                type="number"
                value={newItem.costPerUnit}
                onChange={(e) => setNewItem({ ...newItem, costPerUnit: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">
                Current Stock Qty:
              </label>
              <input
                type="number"
                value={newItem.currentStock}
                onChange={(e) => setNewItem({ ...newItem, currentStock: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">
                Min Reorder Threshold:
              </label>
              <input
                type="number"
                value={newItem.minStock}
                onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveItem}>
              Save Ingredient
            </Button>
          </div>
        </div>
      </Modal>

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-surface-container-highest border border-primary/30 text-on-surface rounded-2xl shadow-xl text-xs font-bold">
          {notification}
        </div>
      )}
    </div>
  );
}
