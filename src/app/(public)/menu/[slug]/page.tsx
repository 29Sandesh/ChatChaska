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
   Single-tap On/Off Toggle Filter Button
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
  const activeClass = veg
    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-2xs ring-1 ring-emerald-600/30'
    : 'border-rose-600 bg-rose-50 text-rose-950 font-black shadow-2xs ring-1 ring-rose-600/30';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
        isActive
          ? activeClass
          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold'
      }`}
    >
      <DietIcon veg={veg} size={11} />
      <span>{label}</span>
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
  const queryType = searchParams?.get('type') || 'both'; // 'pure_veg' | 'non_veg' | 'both'
  const queryJain = searchParams?.get('jain') === '1';
  const queryWaiter = searchParams?.get('waiter') !== '0';
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg' | 'jain'>(
    queryType === 'pure_veg' ? 'veg' : 'all'
  );
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

  // Dynamic Cafe Config & Logo
  const [cafeInfo, setCafeInfo] = useState<{
    name: string;
    logoUrl?: string;
    rating?: string;
    cuisines?: string;
  }>({
    name: DEMO_RESTAURANT.name,
    logoUrl: '',
    rating: '4.8',
    cuisines: DEMO_RESTAURANT.cuisine,
  });

  useEffect(() => {
    fetch('/api/cafe-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.cafeName) {
          setCafeInfo((prev) => ({
            ...prev,
            name: data.cafeName,
            cuisines: Array.isArray(data.cuisines) && data.cuisines.length > 0 ? data.cuisines.join(' • ') : prev.cuisines,
          }));
        }
      })
      .catch(() => {});

    fetch('/api/settings?key=cafe_logo')
      .then((res) => res.json())
      .then((data) => {
        if (data.value) {
          setCafeInfo((prev) => ({ ...prev, logoUrl: data.value }));
        }
      })
      .catch(() => {});
  }, []);

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
        const isJainMatch =
          item.veg &&
          !item.name.toLowerCase().includes('onion') &&
          !item.name.toLowerCase().includes('garlic') &&
          !item.name.toLowerCase().includes('potato');
        const matchesDiet =
          vegFilter === 'all' ||
          (vegFilter === 'veg' && item.veg) ||
          (vegFilter === 'nonveg' && !item.veg) ||
          (vegFilter === 'jain' && isJainMatch);
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

  /* ── BRAND COMPACT BOX ADD BUTTON ─── */
  const AddButton = ({ item }: { item: DemoMenuItem }) => {
    const qty = getItemTotalQtyInCart(item.id);

    if (qty > 0) {
      const cartKey = Object.keys(cartMap).find((k) => cartMap[k].item.id === item.id);
      return (
        <div className="flex items-center border border-[#B2906A] bg-[#FAF7F2] rounded-xs overflow-hidden h-[26px] shadow-2xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (cartKey) decrementCartItem(cartKey);
            }}
            className="w-5 h-full flex items-center justify-center text-slate-950 font-black text-xs hover:bg-[#C3A27C]/30 border-r border-[#B2906A]/30 active:bg-[#C3A27C] transition-colors cursor-pointer"
          >
            −
          </button>
          <span className="font-black text-slate-950 text-xs px-2 text-center select-none min-w-[20px]">{qty}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleItemAddClick(item);
            }}
            className="w-5 h-full flex items-center justify-center text-slate-950 font-black text-xs hover:bg-[#C3A27C]/30 border-l border-[#B2906A]/30 active:bg-[#C3A27C] transition-colors cursor-pointer"
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
        className="px-3.5 h-[26px] border border-[#B2906A] text-slate-950 font-black text-xs rounded-xs hover:bg-[#C3A27C] active:scale-95 transition-all shadow-2xs bg-[#FAF7F2] text-center flex items-center justify-center cursor-pointer"
      >
        ADD
      </button>
    );
  };

  /* ════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════ */
  return (
    <div className="bg-white text-slate-900 font-sans antialiased md:max-w-md md:mx-auto md:shadow-xl md:min-h-screen relative pb-32">

      {/* ── HEADER WITH CHATCHASKA BRANDING & RESTAURANT LOGO ── */}
      <header className="relative w-full bg-white border-b border-slate-100 p-4 flex-shrink-0">
        {/* Top Branding & Table Badge Row */}
        <div className="flex justify-between items-center mb-3">
          {/* Table Badge: Clean box with subtle round edge */}
          <div className="bg-slate-50 border border-slate-200 shadow-2xs px-2.5 py-1 rounded-md text-xs font-black text-slate-900 flex items-center gap-1.5">
            <span>📍</span>
            <span>{tableNumber}</span>
          </div>

          {/* ChatChaska Top Brand Badge */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 shadow-2xs px-2 py-0.5 rounded-md">
            <img src="/chatchaska-logo.png" alt="ChatChaska" className="h-3.5 w-auto object-contain" />
          </div>
        </div>

        {/* Restaurant Identity Row */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-slate-50 border border-slate-200 text-slate-950 shadow-2xs flex items-center justify-center font-black text-lg shrink-0 overflow-hidden">
            {cafeInfo.logoUrl ? (
              <img src={cafeInfo.logoUrl} alt={cafeInfo.name} className="w-full h-full object-cover" />
            ) : (
              <span>{cafeInfo.name?.charAt(0) || 'C'}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-sm text-slate-950 leading-tight truncate tracking-tight">
              {cafeInfo.name}
            </h1>
            <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5 font-medium leading-none">
              <span className="text-amber-500 font-black inline-flex items-center gap-0.5">
                ★ 4.8
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── QUICK SERVICE BUTTONS (BOXES WITH ROUND-MD) ──────────── */}
      {queryWaiter && (
        <div className="px-4 pt-2.5 flex gap-2">
          <button
            onClick={handleCallWaiter}
            className="flex-1 py-2 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-center gap-1.5 text-xs font-black text-slate-950 hover:bg-[#C3A27C]/20 active:scale-[0.98] transition-all shadow-2xs"
          >
            🔔 {waiterCalled ? 'Notified!' : 'Call Waiter'}
          </button>
          <button
            onClick={handleCallWaiter}
            className="flex-1 py-2 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-center gap-1.5 text-xs font-black text-slate-950 hover:bg-[#C3A27C]/20 active:scale-[0.98] transition-all shadow-2xs"
          >
            🧾 Request Bill
          </button>
        </div>
      )}

      {/* ── STICKY HEADER (Filters Row & Categories) ─────────────────────── */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2 shadow-2xs transition-all duration-300">
        {isSearchExpanded ? (
          /* Clean Full-width Search Input */
          <div className="w-full bg-slate-50 rounded-md px-3 py-1.5 flex items-center gap-2 border border-slate-200 shadow-2xs animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[16px] text-slate-400">search</span>
            <input
              type="text"
              autoFocus
              placeholder={`Search in ${cafeInfo.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none font-bold"
            />
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchExpanded(false);
              }}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        ) : (
          /* Filter Buttons Row (Collapses smoothly on scroll) */
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isScrolled
                ? 'max-h-0 opacity-0 pointer-events-none mt-0 py-0'
                : 'max-h-12 opacity-100 mt-0.5 py-0.5'
            }`}
          >
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full">
              {queryType !== 'non_veg' && (
                <ToggleFilterButton
                  label="Veg"
                  veg={true}
                  isActive={vegFilter === 'veg'}
                  onToggle={() => setVegFilter(vegFilter === 'veg' ? 'all' : 'veg')}
                />
              )}
              {queryType !== 'pure_veg' && (
                <ToggleFilterButton
                  label="Non-Veg"
                  veg={false}
                  isActive={vegFilter === 'nonveg'}
                  onToggle={() => setVegFilter(vegFilter === 'nonveg' ? 'all' : 'nonveg')}
                />
              )}
              {queryJain && queryType !== 'non_veg' && (
                <button
                  type="button"
                  onClick={() => setVegFilter(vegFilter === 'jain' ? 'all' : 'jain')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-all active:scale-95 whitespace-nowrap cursor-pointer ${
                    vegFilter === 'jain'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-2xs ring-1 ring-amber-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                  <span>Jain</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── RESTAURANT CATEGORIES SCROLLING BAR (ROUNDED-MD) ── */}
        <div className={`flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-1.5 pb-1 ${isScrolled ? '' : 'border-t border-slate-100 mt-1'}`}>
          {/* Search Icon Button before All */}
          <button
            onClick={() => {
              setIsSearchExpanded((prev) => !prev);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border shrink-0 flex items-center justify-center cursor-pointer ${
              isSearchExpanded
                ? 'bg-slate-950 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Search dishes"
          >
            <span className="material-symbols-outlined text-[15px]">search</span>
          </button>

          <button
            onClick={() => {
              setActiveCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#C3A27C] border-[#B2906A] text-slate-950 shadow-2xs'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {DEMO_CATEGORIES.map((cat: { id: string; name: string }) => {
            const cleanName = cat.name.replace(/[\p{Emoji}\u200d]+/gu, '').trim() || cat.name;
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
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#C3A27C] border-[#B2906A] text-slate-950 shadow-2xs'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cleanName}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TOP PICKS (ALIGNED 2-COLUMN WIDE RECTANGLES) ─────────────── */}
      {!searchQuery && vegFilter === 'all' && (
        <section className="py-3 px-4">
          <h2 className="font-black text-sm text-slate-900 mb-2">Top Picks</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {topPicks.slice(0, 2).map((item) => (
              <div
                key={item.id}
                onClick={() => setDetailItem(item)}
                className="relative w-full h-[96px] rounded-md overflow-hidden shadow-2xs border border-slate-200 group cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                <div className="absolute top-1.5 left-1.5">
                  <DietIcon veg={item.veg} size={12} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-1.5 flex items-end justify-between">
                  <div className="min-w-0 pr-1">
                    <h3 className="text-white font-bold text-[10px] leading-tight truncate drop-shadow-md">
                      {item.name}
                    </h3>
                    <span className="text-[#C3A27C] font-black text-[11px] drop-shadow-md">₹{item.price}</span>
                  </div>
                  <AddButton item={item} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CATEGORY SECTIONS (CLEAN BOX CARDS) ── */}
      <main className="px-4 pb-8">
        {filteredItemsByCategory.map((catSection) => {
          const isCollapsed = collapsedSections[catSection.id] || false;
          const cleanSectionName = catSection.name.replace(/[\p{Emoji}\u200d]+/gu, '').trim() || catSection.name;

          return (
            <section key={catSection.id} className="mb-6">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(catSection.id)}
                className="w-full flex items-center justify-between py-2.5 border-b border-slate-200 cursor-pointer"
              >
                <h2 className="font-black text-base text-slate-900">
                  {cleanSectionName}
                </h2>
                <span
                  className={`text-slate-400 text-lg transition-transform duration-200 ${
                    isCollapsed ? '' : 'rotate-180'
                  }`}
                >
                  ▾
                </span>
              </button>

              {/* Items Grid */}
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[5000px] opacity-100'
                }`}
              >
                <div className="grid grid-cols-2 gap-x-3 gap-y-5 pt-3">
                  {catSection.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setDetailItem(item)}
                      className="flex flex-col cursor-pointer group bg-white rounded-md p-1.5 border border-slate-100 hover:border-slate-200 shadow-2xs transition-all"
                    >
                      {/* Image (Square 1:1, Lesser curve rounded-md) */}
                      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-slate-100 mb-1.5 border border-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {item.badge && (
                          <span className="absolute top-1 left-1.5 bg-black/60 backdrop-blur-xs text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-xs tracking-wider uppercase">
                            {item.badge === 'bestseller' ? 'Bestseller' : item.badge === 'must-try' ? 'Must Try' : 'New'}
                          </span>
                        )}
                        <div className="absolute bottom-1 right-1">
                          <DietIcon veg={item.veg} size={14} />
                        </div>
                      </div>

                      {/* Item Info */}
                      <h3 className="font-bold text-xs text-slate-900 line-clamp-1 leading-snug">
                        {item.name}
                      </h3>

                      {/* Bottom Row: Price + ADD Button */}
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-xs text-slate-950">₹{item.price}</span>
                          {item.strikePrice && (
                            <span className="text-[10px] text-slate-400 line-through">₹{item.strikePrice}</span>
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
            <span className="text-3xl">🍽️</span>
            <p className="text-slate-500 text-xs mt-2 font-medium">No dishes found matching your filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setVegFilter('all'); }}
              className="mt-2 text-[#8C6D47] text-xs font-bold hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* ── STICKY BOTTOM CART BAR (SIMPLE GO TO CART BAR) ─────────────── */}
      {totalItems > 0 && !isCartOpen && (
        <div className="fixed bottom-3 left-3 right-3 md:absolute md:bottom-3 md:left-3 md:right-3 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white rounded-md py-3 px-4 shadow-2xl border border-slate-800 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer font-black text-xs"
          >
            <span>Go to Cart</span>
            <span className="text-[#C3A27C] font-black">({totalItems})</span>
            <span className="material-symbols-outlined text-[16px] text-[#C3A27C]">arrow_forward</span>
          </button>
        </div>
      )}

      {/* ── ITEM DETAIL BOTTOM SHEET ───────── */}
      {detailItem && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 md:absolute" onClick={() => setDetailItem(null)} />
          <div className="fixed bottom-0 left-0 right-0 md:absolute md:max-w-md md:mx-auto bg-white rounded-t-md border-t border-slate-200 shadow-2xl z-50 max-h-[85vh] flex flex-col animate-slideUp overflow-hidden">
            {/* Hero Image */}
            <div className="relative w-full h-48 bg-slate-100 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={detailItem.image} alt={detailItem.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-md bg-black/60 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute top-3 left-3 bg-white/90 px-1.5 py-0.5 rounded-md shadow-2xs">
                <DietIcon veg={detailItem.veg} size={15} />
              </div>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-base text-slate-950">{detailItem.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    {detailItem.rating && <span className="text-amber-500 font-bold">★ {detailItem.rating}</span>}
                    {detailItem.badge && <span className="text-[#8C6D47] font-bold">• {detailItem.badge}</span>}
                  </div>
                </div>
                <span className="text-base font-black text-slate-950 font-mono">₹{detailItem.price}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{detailItem.description}</p>
            </div>

            {/* Bottom Actions */}
            <div className="p-3.5 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
              <button
                onClick={() => {
                  setReviewItem(detailItem);
                  setRating(5);
                  setReviewComment('');
                  setIsReviewOpen(true);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                ⭐ Rate Dish
              </button>
              <div className="flex items-center gap-2">
                <AddButton item={detailItem} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── CUSTOMIZATION BOTTOM SHEET ─────── */}
      {customizingItem && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 md:absolute" onClick={() => setCustomizingItem(null)} />
          <div className="fixed bottom-0 left-0 right-0 md:absolute md:max-w-md md:mx-auto bg-white rounded-t-md border-t border-slate-200 shadow-2xl z-50 max-h-[80vh] flex flex-col animate-slideUp">
            <div className="px-4 py-3.5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-black text-sm text-slate-950">Customise {customizingItem.name}</h3>
                <p className="text-[11px] text-slate-500 font-medium">Select size & add-ons</p>
              </div>
              <button onClick={() => setCustomizingItem(null)} className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {/* Variants Section */}
              {customizingItem.variants && customizingItem.variants.length > 0 && (
                <div>
                  <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-wider mb-2">Quantity / Portion</h4>
                  <div className="space-y-1.5">
                    {customizingItem.variants.map((v, idx) => (
                      <label
                        key={v.name}
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`flex justify-between items-center p-2.5 rounded-md border cursor-pointer transition-all ${
                          selectedVariantIdx === idx
                            ? 'border-[#C3A27C] bg-[#FAF7F2] text-slate-950 font-bold shadow-2xs'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs">{v.name}</span>
                        <span className="text-xs font-mono font-bold">₹{v.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons Section */}
              {customizingItem.addons && customizingItem.addons.length > 0 && (
                <div>
                  <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-wider mb-2">Extra Add-ons</h4>
                  <div className="space-y-1.5">
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
                          className={`flex justify-between items-center p-2.5 rounded-md border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-[#C3A27C] bg-[#FAF7F2] text-slate-950 font-bold shadow-2xs'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={isChecked} readOnly className="accent-[#C3A27C] rounded-xs" />
                            <span className="text-xs">{addon.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold">+₹{addon.price}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-slate-100 bg-white">
              <button
                onClick={handleCustomAddConfirm}
                className="w-full bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-black py-3 rounded-md shadow-2xs active:scale-[0.98] transition-all flex items-center justify-between px-4 text-xs border border-[#B2906A] cursor-pointer"
              >
                <span>Add Item to Cart</span>
                <span>₹{calculatedCustomPrice}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── FULL SCREEN CART PAGE VIEW ── */}
      {isCartOpen && (
        <>
          {/* Backdrop (clicking outside area removes cart) */}
          <div className="fixed inset-0 bg-black/50 z-50 md:absolute" onClick={() => setIsCartOpen(false)} />
          
          {/* Full Screen Cart Container */}
          <div className="fixed inset-0 md:absolute bg-white z-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Top Navigation Header (No Cross, Back to Menu link) */}
            <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <button
                onClick={() => setIsCartOpen(false)}
                className="flex items-center gap-1.5 text-xs font-black text-slate-950 hover:text-[#8C6D47] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to Menu</span>
              </button>
              <h2 className="font-black text-sm text-slate-950">
                Your Cart ({totalItems})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Items List */}
              <div className="space-y-2.5">
                {Object.entries(cartMap).map(([key, ci]) => (
                  <div key={key} className="flex items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-md border border-slate-200 shadow-2xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <DietIcon veg={ci.item.veg} size={12} />
                        <span className="font-black text-xs text-slate-900 truncate">{ci.item.name}</span>
                      </div>
                      {ci.selectedVariant && (
                        <p className="text-[10px] text-slate-500 pl-4">Variant: {ci.selectedVariant.name}</p>
                      )}
                      {ci.selectedAddons.length > 0 && (
                        <p className="text-[10px] text-slate-500 pl-4">
                          + {ci.selectedAddons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div className="flex items-center border border-[#B2906A] rounded-xs overflow-hidden bg-[#FAF7F2] h-[26px]">
                        <button
                          onClick={() => decrementCartItem(key)}
                          className="w-5 h-full flex items-center justify-center text-slate-950 font-black text-xs hover:bg-[#C3A27C]/30 border-r border-[#B2906A]/30 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-black text-slate-950 select-none">{ci.quantity}</span>
                        <button
                          onClick={() =>
                            setCartMap((prev) => ({
                              ...prev,
                              [key]: { ...ci, quantity: ci.quantity + 1 },
                            }))
                          }
                          className="w-5 h-full flex items-center justify-center text-slate-950 font-black text-xs hover:bg-[#C3A27C]/30 border-l border-[#B2906A]/30 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-black text-xs text-slate-950 w-12 text-right">
                        ₹{ci.unitPrice * ci.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add More Items link */}
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-[#8C6D47] font-black text-xs hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                + Add more dishes
              </button>

              {/* Coupon */}
              <div className="pt-3 border-t border-slate-100">
                <p className="font-bold text-xs text-slate-700 mb-1">Apply Coupon</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. SPICE20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 rounded-md text-xs outline-none border border-slate-200 focus:border-[#C3A27C] uppercase font-bold"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 font-black text-xs rounded-md border border-[#B2906A] transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && <p className="text-[11px] text-emerald-700 font-bold mt-1">✓ Coupon applied! (₹{couponDiscount} OFF)</p>}
                {couponError && <p className="text-[11px] text-rose-600 font-medium mt-1">{couponError}</p>}
              </div>

              {/* Bill Details Breakdown */}
              <div className="bg-slate-50 rounded-md p-3.5 space-y-2 border border-slate-200 text-xs">
                <p className="font-black text-slate-900 uppercase tracking-wider text-[10px]">Bill Summary</p>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Item Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>GST Taxes (5%)</span>
                  <span>₹{gstAmount}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Packaging Charges</span>
                  <span>₹{packagingFee}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-950 font-black border-t border-slate-200 pt-2 text-xs">
                  <span>To Pay</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white shrink-0">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full bg-[#C3A27C] hover:bg-[#B3926C] text-slate-950 rounded-md py-3.5 flex items-center justify-center gap-1.5 font-black text-xs border border-[#B2906A] shadow-2xs active:scale-[0.98] transition-transform cursor-pointer"
              >
                <span>Proceed to Order</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
            <div className="w-14 h-14 rounded-md bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-300 shadow-2xs animate-bounce">
              <span className="text-2xl font-black">✓</span>
            </div>
            <h3 className="font-black text-lg text-slate-900">Order Placed Successfully!</h3>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-xs font-black border border-emerald-200">
              <span>Order #{orderId}</span>
              <span>•</span>
              <span>⏱️ Est. Wait: 12-15 mins</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto pt-1 font-medium">
              Your order has been sent directly to the kitchen display at {tableNumber}.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <Input label="Table / Location" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
            <div className="bg-slate-50 p-3 rounded-md space-y-1.5 text-xs border border-slate-200">
              <p className="font-black text-slate-900 uppercase tracking-wider text-[10px]">Order Summary ({totalItems} items)</p>
              {cartItemsList.map((ci, idx) => (
                <div key={idx} className="flex justify-between font-medium text-slate-700">
                  <span>{ci.quantity}x {ci.item.name}</span>
                  <span className="font-mono font-bold">₹{ci.unitPrice * ci.quantity}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-950">
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
