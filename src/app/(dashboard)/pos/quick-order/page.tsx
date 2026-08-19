'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './captain.module.css';

interface TableItem {
  id: string;
  name: string;
  status: string;
}

interface MenuItemData {
  id: string;
  name: string;
  category: string;
  price: number;
  veg?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function WaiterCaptainAppPage() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('T1');
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Fetch tables & menu items
  useEffect(() => {
    async function loadData() {
      try {
        const [tablesRes, menuRes] = await Promise.all([
          fetch('/api/tables'),
          fetch('/api/menu-items'),
        ]);
        const tablesData = await tablesRes.json();
        const menuData = await menuRes.json();

        if (tablesData.tables) {
          setTables(tablesData.tables.map((t: any) => ({ id: t.id, name: t.name, status: t.status })));
          if (tablesData.tables.length > 0) {
            setSelectedTable(tablesData.tables[0].name);
          }
        }

        if (menuData.items) {
          setMenuItems(
            menuData.items.map((i: any) => ({
              id: i.id,
              name: i.name,
              category: i.category,
              price: i.price,
              veg: Boolean(i.veg),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load captain app data:', err);
      }
    }
    loadData();
  }, []);

  // Compute categories
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    menuItems.forEach((i) => cats.add(i.category));
    return Array.from(cats);
  }, [menuItems]);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart operations
  const handleAddItem = (item: MenuItemData) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.id === item.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Send KOT to Kitchen
  const handleSendKOT = async () => {
    if (cart.length === 0) return;
    const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: selectedTable,
          items: cart.map((c) => ({ id: c.id, name: c.name, quantity: c.quantity, price: c.price })),
          totalAmount,
          status: 'pending',
        }),
      });

      if (res.ok) {
        // Update table status to running
        await fetch('/api/tables', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: `table-${selectedTable.toLowerCase()}`, status: 'running' }),
        }).catch(() => {});

        showToast(`🔥 KOT sent for ${selectedTable}!`);
        setCart([]);
      }
    } catch (err) {
      console.error('KOT send failed:', err);
      showToast('Failed to send KOT');
    }
  };

  const totalCartCount = cart.reduce((acc, c) => acc + c.quantity, 0);
  const totalCartPrice = cart.reduce((acc, c) => acc + c.price * c.quantity, 0);

  return (
    <div className={styles.container}>
      {/* Mobile Top Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <Link href="/pos" className="text-zinc-400 hover:text-white flex items-center mr-1">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <span className="material-symbols-outlined text-[24px]">smartphone</span>
          ChatChaska Captain
        </div>
        <span className="text-xs font-bold text-zinc-400">Waiter: Rahul</span>
      </div>

      {/* Table Selector Bar */}
      <div className={styles.tableSelectorBar}>
        {tables.map((t) => (
          <button
            key={t.id}
            className={`${styles.tableChip} ${selectedTable === t.name ? styles.selected : ''}`}
            onClick={() => setSelectedTable(t.name)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Search & Category Bar */}
      <div className={styles.searchAndCatBar}>
        <div className={styles.searchBox}>
          <span className="material-symbols-outlined text-zinc-500 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.categoryScroll}>
          <button
            className={`${styles.catChip} ${selectedCategory === 'ALL' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              className={`${styles.catChip} ${selectedCategory === cat ? styles.active : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Item List */}
      <div className={styles.itemList}>
        {filteredItems.map((item) => {
          const cartEntry = cart.find((c) => c.id === item.id);
          return (
            <div key={item.id} className={styles.itemCard}>
              <div className={styles.itemMeta}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemPrice}>₹{item.price}</span>
              </div>

              {cartEntry ? (
                <div className={styles.qtyControls}>
                  <button className={styles.qtyBtn} onClick={() => handleUpdateQty(item.id, -1)}>
                    -
                  </button>
                  <span className="font-bold text-sm">{cartEntry.quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => handleUpdateQty(item.id, 1)}>
                    +
                  </button>
                </div>
              ) : (
                <button className={styles.addBtn} onClick={() => handleAddItem(item)}>
                  + Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Cart Footer */}
      <div className={styles.stickyFooter}>
        <div className={styles.cartTotal}>
          <span className={styles.cartTotalCount}>
            {selectedTable} • {totalCartCount} items
          </span>
          <span className={styles.cartTotalAmount}>₹{totalCartPrice}</span>
        </div>

        <button
          className={styles.sendKotBtn}
          onClick={handleSendKOT}
          disabled={cart.length === 0}
        >
          <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
          Send KOT
        </button>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-2 rounded-lg border border-zinc-700 text-xs font-bold z-50 shadow-2xl animate-in fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
