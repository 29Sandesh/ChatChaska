'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CategoryPanel, CategoryInfo } from '@/components/pos/CategoryPanel';
import { MenuItemGrid, MenuItemData, DietaryFilter } from '@/components/pos/MenuItemGrid';
import { BillPanel, CartItem } from '@/components/pos/BillPanel';
import { HeldOrdersDrawer, HeldOrder } from '@/components/pos/HeldOrdersDrawer';
import { ReceiptPreviewModal, BillData } from '@/components/pos/ReceiptPreviewModal';
import { PaymentSettlementModal } from '@/components/pos/PaymentSettlementModal';
import { StaffNavigationDrawer } from '@/components/layout/StaffNavigationDrawer';
import { calculateBillTotals } from '@/lib/billing';
import { playOrderChime } from '@/lib/sound-fx';
import { cloudClient } from '@/lib/cloud-db';

function StaffPOSContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTableParam = searchParams.get('table');

  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [cart, setCart] = useState<CartItem[]>([
    { id: 'item-chai-default', name: 'Masala Chai', price: 60, quantity: 6, veg: true },
    { id: 'item-paneer-default', name: 'Paneer Tikka', price: 280, quantity: 3, veg: true },
  ]);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'PICKUP'>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<string>(initialTableParam || 'Table 1');
  const [waiterName, setWaiterName] = useState<string>('Staff');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Incoming QR Customer Orders state (badge counter)
  const [incomingOrdersCount, setIncomingOrdersCount] = useState<number>(0);

  // Left Navigation Drawer State (for Hamburger ☰)
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);

  // Modals / Drawers state
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [isHeldDrawerOpen, setIsHeldDrawerOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [initialTabCart, setInitialTabCart] = useState<CartItem[]>([]);
  const [generatedBill, setGeneratedBill] = useState<BillData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time listener for incoming customer QR orders
  useEffect(() => {
    try {
      const channel = cloudClient
        .channel('incoming-staff-orders')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'cloud_orders',
          },
          (payload: any) => {
            const newOrd = payload.new;
            if (newOrd && newOrd.status === 'pending') {
              playOrderChime();
              setIncomingOrdersCount((prev) => prev + 1);
              showToast(`🔔 New order received from ${newOrd.table_number || 'Table'}!`);
            }
          }
        )
        .subscribe();

      return () => {
        cloudClient.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Realtime subscription fallback:', e);
    }
  }, []);

  // State for dynamic categories
  const [dbCategories, setDbCategories] = useState<Array<{ id: string; name: string; visible: boolean; icon: string }>>([]);

  // Load menu items and dynamic categories
  useEffect(() => {
    async function loadData() {
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch('/api/menu-items'),
          fetch('/api/categories'),
        ]);
        const menuData = await menuRes.json();
        const catData = await catRes.json();

        if (menuData.items && menuData.items.length > 0) {
          setMenuItems(
            menuData.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              price: item.price,
              available: item.available !== false,
              popular: item.popular || false,
              bestseller: item.bestseller || false,
              veg: item.veg !== false,
              jain: item.jain || false,
            }))
          );
        }

        if (catData.categories) {
          setDbCategories(catData.categories);
        }
      } catch (err) {
        console.error('Failed to load menu data:', err);
      }
    }
    loadData();
  }, []);

  // Fetch held bills on mount
  const fetchHeldOrders = async () => {
    try {
      const res = await fetch('/api/held-orders');
      const data = await res.json();
      if (data.orders) setHeldOrders(data.orders);
    } catch (err) {
      console.error('Failed to fetch held orders:', err);
    }
  };

  useEffect(() => {
    fetchHeldOrders();
  }, []);

  // Compute category counts dynamically
  const categoriesList: CategoryInfo[] = useMemo(() => {
    const counts: Record<string, number> = {};
    menuItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    if (dbCategories.length > 0) {
      return dbCategories.map((c) => ({
        id: c.id,
        name: c.name,
        count: counts[c.id] || 0,
      }));
    }

    return [
      { id: 'starters', name: 'Starters & Tandoor', count: counts['starters'] || 36 },
      { id: 'main-course', name: 'Main Course & Curries', count: counts['main-course'] || 60 },
      { id: 'breads-rice', name: 'Breads, Rice & Biryani', count: counts['breads-rice'] || 50 },
      { id: 'soups-salads', name: 'Soups, Salads & Papad', count: counts['soups-salads'] || 30 },
      { id: 'raita-curd', name: 'Raita & Sides', count: counts['raita-curd'] || 20 },
      { id: 'indo-chinese', name: 'Indo-Chinese', count: counts['indo-chinese'] || 30 },
      { id: 'snacks-chaat', name: 'Chaat & Street Snacks', count: counts['snacks-chaat'] || 25 },
      { id: 'shakes-beverages', name: 'Shakes & Thick Drinks', count: counts['shakes-beverages'] || 20 },
      { id: 'desserts', name: 'Desserts & Sweets', count: counts['desserts'] || 18 },
      { id: 'drinks', name: 'Tea, Coffee & Beverages', count: counts['drinks'] || 12 },
    ];
  }, [menuItems, dbCategories]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory === 'FAVORITES') {
        if (!item.popular && !item.bestseller) return false;
      } else if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
      }

      // Dietary filter
      if (dietaryFilter === 'VEG' && !item.veg) return false;
      if (dietaryFilter === 'NON_VEG' && item.veg) return false;
      if (dietaryFilter === 'JAIN' && !item.jain) return false;

      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, dietaryFilter]);

  // Add Item to cart
  const handleSelectItem = (item: MenuItemData) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            veg: item.veg,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Hold current bill
  const handleHoldBill = async () => {
    if (cart.length === 0) return;
    const calc = calculateBillTotals({
      items: cart.map((c) => ({ price: c.price, quantity: c.quantity })),
      discountAmount,
      gstRate: 5,
    });

    const newHeld = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      tableNumber: selectedTable,
      waiterName: waiterName,
      items: cart.map((c) => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        unitPrice: c.price,
        lineTotal: c.price * c.quantity,
        veg: Boolean(c.veg),
      })),
      subtotal: calc.subtotal,
      grandTotal: calc.grandTotal,
    };

    try {
      const res = await fetch('/api/held-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHeld),
      });
      if (res.ok) {
        showToast(`⏸ Bill parked for ${selectedTable}`);
        setCart([]);
        fetchHeldOrders();
      }
    } catch (err) {
      console.error('Failed to hold order:', err);
    }
  };

  // Recall held bill
  const handleRecallOrder = async (held: HeldOrder) => {
    const restoredCart: CartItem[] = (held.items || []).map((i: any) => ({
      id: i.id || i.item?.id || String(Math.random()),
      name: i.name || i.item?.name || 'Item',
      price: i.unitPrice || i.item?.price || 0,
      quantity: i.quantity || 1,
      veg: i.veg,
    }));

    setCart(restoredCart);
    if (held.tableNumber) {
      setSelectedTable(held.tableNumber);
    }

    try {
      await fetch('/api/held-orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: held.id }),
      });
      fetchHeldOrders();
      setIsHeldDrawerOpen(false);
      showToast(`Recalled bill for ${held.tableNumber}`);
    } catch (err) {
      console.error('Failed to delete recalled order:', err);
    }
  };

  const handleDeleteHeldOrder = async (id: string) => {
    try {
      await fetch('/api/held-orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchHeldOrders();
      showToast('Parked bill deleted');
    } catch (err) {
      console.error('Failed to delete held order:', err);
    }
  };

  // Confirm payment settlement or pay later from Modal
  const handleConfirmPayment = async (details: {
    orderType: 'DINE_IN' | 'PICKUP';
    tableNumber: string;
    paymentMethod: 'cash' | 'upi' | 'card';
    customerName: string;
    customerPhone: string;
    txnReference?: string;
    isPayLater?: boolean;
  }) => {
    setIsPaymentModalOpen(false);

    const chosenTable = details.orderType === 'DINE_IN' ? details.tableNumber : 'Pick Up';

    const calc = calculateBillTotals({
      items: cart.map((c) => ({ price: c.price, quantity: c.quantity })),
      discountAmount,
      gstRate: 5,
    });

    const billItems = cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      price: item.price,
      lineTotal: item.price * item.quantity,
    }));

    if (details.isPayLater) {
      // Pay Later Flow: Save running order on table and notify kitchen
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableNumber: chosenTable,
            items: billItems,
            totalAmount: calc.grandTotal,
            status: 'pending',
            notes: `Pay Later (${details.customerName || 'Guest'})`,
          }),
        });

        if (res.ok) {
          if (details.orderType === 'DINE_IN') {
            await fetch('/api/tables', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: chosenTable, status: 'running' }),
            }).catch(() => {});
          }

          setCart([]);
          setInitialTabCart([]);
          setDiscountAmount(0);
          showToast(`⏳ Order saved for ${chosenTable} (Pay Later)`);
        } else {
          showToast('Failed to save order. Please retry.');
        }
      } catch (err) {
        console.error('Error in Pay Later flow:', err);
        showToast('Network error while placing order.');
      }
      return;
    }

    // Immediate Settle & Print Flow:
    const billPayload = {
      restaurantId: 'demo',
      restaurantName: 'ChatChaska Cafe',
      tableNumber: chosenTable,
      waiterName: waiterName,
      items: billItems,
      subtotal: calc.subtotal,
      gstPercent: 5,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      gstAmount: calc.totalTax,
      discountAmount: discountAmount,
      grandTotal: calc.grandTotal,
      paymentMode: details.paymentMethod,
      customerName: details.customerName,
      customerPhone: details.customerPhone,
      status: 'paid',
    };

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billPayload),
      });

      const data = await res.json();

      if (res.ok && data.bill) {
        if (details.orderType === 'DINE_IN') {
          await fetch('/api/tables', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: chosenTable, status: 'free' }),
          }).catch(() => {});
        }

        const newBillData: BillData = {
          billId: data.bill.id,
          tokenNumber: data.bill.tokenNumber || '01',
          restaurantName: 'ChatChaska Cafe',
          date: new Date().toLocaleString('en-IN'),
          tableNumber: chosenTable,
          waiterName: waiterName,
          items: billItems,
          subtotal: calc.subtotal,
          discountAmount: discountAmount,
          cgstRate: 2.5,
          sgstRate: 2.5,
          cgstAmount: calc.cgstAmount,
          sgstAmount: calc.sgstAmount,
          roundOff: calc.roundOff,
          grandTotal: calc.grandTotal,
          paymentMode: details.paymentMethod.toUpperCase(),
          customerName: details.customerName,
          customerPhone: details.customerPhone,
        };

        setGeneratedBill(newBillData);
        setIsReceiptModalOpen(true);

        setCart([]);
        setInitialTabCart([]);
        setDiscountAmount(0);
        showToast('🎉 Bill settled & printed successfully!');
      } else {
        showToast('Failed to save bill. Please retry.');
      }
    } catch (err) {
      console.error('Error saving bill:', err);
      showToast('Network error while saving bill.');
    }
  };

  // Keyboard Shortcuts (F1: Search, F5: Next)
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (cart.length > 0) setIsPaymentModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FAF9F7] overflow-hidden select-none font-sans">
      {/* 1. FULL-WIDTH TOP HEADER BAR */}
      <header className="h-16 bg-white border-b border-[#EBEBEB] px-5 flex items-center justify-between gap-4 shrink-0 select-none z-20">
        {/* BRAND LOGO ON FAR LEFT - SIZED TO PERFECTLY MATCH CATEGORIES PANEL WIDTH */}
        <div className="flex items-center justify-start w-[195px] shrink-0">
          <img
            src="/chatchaska-logo.png"
            alt="ChatChaska"
            className="h-8 w-auto max-w-[165px] object-contain drop-shadow-2xs"
          />
        </div>

        {/* RIGHT-ALIGNED CONTROLS: SEARCH + DIETARY FILTERS + TABLE ORDERS + MENU */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Search Input Box */}
          <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-xl px-3.5 py-1.5 text-xs w-[210px] xl:w-[240px] shadow-2xs focus-within:border-black transition-all">
            <span className="material-symbols-outlined text-[17px] text-slate-400">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search items... (F1)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-hidden w-full font-normal text-slate-900 placeholder:text-slate-400 text-xs"
            />
          </div>

          {/* Dietary Filter Buttons: All (black) | • Veg | • Non-Veg | • Jain */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDietaryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dietaryFilter === 'ALL'
                  ? 'bg-black text-white'
                  : 'bg-white text-slate-700 border border-[#E5E5E5] hover:bg-slate-50'
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setDietaryFilter('VEG')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                dietaryFilter === 'VEG'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                  : 'bg-white text-slate-700 border-[#E5E5E5] hover:border-emerald-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Veg</span>
            </button>

            <button
              type="button"
              onClick={() => setDietaryFilter('NON_VEG')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                dietaryFilter === 'NON_VEG'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold'
                  : 'bg-white text-slate-700 border-[#E5E5E5] hover:border-rose-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span>Non-Veg</span>
            </button>

            <button
              type="button"
              onClick={() => setDietaryFilter('JAIN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                dietaryFilter === 'JAIN'
                  ? 'border-amber-500 bg-amber-50 text-amber-700 font-bold'
                  : 'bg-white text-slate-700 border-[#E5E5E5] hover:border-amber-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span>Jain</span>
            </button>
          </div>

          {/* Table Orders Button (Direct Link to /staff/orders?filter=table) */}
          <Link
            href="/staff/orders?filter=table"
            className="relative flex items-center gap-1.5 bg-[#F8EFE7] hover:bg-[#F2E5D9] text-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[17px]">
              qr_code_2
            </span>
            <span>Table Orders</span>
            {incomingOrdersCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                {incomingOrdersCount}
              </span>
            )}
          </Link>

          {/* FAR RIGHT: HAMBURGER MENU ☰ -> OPENS LEFT SLIDE DRAWER */}
          <div className="relative pl-1">
            <button
              type="button"
              onClick={() => setIsNavDrawerOpen(true)}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-900 transition-all cursor-pointer"
              title="Navigation Menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Categories Sidebar (With Categories Heading + 2 View Switcher Buttons) */}
        <CategoryPanel
          categories={categoriesList}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Center Menu Dishes Grid */}
        <MenuItemGrid
          items={filteredItems}
          onSelectItem={handleSelectItem}
          viewMode={viewMode}
        />

        {/* Right Billing Panel (With 2 Buttons: Hold and Next) */}
        <BillPanel
          cart={cart}
          orderType={orderType}
          onOrderTypeChange={setOrderType}
          selectedTable={selectedTable}
          onTableSelect={setSelectedTable}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          discountAmount={discountAmount}
          onDiscountChange={setDiscountAmount}
          heldCount={heldOrders.length}
          onHold={handleHoldBill}
          onOpenHeld={() => setIsHeldDrawerOpen(true)}
          onNext={() => {
            if (cart.length === 0) {
              showToast('Order is empty! Add items first.');
              return;
            }
            setIsPaymentModalOpen(true);
          }}
        />
      </div>

      {/* Global Staff Left Navigation Drawer (Slides from left with dimmed backdrop) */}
      <StaffNavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
      />

      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold z-50 animate-in fade-in">
          {toastMessage}
        </div>
      )}

      <HeldOrdersDrawer
        isOpen={isHeldDrawerOpen}
        onClose={() => setIsHeldDrawerOpen(false)}
        heldOrders={heldOrders}
        onRecall={handleRecallOrder}
        onDeleteHeld={handleDeleteHeldOrder}
      />

      {/* Checkout & Payment Settlement Modal */}
      <PaymentSettlementModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        grandTotal={
          calculateBillTotals({
            items: cart.map((c) => ({ price: c.price, quantity: c.quantity })),
            discountAmount,
            gstRate: 5,
          }).grandTotal
        }
        tableNumber={selectedTable}
        orderType={orderType}
        itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onConfirm={handleConfirmPayment}
      />

      {generatedBill && (
        <ReceiptPreviewModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          billData={generatedBill}
        />
      )}
    </div>
  );
}

export default function StaffPOSPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-700 font-bold text-sm">Loading Staff POS...</div>}>
      <StaffPOSContent />
    </Suspense>
  );
}
