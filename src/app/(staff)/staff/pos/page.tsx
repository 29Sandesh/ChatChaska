'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CategoryPanel, CategoryInfo } from '@/components/pos/CategoryPanel';
import { MenuItemGrid, MenuItemData, DietaryFilter } from '@/components/pos/MenuItemGrid';
import { BillPanel, CartItem } from '@/components/pos/BillPanel';
import { HeldOrdersDrawer, HeldOrder } from '@/components/pos/HeldOrdersDrawer';
import { ReceiptPreviewModal, BillData } from '@/components/pos/ReceiptPreviewModal';
import { PaymentSettlementModal } from '@/components/pos/PaymentSettlementModal';
import { calculateBillTotals } from '@/lib/billing';
import { IncomingOrdersDrawer } from '@/components/staff/IncomingOrdersDrawer';
import { playOrderChime } from '@/lib/sound-fx';
import { cloudClient } from '@/lib/cloud-db';
import { CloudOrder } from '@/types';
import styles from '@/app/(dashboard)/pos/pos.module.css';

function StaffPOSContent() {
  const searchParams = useSearchParams();
  const initialTableParam = searchParams.get('table');

  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>('ALL');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'PICKUP'>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<string>(initialTableParam || 'T1');
  const [waiterName, setWaiterName] = useState<string>('Staff');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Incoming QR Customer Orders state
  const [incomingOrders, setIncomingOrders] = useState<CloudOrder[]>([]);
  const [isIncomingDrawerOpen, setIsIncomingDrawerOpen] = useState<boolean>(false);

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
              setIncomingOrders((prev) => [newOrd, ...prev]);
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

        if (menuData.items) {
          setMenuItems(
            menuData.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              price: item.price,
              available: Boolean(item.available),
              popular: Boolean(item.popular),
              veg: Boolean(item.veg),
              jain: Boolean(item.jain),
            }))
          );
        }

        if (catData.categories) {
          setDbCategories(catData.categories);
        }
      } catch (err) {
        console.error('Failed to load POS data:', err);
      }
    }
    loadData();
  }, []);

  // Compute category counts from menuItems matching active visible categories
  const categoriesList = useMemo(() => {
    const counts: Record<string, number> = {};
    menuItems.forEach((item) => {
      if (item.available) {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    });

    if (dbCategories.length > 0) {
      return dbCategories
        .filter((c) => c.visible !== false)
        .map((c) => ({
          id: c.id,
          name: c.name,
          count: counts[c.id] || 0,
        }));
    }

    return Object.keys(counts).map((catName) => ({
      id: catName,
      name: catName,
      count: counts[catName],
    }));
  }, [menuItems, dbCategories]);

  // Load held orders
  const fetchHeldOrders = async () => {
    try {
      const res = await fetch('/api/held-orders');
      const data = await res.json();
      if (data.heldOrders) {
        setHeldOrders(data.heldOrders);
      }
    } catch (err) {
      console.error('Failed to load held orders:', err);
    }
  };

  useEffect(() => {
    fetchHeldOrders();
  }, []);

  // Auto-load running tab items when switching tables in Dine-In mode
  useEffect(() => {
    if (orderType !== 'DINE_IN') return;

    const fetchRunningTab = async () => {
      try {
        const res = await fetch(`/api/orders?tableNumber=${selectedTable}`);
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          const combinedCart: CartItem[] = [];
          data.orders.forEach((ord: any) => {
            (ord.items || []).forEach((item: any) => {
              const idx = combinedCart.findIndex((c) => c.name === item.name);
              if (idx > -1) {
                combinedCart[idx].quantity += item.quantity;
              } else {
                combinedCart.push({
                  id: item.id || `item-${Math.random()}`,
                  name: item.name,
                  price: item.price || item.unitPrice || 0,
                  quantity: item.quantity,
                  veg: item.veg,
                });
              }
            });
          });
          setCart(combinedCart);
          setInitialTabCart(JSON.parse(JSON.stringify(combinedCart)));
        } else {
          setCart([]);
          setInitialTabCart([]);
        }
      } catch (err) {
        console.error('Failed to load table running tab:', err);
      }
    };

    fetchRunningTab();
  }, [selectedTable, orderType]);

  // Filter items (Category + Dietary Filter + Search Query)
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.available) return false;
      if (selectedCategory === 'FAVORITES' && !item.popular) return false;
      if (selectedCategory !== 'ALL' && selectedCategory !== 'FAVORITES' && item.category !== selectedCategory) {
        return false;
      }

      // Dietary filter
      if (dietaryFilter === 'VEG' && !item.veg) return false;
      if (dietaryFilter === 'NON_VEG' && item.veg) return false;
      if (dietaryFilter === 'JAIN') {
        if (!item.veg) return false;
        if (item.jain !== undefined) {
          if (!item.jain) return false;
        } else {
          const lowerName = item.name.toLowerCase();
          if (
            lowerName.includes('garlic') ||
            lowerName.includes('onion') ||
            lowerName.includes('potato') ||
            lowerName.includes('aloo') ||
            lowerName.includes('chicken') ||
            lowerName.includes('mutton') ||
            lowerName.includes('fish')
          ) {
            return false;
          }
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCat) return false;
      }
      return true;
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery]);

  // Cart operations
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

  // Hold current bill
  const handleHoldBill = async () => {
    if (cart.length === 0) return;
    const calc = calculateBillTotals({
      items: cart.map(c => ({ price: c.price, quantity: c.quantity })),
      discountAmount,
      gstRate: 5,
    });

    const newHeld = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      tableNumber: selectedTable,
      waiterName: waiterName,
      items: cart.map(c => ({
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
        showToast(`Bill parked for ${selectedTable}`);
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

  // Send KOT to Kitchen - Sends ONLY new/additional delta items added in this round!
  const handleSendKOT = async () => {
    if (cart.length === 0) return;

    // Calculate ONLY the NEW delta/incremental items added since last KOT!
    const newKOTItems: { id: string; name: string; quantity: number; price: number }[] = [];

    cart.forEach((cartItem) => {
      const existingInPrevRound = initialTabCart.find((p: CartItem) => p.name === cartItem.name);
      const prevQty = existingInPrevRound ? existingInPrevRound.quantity : 0;
      const deltaQty = cartItem.quantity - prevQty;

      if (deltaQty > 0) {
        newKOTItems.push({
          id: cartItem.id,
          name: cartItem.name,
          quantity: deltaQty, // Only the newly added quantity!
          price: cartItem.price,
        });
      }
    });

    if (newKOTItems.length === 0) {
      showToast('No new items to send to kitchen!');
      return;
    }

    const deltaTotal = newKOTItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: selectedTable,
          items: newKOTItems, // Send ONLY the incremental delta items to kitchen!
          totalAmount: deltaTotal,
          status: 'pending',
        }),
      });

      if (res.ok) {
        await fetch('/api/tables', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: `table-${selectedTable.toLowerCase()}`, status: 'running' }),
        }).catch(() => {});

        // Update initialTabCart so future rounds calculate delta against current total
        setInitialTabCart(JSON.parse(JSON.stringify(cart)));
        showToast(`KOT Round sent for ${selectedTable} (+${newKOTItems.length} new items)!`);
      }
    } catch (err) {
      console.error('KOT send failed:', err);
    }
  };

  // Handle Save & Print button click -> Open Payment Settlement Modal
  const handleSaveBill = () => {
    if (cart.length === 0) {
      showToast('Bill is empty! Add items first.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  // Confirm payment settlement from Modal
  const handleConfirmPayment = async (details: {
    paymentMethod: 'cash' | 'upi' | 'card';
    customerName: string;
    customerPhone: string;
  }) => {
    setIsPaymentModalOpen(false);

    const calc = calculateBillTotals({
      items: cart.map(c => ({ price: c.price, quantity: c.quantity })),
      discountAmount,
      gstRate: 5,
    });

    const billPayload = {
      restaurantId: 'demo',
      restaurantName: 'ChatChaska Cafe',
      tableNumber: selectedTable,
      waiterName: waiterName,
      customerName: details.customerName || 'Walk-in Guest',
      customerPhone: details.customerPhone || '',
      items: cart.map(c => ({
        name: c.name,
        quantity: c.quantity,
        unitPrice: c.price,
        lineTotal: c.price * c.quantity,
      })),
      subtotal: calc.subtotal,
      gstPercent: calc.gstRate,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      gstAmount: calc.totalTax,
      discountAmount: calc.discountAmount,
      grandTotal: calc.grandTotal,
      paymentMode: details.paymentMethod,
      status: 'paid',
    };

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billPayload),
      });

      const data = await res.json();
      const createdBill = data.bill || data;

      await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: `table-${selectedTable.toLowerCase()}`, status: 'paid' }),
      }).catch(() => {});

      const billPreviewData: BillData = {
        billId: createdBill.id,
        tokenNumber: createdBill.tokenNumber || '01',
        restaurantName: 'ChatChaska Cafe',
        gstin: '27AABCM1234A1Z5',
        date: new Date().toLocaleString(),
        tableNumber: selectedTable,
        waiterName: waiterName,
        customerName: details.customerName || undefined,
        customerPhone: details.customerPhone || undefined,
        items: billPayload.items,
        subtotal: calc.subtotal,
        discountAmount: calc.discountAmount,
        cgstRate: calc.cgstRate,
        sgstRate: calc.sgstRate,
        cgstAmount: calc.cgstAmount,
        sgstAmount: calc.sgstAmount,
        roundOff: calc.roundOff,
        grandTotal: calc.grandTotal,
        paymentMode: details.paymentMethod.toUpperCase(),
      };

      setGeneratedBill(billPreviewData);
      setIsReceiptModalOpen(true);
      setCart([]);
      setDiscountAmount(0);
      showToast('Payment successful & receipt generated!');
    } catch (err) {
      console.error('Save bill failed:', err);
    }
  };

  // Search input ref for F1 focus shortcut
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Accept / Reject incoming QR customer order
  const handleAcceptIncomingOrder = async (order: CloudOrder) => {
    try {
      await fetch(`/api/admin/orders/${order.order_number || order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: `table-${(order.table_number || 'T1').toLowerCase()}`, status: 'running' }),
      }).catch(() => {});

      setIncomingOrders((prev) => prev.filter((o) => (o.order_number || o.id) !== (order.order_number || order.id)));
      showToast(`✅ Order ${order.order_number} Accepted for ${order.table_number}!`);
    } catch (e) {
      console.error('Failed to accept order:', e);
    }
  };

  const handleRejectIncomingOrder = async (order: CloudOrder) => {
    try {
      await fetch(`/api/admin/orders/${order.order_number || order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      setIncomingOrders((prev) => prev.filter((o) => (o.order_number || o.id) !== (order.order_number || order.id)));
      showToast(`Order ${order.order_number} rejected.`);
    } catch (e) {
      console.error('Failed to reject order:', e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden select-none">
      {/* Left + Center Area (Header Bar + Categories Sidebar + Menu Items Grid) */}
      <div className="flex-1 flex flex-col min-w-0 h-full border-r border-slate-200 bg-slate-50">
        
        {/* FULL-WIDTH TOP HEADER BAR */}
        <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-3 shrink-0 select-none shadow-2xs">
          {/* BRAND LOGO ON FAR LEFT */}
          <div className="flex items-center justify-start w-[210px] shrink-0 border-r border-slate-200 pr-3">
            <img src="/chatchaska-logo.png" alt="ChatChaska" className="h-8 w-auto max-w-[180px] object-contain" />
          </div>

          {/* CENTER: SEARCH INPUT + CRISP RECTANGULAR BLOCK DIETARY FILTERS */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Crisp Rectangular Search Input Box */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-md px-3.5 py-1.5 text-xs w-[220px] shadow-2xs focus-within:border-blue-600 focus-within:bg-white transition-all">
              <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search (F1)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-full font-bold text-slate-900 placeholder:text-slate-400 text-xs"
              />
            </div>

            {/* Crisp Rectangular Block Dietary Filter Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDietaryFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-black border transition-all cursor-pointer shadow-2xs ${
                  dietaryFilter === 'ALL'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                All
              </button>

              <button
                onClick={() => setDietaryFilter('VEG')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-black border transition-all cursor-pointer shadow-2xs ${
                  dietaryFilter === 'VEG'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-xs inline-block ${dietaryFilter === 'VEG' ? 'bg-white' : 'bg-emerald-500'}`} />
                Veg
              </button>

              <button
                onClick={() => setDietaryFilter('NON_VEG')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-black border transition-all cursor-pointer shadow-2xs ${
                  dietaryFilter === 'NON_VEG'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-xs inline-block ${dietaryFilter === 'NON_VEG' ? 'bg-white' : 'bg-rose-500'}`} />
                Non-Veg
              </button>

              <button
                onClick={() => setDietaryFilter('JAIN')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-black border transition-all cursor-pointer shadow-2xs ${
                  dietaryFilter === 'JAIN'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-xs inline-block ${dietaryFilter === 'JAIN' ? 'bg-white' : 'bg-amber-500'}`} />
                Jain
              </button>
            </div>
          </div>

          {/* RIGHT: INCOMING CUSTOMER ORDERS BUTTON */}
          <button
            onClick={() => setIsIncomingDrawerOpen(true)}
            className="relative flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-md text-xs font-black transition-all cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            <span>Live QR Orders</span>
            {incomingOrders.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce">
                {incomingOrders.length}
              </span>
            )}
          </button>

          {/* FAR RIGHT: ITEM COUNT BADGE */}
          <div className="text-xs font-black text-slate-700 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-md shrink-0 shadow-2xs">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        {/* CONTENT AREA BELOW TOP BAR: CATEGORY SIDEBAR (LEFT) + MENU DISHES GRID (RIGHT) */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <CategoryPanel
            categories={categoriesList}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <MenuItemGrid
            items={filteredItems}
            onSelectItem={handleSelectItem}
          />
        </div>
      </div>

      {/* RIGHT SIDEBAR: BILLING PANEL */}
      <BillPanel
        cart={cart}
        orderType={orderType}
        onOrderTypeChange={setOrderType}
        selectedTable={selectedTable}
        onTableSelect={setSelectedTable}
        onUpdateQuantity={handleUpdateQuantity}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        discountAmount={discountAmount}
        onDiscountChange={setDiscountAmount}
        heldCount={heldOrders.length}
        onHold={handleHoldBill}
        onOpenHeld={() => setIsHeldDrawerOpen(true)}
        onSaveBill={handleSaveBill}
        onSendKOT={handleSendKOT}
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

      <PaymentSettlementModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        grandTotal={
          calculateBillTotals({
            items: cart.map(c => ({ price: c.price, quantity: c.quantity })),
            discountAmount,
            gstRate: 5,
          }).grandTotal
        }
        tableNumber={selectedTable}
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

      {/* Incoming QR Customer Orders Drawer */}
      <IncomingOrdersDrawer
        isOpen={isIncomingDrawerOpen}
        onClose={() => setIsIncomingDrawerOpen(false)}
        orders={incomingOrders}
        onAccept={handleAcceptIncomingOrder}
        onReject={handleRejectIncomingOrder}
      />
    </div>
  );
}

export default function StaffPOSPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-700">Loading Staff POS...</div>}>
      <StaffPOSContent />
    </Suspense>
  );
}
