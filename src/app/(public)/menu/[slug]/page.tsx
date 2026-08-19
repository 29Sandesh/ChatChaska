'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import {
  DEMO_RESTAURANT,
  DEMO_CATEGORIES,
  DEMO_MENU_ITEMS,
  getTopPicks,
  getItemsByCategory,
  DemoMenuItem,
} from '@/lib/mockData';

/* ─────────────────────────────────────────────
   FSSAI-style Veg / Non-Veg icon component
   ───────────────────────────────────────────── */
function DietIcon({ veg, size = 15 }: { veg: boolean; size?: number }) {
  const color = veg ? '#22c55e' : '#ef4444';
  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        border: `1.5px solid ${color}`,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      }}
    >
      <span
        style={{
          fontSize: size * 0.55,
          lineHeight: 1,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          marginTop: veg ? '-1px' : '1px',
        }}
      >
        {veg ? '▲' : '▼'}
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────
   Swiggy-style Enable/Disable Toggle Filter Button
   ───────────────────────────────────────────── */
function ToggleFilterButton({
  label,
  veg,
  isActive,
  onToggle,
}: {
  label: string;
  veg: boolean;
  isActive: boolean;
  onToggle: () => void;
}) {
  const activeBorder = veg
    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
    : 'border-red-500 bg-red-50 text-red-800 font-bold';
  const knobBg = veg ? 'bg-emerald-600' : 'bg-red-600';

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border text-[11px] transition-all shadow-2xs active:scale-95 whitespace-nowrap ${
        isActive
          ? activeBorder
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 font-medium'
      }`}
    >
      <DietIcon veg={veg} size={11} />
      <span>{label}</span>
      {/* Enable / Disable Toggle Switch Handle */}
      <div
        className={`w-6 h-3.5 rounded-[4px] p-0.5 transition-colors relative flex items-center ${
          isActive ? (veg ? 'bg-emerald-200' : 'bg-red-200') : 'bg-gray-200'
        }`}
      >
        <div
          className={`w-2.5 h-2.5 rounded-[3px] shadow-2xs transition-transform duration-200 ${
            isActive ? `${knobBg} translate-x-2.5` : 'bg-white translate-x-0'
          }`}
        />
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────
   Cart item type supporting variants & addons
   ───────────────────────────────────────────── */
interface CartItemDetail {
  item: DemoMenuItem;
  quantity: number;
  selectedVariant?: { name: string; price: number };
  selectedAddons: { name: string; price: number }[];
  unitPrice: number;
}

import { useSearchParams } from 'next/navigation';
import { OTPVerificationSheet } from '@/components/customer/OTPVerificationSheet';

export default function CustomerDigitalMenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read table from QR URL query (e.g. ?table=T5)
  const queryTable = searchParams?.get('table');

  // Cart state (key: itemId or item-variant key)
  const [cartMap, setCartMap] = useState<Record<string, CartItemDetail>>({});

  // Filter & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Table & quick service
  const [tableNumber, setTableNumber] = useState(queryTable || 'Table 1');
  const [waiterCalled, setWaiterCalled] = useState(false);

  // Modals & Bottom Sheets
  const [detailItem, setDetailItem] = useState<DemoMenuItem | null>(null);
  const [customizingItem, setCustomizingItem] = useState<DemoMenuItem | null>(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const [selectedAddonIndices, setSelectedAddonIndices] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // OTP Verification Modal
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [customerSession, setCustomerSession] = useState<{ phone: string; name: string; sessionToken: string } | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Update tableNumber when queryTable changes
  useEffect(() => {
    if (queryTable) {
      setTableNumber(queryTable);
    }
  }, [queryTable]);

  // Review modal
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<DemoMenuItem | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Derived data ────────────────────────── */
  const topPicks = useMemo(() => getTopPicks(), []);

  const filteredItemsByCategory = useMemo(() => {
    return DEMO_CATEGORIES.map((cat) => {
      const items = getItemsByCategory(cat.id).filter((item) => {
        const matchesSearch =
          !searchQuery ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDiet =
          vegFilter === 'all' ||
          (vegFilter === 'veg' && item.veg) ||
          (vegFilter === 'nonveg' && !item.veg);
        return matchesSearch && matchesDiet && item.available;
      });
      return { ...cat, items };
    }).filter((cat) => cat.items.length > 0);
  }, [searchQuery, vegFilter]);

  /* ── Cart calculation ───────────────────── */
  const cartItemsList = useMemo(() => Object.values(cartMap), [cartMap]);
  const totalItems = useMemo(
    () => cartItemsList.reduce((sum, ci) => sum + ci.quantity, 0),
    [cartItemsList]
  );
  const subtotal = useMemo(
    () => cartItemsList.reduce((sum, ci) => sum + ci.unitPrice * ci.quantity, 0),
    [cartItemsList]
  );
  const gstAmount = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const packagingFee = subtotal > 0 ? 25 : 0;
  const grandTotal = useMemo(
    () => Math.max(0, subtotal + gstAmount + packagingFee - couponDiscount),
    [subtotal, gstAmount, packagingFee, couponDiscount]
  );

  const calculatedCustomPrice = useMemo(() => {
    if (!customizingItem) return 0;
    const variant = customizingItem.variants?.[selectedVariantIdx];
    const base = variant ? variant.price : customizingItem.price;
    const addonsTotal = selectedAddonIndices.reduce((sum, idx) => {
      return sum + (customizingItem.addons?.[idx]?.price || 0);
    }, 0);
    return base + addonsTotal;
  }, [customizingItem, selectedVariantIdx, selectedAddonIndices]);

  /* ── Cart helpers ────────────────────────── */
  const handleItemAddClick = (item: DemoMenuItem) => {
    // If item has variants or addons, open customization bottom sheet
    if ((item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0)) {
      setCustomizingItem(item);
      setSelectedVariantIdx(0);
      setSelectedAddonIndices([]);
      return;
    }

    // Direct add
    const key = item.id;
    setCartMap((prev) => {
      const existing = prev[key];
      const quantity = (existing?.quantity || 0) + 1;
      return {
        ...prev,
        [key]: {
          item,
          quantity,
          selectedAddons: [],
          unitPrice: item.price,
        },
      };
    });
  };

  const handleCustomAddConfirm = () => {
    if (!customizingItem) return;
    const variant = customizingItem.variants?.[selectedVariantIdx];
    const addons = selectedAddonIndices.map((i) => customizingItem.addons![i]);
    const basePrice = variant ? variant.price : customizingItem.price;
    const addonsPrice = addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = basePrice + addonsPrice;

    const key = `${customizingItem.id}-${variant?.name || 'base'}-${selectedAddonIndices.join(',')}`;

    setCartMap((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          item: customizingItem,
          quantity: (existing?.quantity || 0) + 1,
          selectedVariant: variant,
          selectedAddons: addons,
          unitPrice,
        },
      };
    });

    setCustomizingItem(null);
  };

  const decrementCartItem = (key: string) => {
    setCartMap((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return {
          ...prev,
          [key]: { ...existing, quantity: existing.quantity - 1 },
        };
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const getItemTotalQtyInCart = (itemId: string) => {
    return cartItemsList
      .filter((ci) => ci.item.id === itemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  /* ── Coupon Handler ────────────────────── */
  const handleApplyCoupon = () => {
    setCouponError('');
    if (couponCode.toUpperCase() === 'SPICE20') {
      const discount = Math.min(100, Math.round(subtotal * 0.2));
      setCouponDiscount(discount);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon code. Try SPICE20 for 20% OFF.');
    }
  };

  /* ── Action Handlers ────────────────────── */
  const handleCallWaiter = () => {
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 4000);
  };

  const toggleSection = (catId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handlePlaceOrder = async () => {
    // If customer hasn't verified phone, open OTP sheet first
    if (!customerSession) {
      setIsOtpModalOpen(true);
      return;
    }

    setPlacingOrder(true);
    try {
      const orderItems = cartItemsList.map((ci) => ({
        id: ci.item.id,
        name: `${ci.item.name}${ci.selectedVariant ? ` (${ci.selectedVariant.name})` : ''}`,
        quantity: ci.quantity,
        price: ci.unitPrice,
      }));

      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: tableNumber,
          items: orderItems,
          customer_phone: customerSession.phone,
          customer_name: customerSession.name,
          session_token: customerSession.sessionToken,
          special_instructions: orderNotes,
          source: 'qr',
        }),
      });

      const data = await res.json();
      const newOrderId = data.order?.order_number || data.order?.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

      setOrderId(newOrderId);
      setOrderSuccess(true);
      setCartMap({});
    } catch (err) {
      console.error('Error submitting order:', err);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: reviewItem?.id, rating, comment: reviewComment }),
      });
      setIsReviewOpen(false);
      setReviewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  /* ── SWIGGY-EXACT COMPACT BOX ADD BUTTON ─── */
  const AddButton = ({ item }: { item: DemoMenuItem }) => {
    const qty = getItemTotalQtyInCart(item.id);

    if (qty > 0) {
      const cartKey = Object.keys(cartMap).find((k) => cartMap[k].item.id === item.id);
      return (
        <div className="flex items-center border border-emerald-600 bg-emerald-50 rounded-[3px] overflow-hidden h-[23px] px-1.5 shadow-2xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (cartKey) decrementCartItem(cartKey);
            }}
            className="text-emerald-700 font-bold text-xs w-3.5 h-3.5 flex items-center justify-center hover:bg-emerald-100 rounded-[2px] transition-colors"
          >
            −
          </button>
          <span className="font-bold text-emerald-800 text-[10px] px-1">{qty}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleItemAddClick(item);
            }}
            className="text-emerald-700 font-bold text-xs w-3.5 h-3.5 flex items-center justify-center hover:bg-emerald-100 rounded-[2px] transition-colors"
          >
            +
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleItemAddClick(item);
        }}
        className="px-3.5 h-[23px] border border-gray-200 text-emerald-600 font-bold text-[10px] rounded-[3px] hover:border-emerald-500 hover:bg-emerald-50/50 active:scale-95 transition-all shadow-2xs bg-white text-center flex items-center justify-center"
      >
        ADD
      </button>
    );
  };

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <div className="bg-white text-gray-900 font-sans antialiased md:max-w-md md:mx-auto md:shadow-xl md:min-h-screen relative pb-32">

      {/* ── HEADER ─────────────────────────── */}
      <header className="relative w-full h-48 flex-shrink-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute top-3 w-full flex justify-between items-center px-4">
          <span className="bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold text-gray-800 shadow-sm">
            📍 {tableNumber}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 pb-4 bg-gradient-to-t from-white via-white/80 to-transparent">
          <div className="flex items-end gap-3">
            <div className="w-14 h-14 rounded-xl bg-emerald-600 text-white shadow-md flex items-center justify-center font-bold text-lg flex-shrink-0">
              {DEMO_RESTAURANT.logo}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg text-gray-900 leading-tight truncate">
                {DEMO_RESTAURANT.name}
              </h1>
              <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mt-0.5">
                <span className="text-amber-500 font-bold">★ {DEMO_RESTAURANT.rating}</span>
                <span>({DEMO_RESTAURANT.reviewCount})</span>
                <span>•</span>
                <span>{DEMO_RESTAURANT.cuisine}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── QUICK SERVICE BUTTONS ──────────── */}
      <div className="px-4 pt-2 flex gap-2">
        <button
          onClick={handleCallWaiter}
          className="flex-1 py-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 active:scale-[0.97] transition-all"
        >
          🔔 {waiterCalled ? 'Notified!' : 'Call Waiter'}
        </button>
        <button
          onClick={handleCallWaiter}
          className="flex-1 py-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 active:scale-[0.97] transition-all"
        >
          🧾 Request Bill
        </button>
      </div>

      {/* ── STICKY HEADER (Search, Veg/NonVeg Toggles, Categories Bar) ─────────────────────── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-2 shadow-xs transition-all duration-300">
        {isScrolled && !isSearchExpanded ? (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center text-gray-600 text-xs font-bold shadow-xs active:scale-95 transition-all"
              title="Search menu"
            >
              🔍
            </button>
            <span className="font-bold text-xs text-gray-800 truncate px-2">
              {DEMO_RESTAURANT.name}
            </span>
            <span className="text-[10px] font-bold text-gray-400">
              📍 {tableNumber}
            </span>
          </div>
        ) : (
          /* Swiggy Exact Vector Search Bar with Left Chevron, Search Icon, Vertical Divider & Vector Mic Icon */
          <div className="w-full bg-gray-100/90 hover:bg-gray-100 rounded-[6px] px-3 py-2 flex items-center gap-2 border border-gray-200/80 shadow-2xs transition-all">
            {/* Left Chevron Icon */}
            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            
            {/* Search Input */}
            <input
              type="text"
              autoFocus={isSearchExpanded}
              placeholder={`Search in ${DEMO_RESTAURANT.name}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none font-medium"
            />
            
            {/* Search Magnifying Glass Icon */}
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 text-xs flex-shrink-0"
              >
                ✕
              </button>
            ) : (
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}

            {/* Vertical Divider Line */}
            <div className="w-[1px] h-4 bg-gray-300 flex-shrink-0 mx-0.5" />

            {/* Vector Orange Mic Icon */}
            <button className="flex-shrink-0 hover:opacity-80 transition-opacity" title="Voice search">
              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        )}

        {/* ── VEG / NON-VEG FILTER TOGGLES ── */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            isScrolled && !isSearchExpanded
              ? 'max-h-0 opacity-0 pointer-events-none mt-0'
              : 'max-h-12 opacity-100 mt-2'
          }`}
        >
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-0.5">
            <ToggleFilterButton
              label="Pure Veg"
              veg={true}
              isActive={vegFilter === 'veg'}
              onToggle={() => setVegFilter(vegFilter === 'veg' ? 'all' : 'veg')}
            />
            <ToggleFilterButton
              label="Non Veg"
              veg={false}
              isActive={vegFilter === 'nonveg'}
              onToggle={() => setVegFilter(vegFilter === 'nonveg' ? 'all' : 'nonveg')}
            />
            {vegFilter !== 'all' && (
              <button
                onClick={() => setVegFilter('all')}
                className="px-2.5 py-1 rounded-[6px] text-[11px] font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all whitespace-nowrap"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* ── RESTAURANT CATEGORIES SCROLLING BAR (ROUNDED-[6PX]) ── */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pt-2 pb-1 border-t border-gray-100 mt-2">
          <button
            onClick={() => {
              setActiveCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3 py-1 rounded-[6px] text-xs font-bold transition-all whitespace-nowrap border ${
              activeCategory === 'all'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            All ({DEMO_CATEGORIES.reduce((sum: number, c: { id: string }) => sum + getItemsByCategory(c.id).length, 0)})
          </button>
          {DEMO_CATEGORIES.map((cat: { id: string; name: string }) => {
            const count = getItemsByCategory(cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const el = document.getElementById(`cat-${cat.id}`);
                  if (el) {
                    const yOffset = -120;
                    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                  }
                }}
                className={`px-3 py-1 rounded-[6px] text-xs font-bold transition-all whitespace-nowrap border ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TOP PICKS CAROUSEL ─────────────── */}
      {!searchQuery && vegFilter === 'all' && (
        <section className="py-4">
          <h2 className="px-4 font-bold text-base text-gray-900 mb-2.5">Top Picks</h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory hide-scrollbar">
            {topPicks.map((item) => (
              <div
                key={item.id}
                onClick={() => setDetailItem(item)}
                className="relative flex-shrink-0 w-[220px] h-[160px] rounded-2xl overflow-hidden shadow-md snap-start group cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                <div className="absolute top-2.5 left-2.5">
                  <DietIcon veg={item.veg} size={16} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2.5 flex items-end justify-between">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-white font-bold text-xs leading-tight truncate drop-shadow-md">
                      {item.name}
                    </h3>
                    <span className="text-white/90 font-bold text-xs drop-shadow-md">₹{item.price}</span>
                  </div>
                  <AddButton item={item} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CATEGORY SECTIONS (BORDERLESS SWIGGY CARDS) ── */}
      <main className="px-4 pb-8">
        {filteredItemsByCategory.map((catSection) => {
          const isCollapsed = collapsedSections[catSection.id] || false;

          return (
            <section key={catSection.id} className="mb-6">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(catSection.id)}
                className="w-full flex items-center justify-between py-3 border-b border-gray-100"
              >
                <h2 className="font-bold text-lg text-gray-900">
                  {catSection.name}{' '}
                  <span className="text-gray-400 font-normal">({catSection.items.length})</span>
                </h2>
                <span
                  className={`text-gray-400 text-xl transition-transform duration-200 ${
                    isCollapsed ? '' : 'rotate-180'
                  }`}
                >
                  ▾
                </span>
              </button>

              {/* Items Grid — Clean White Borderless Cards */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'
                }`}
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-4">
                  {catSection.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setDetailItem(item)}
                      className="flex flex-col cursor-pointer group"
                    >
                      {/* Image (Square 1:1, Lesser curve rounded-lg) */}
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Pure Transparent Text Badge on Top-Left Corner of Dish Image (NO background box, NO emojis) */}
                        {item.badge && (
                          <span className="absolute top-1 left-2 text-white font-extrabold text-[10px] tracking-wider uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            {item.badge === 'bestseller' ? 'Bestseller' : item.badge === 'must-try' ? 'Must Try' : 'New'}
                          </span>
                        )}
                        {/* FSSAI Diet Icon on Bottom-Right Corner of Image */}
                        <div className="absolute bottom-1.5 right-1.5">
                          <DietIcon veg={item.veg} size={15} />
                        </div>
                      </div>

                      {/* Dish Name Container — Fixed h-8 for uniform 2-line spacing */}
                      <div className="h-8 flex items-start mb-1">
                        <h3 className="font-bold text-xs text-gray-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      {/* Bottom Row: Price (left) + ADD Button (right) — Shifted lower */}
                      <div className="flex items-center justify-between mt-auto pt-2 pb-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-xs text-gray-900">₹{item.price}</span>
                          {item.strikePrice && (
                            <span className="text-[10px] text-gray-400 line-through">₹{item.strikePrice}</span>
                          )}
                        </div>
                        <AddButton item={item} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Empty state */}
        {filteredItemsByCategory.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl">🍽️</span>
            <p className="text-gray-500 text-sm mt-3 font-medium">No dishes found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(''); setVegFilter('all'); }}
              className="mt-3 text-emerald-600 text-sm font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* ── FLOATING ITEMS FAB ─────────────── */}
      {totalItems > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 md:absolute md:bottom-6 md:right-6 w-16 h-16 bg-gray-900 text-white rounded-full shadow-2xl flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform z-50 group"
        >
          <span className="text-lg">📋</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">Items</span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
            {totalItems}
          </span>
        </button>
      )}

      {/* ── ITEM DETAIL BOTTOM SHEET ───────── */}
      {detailItem && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 md:absolute" onClick={() => setDetailItem(null)} />
          <div className="fixed bottom-0 left-0 right-0 md:absolute md:max-w-md md:mx-auto bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] flex flex-col animate-slideUp overflow-hidden">
            {/* Hero Image */}
            <div className="relative w-full h-52 bg-gray-100 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={detailItem.image} alt={detailItem.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center text-sm font-bold backdrop-blur-xs"
              >
                ✕
              </button>
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md shadow">
                <DietIcon veg={detailItem.veg} size={16} />
              </div>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-lg text-gray-900">{detailItem.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    {detailItem.rating && <span className="text-amber-500 font-bold">★ {detailItem.rating} ({detailItem.ratingCount} reviews)</span>}
                    {detailItem.badge && <span className="text-emerald-600 font-bold">• ✨ {detailItem.badge}</span>}
                  </div>
                </div>
                <span className="font-bold text-lg text-gray-900">₹{detailItem.price}</span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{detailItem.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {detailItem.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => {
                  handleItemAddClick(detailItem);
                  setDetailItem(null);
                }}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-between px-5 text-sm"
              >
                <span>Add Item to Order</span>
                <span>₹{detailItem.price}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── CUSTOMIZATION BOTTOM SHEET ─────── */}
      {customizingItem && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 md:absolute" onClick={() => setCustomizingItem(null)} />
          <div className="fixed bottom-0 left-0 right-0 md:absolute md:max-w-md md:mx-auto bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] flex flex-col animate-slideUp">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-gray-900">Customise {customizingItem.name}</h3>
                <p className="text-xs text-gray-500">Select size & add-ons</p>
              </div>
              <button onClick={() => setCustomizingItem(null)} className="text-gray-400 hover:text-gray-600 text-lg">
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* Variants Section */}
              {customizingItem.variants && customizingItem.variants.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Quantity / Portion</h4>
                  <div className="space-y-2">
                    {customizingItem.variants.map((v, idx) => (
                      <label
                        key={v.name}
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedVariantIdx === idx
                            ? 'border-emerald-500 bg-emerald-50/50 text-gray-900 font-bold'
                            : 'border-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-xs">{v.name}</span>
                        <span className="text-xs font-mono">₹{v.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons Section */}
              {customizingItem.addons && customizingItem.addons.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">Extra Add-ons</h4>
                  <div className="space-y-2">
                    {customizingItem.addons.map((addon, idx) => {
                      const isChecked = selectedAddonIndices.includes(idx);
                      return (
                        <label
                          key={addon.name}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedAddonIndices((prev) => prev.filter((i) => i !== idx));
                            } else {
                              setSelectedAddonIndices((prev) => [...prev, idx]);
                            }
                          }}
                          className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-50/50 text-gray-900 font-bold'
                              : 'border-gray-200 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={isChecked} readOnly className="accent-emerald-600" />
                            <span className="text-xs">{addon.name}</span>
                          </div>
                          <span className="text-xs font-mono">+₹{addon.price}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={handleCustomAddConfirm}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-between px-5 text-sm"
              >
                <span>Add Item to Cart</span>
                <span>₹{calculatedCustomPrice}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── CART BOTTOM SHEET WITH BILL BREAKDOWN ── */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 md:absolute" onClick={() => setIsCartOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 md:absolute md:max-w-md md:mx-auto bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] flex flex-col animate-slideUp">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-5 pb-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900">
                Your Order ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Items List */}
              <div className="space-y-3">
                {Object.entries(cartMap).map(([key, ci]) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <DietIcon veg={ci.item.veg} size={12} />
                        <span className="font-bold text-xs text-gray-900 truncate">{ci.item.name}</span>
                      </div>
                      {ci.selectedVariant && (
                        <p className="text-[10px] text-gray-500 pl-4">Variant: {ci.selectedVariant.name}</p>
                      )}
                      {ci.selectedAddons.length > 0 && (
                        <p className="text-[10px] text-gray-500 pl-4">
                          + {ci.selectedAddons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center border border-emerald-500 rounded-lg overflow-hidden bg-emerald-50">
                        <button
                          onClick={() => decrementCartItem(key)}
                          className="w-6 h-6 flex items-center justify-center text-emerald-700 font-bold text-sm"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-emerald-800">{ci.quantity}</span>
                        <button
                          onClick={() =>
                            setCartMap((prev) => ({
                              ...prev,
                              [key]: { ...ci, quantity: ci.quantity + 1 },
                            }))
                          }
                          className="w-6 h-6 flex items-center justify-center text-emerald-700 font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-xs text-gray-900 w-14 text-right">
                        ₹{ci.unitPrice * ci.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add More Items link */}
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-emerald-600 font-bold text-xs hover:underline flex items-center gap-1 pt-1"
              >
                + Add more items
              </button>
              <div className="pt-3 border-t border-gray-100">
                <p className="font-bold text-xs text-gray-700 mb-1.5">Apply Coupon</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. SPICE20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs outline-none border border-transparent focus:border-emerald-500 uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-1.5 bg-gray-900 text-white font-bold text-xs rounded-lg hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && <p className="text-[11px] text-emerald-600 font-bold mt-1">✓ Coupon SPICE20 Applied! (₹{couponDiscount} OFF)</p>}
                {couponError && <p className="text-[11px] text-red-500 font-medium mt-1">{couponError}</p>}
              </div>

              {/* Bill Details Breakdown */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100 text-xs">
                <p className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Bill Summary</p>
                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST Taxes (5%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Packaging Charges</span>
                  <span>₹{packagingFee}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-2 text-sm">
                  <span>To Pay</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full bg-emerald-600 text-white rounded-xl py-3.5 flex items-center justify-between px-5 font-bold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-transform"
              >
                <span>Proceed to Confirm</span>
                <span>₹{grandTotal}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── CHECKOUT / ORDER CONFIRMATION MODAL ── */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setOrderSuccess(false);
        }}
        title="Confirm Table Order"
        subtitle={`Ordering for ${tableNumber}`}
        footer={
          orderSuccess ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setIsCheckoutOpen(false);
                  router.push(`/menu/${DEMO_RESTAURANT.slug}/status`);
                }}
              >
                Track Live Order
              </Button>
              <Button variant="primary" fullWidth onClick={() => setIsCheckoutOpen(false)}>
                Order More
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsCheckoutOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={placingOrder} onClick={handlePlaceOrder}>
                Send Order to Kitchen (₹{grandTotal})
              </Button>
            </>
          )
        }
      >
        {orderSuccess ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50 shadow-sm animate-bounce">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="font-bold text-xl text-gray-900">Order Placed Successfully!</h3>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
              <span>Order #{orderId}</span>
              <span>•</span>
              <span>⏱️ Est. Wait: 12-15 mins</span>
            </div>
            <p className="text-xs text-gray-500 max-w-xs mx-auto pt-1">
              Your order has been sent directly to the kitchen display at {tableNumber}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Table / Location" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
            <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs">
              <p className="font-bold text-gray-800">Order Summary ({totalItems} items)</p>
              {cartItemsList.map((ci, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{ci.quantity}x {ci.item.name}</span>
                  <span className="font-mono">₹{ci.unitPrice * ci.quantity}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-gray-900">
                <span>Total Amount</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
            <Textarea
              label="Special Instructions / Allergies"
              placeholder="e.g. Less spicy, extra paper napkins..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>
        )}
      </Modal>

      {/* ── REVIEW MODAL ──────────────────── */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={`Rate ${reviewItem?.name || 'Dish'}`}
        subtitle="Share your feedback with the restaurant chef."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={submittingReview} onClick={handleSubmitReview}>Submit Rating</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl transition-transform hover:scale-125"
              >
                <span className={star <= rating ? 'text-amber-400' : 'text-gray-300'}>★</span>
              </button>
            ))}
          </div>
          <Textarea
            label="Your Feedback"
            placeholder="How was the taste, presentation, and speed?"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
        </div>
      </Modal>

      {/* ── OTP PHONE VERIFICATION SHEET ────── */}
      <OTPVerificationSheet
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={(session) => {
          setCustomerSession(session);
          // Automatically proceed to place order after verification
          setTimeout(() => {
            handlePlaceOrder();
          }, 300);
        }}
        tableNumber={tableNumber}
        purpose="order"
      />

      {/* ── ANIMATIONS & SCROLLBAR HIDE ────── */}
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
