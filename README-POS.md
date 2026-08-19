# MenuCraft Desktop POS — Billing, Order-Taking & Daily Operations

## 🎯 What This Is

This document contains the complete implementation plan to transform MenuCraft's desktop app into a **daily-use POS billing terminal** for Indian restaurants and cafes.

**Core Insight:** QR generation, menu building, theme setup — those are all one-time tasks. Once done, the restaurant owner opens MenuCraft POS every morning and uses it for exactly **3 things all day long**: Take Order → Generate Bill → Print Receipt.

---

## 📊 Gap Analysis

| Feature | Current State | Action |
| :--- | :--- | :--- |
| Take Order from Table (QR) | ✅ Works | No change |
| Take Order by Waiter | ❌ Missing | **BUILD** `/pos/quick-order` |
| Billing / Invoice Terminal | ❌ `/billing` is subscription pricing | **BUILD** `/pos` |
| GST / Tax Calculation | ❌ Missing | **BUILD** 5% / 18% auto-calc |
| Payment Modes | ❌ Missing | **BUILD** Cash / UPI / Card / Split |
| Print Bill (Thermal) | ⚠️ Basic window.print() | **ENHANCE** silent ESC/POS |
| Print KOT | ✅ Button exists in kitchen | ⚠️ Auto-print on new order |
| Order History / Day Close | ❌ In-memory, lost on restart | **BUILD** `/pos/history` |
| Table Status | ✅ Floor plan exists | ⚠️ Link to active orders |
| Kitchen Display (KDS) | ✅ Fully functional | No change |

---

## 🏗️ Architecture: 3-Screen Daily Workflow

```
CUSTOMER PHONE (unchanged)           DESKTOP POS APP (new screens)
┌─────────────────────┐              ┌──────────────────────────┐
│ QR Scan → /menu/slug│──orders──→   │ 🧾 /pos (Billing Home)  │
└─────────────────────┘              │ 📋 /pos/quick-order      │
                                     │ 📊 /pos/history          │
                                     │ 👨‍🍳 /kitchen (existing)   │
                                     └──────────────────────────┘
```

---

## 📁 Files to Create

### 1. `src/app/(dashboard)/pos/page.tsx` — Billing Terminal (DEFAULT HOME)

Split-screen POS layout:
- **LEFT (60%):** Menu categories tabs (All, Starters, Main Course, Breads & Rice, Desserts, Drinks) + searchable item grid with veg/non-veg indicators and '+' add buttons
- **RIGHT (40%):** Live bill panel with table selector, waiter name, line items with qty +/-, subtotal, GST dropdown (5% or 18%) with CGST/SGST split, discount field, grand total, payment mode buttons (Cash/UPI/Card/Split), Print Bill & Close button, Print KOT button, Hold/Cancel buttons

**Keyboard Shortcuts:** F1=New Order, F2=Print KOT, F3=Print Bill, /=Search, Esc=Cancel

**Data Source:** Import from `@/lib/mockData` → `DEMO_MENU_ITEMS`, `DEMO_CATEGORIES`, `DEMO_RESTAURANT`

**State:** selectedCategory, searchQuery, billItems[], tableNumber, waiterName, gstPercent (5|18), discountAmount, paymentMode

### 2. `src/app/api/bills/route.ts` — Bills API

Bill data model:
```typescript
interface Bill {
  id: string;                // "BILL-20260810-0042"
  restaurantId: string;
  restaurantName: string;
  tableNumber: string;
  waiterName: string;
  items: { id, name, quantity, unitPrice, lineTotal, veg }[];
  subtotal: number;
  gstPercent: number;        // 5 or 18
  cgstAmount: number;
  sgstAmount: number;
  gstAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMode: 'cash' | 'upi' | 'card' | 'split';
  status: 'open' | 'paid' | 'cancelled' | 'held';
  createdAt: string;
  closedAt?: string;
}
```

Endpoints: GET (list with ?status= filter), POST (create), PATCH (update status)
Seed with 3 sample bills.

### 3. `src/app/(dashboard)/pos/history/page.tsx` — Order History & Day Close

- Summary cards: Total Revenue, Total Orders, Avg Bill, Cash/UPI/Card breakdown
- Filter tabs: All, Paid, Cancelled, Held
- Scrollable bill list with reprint button
- Day Close report with payment mode totals

### 4. `src/app/(dashboard)/pos/quick-order/page.tsx` — Waiter Quick Order

- Simplified large-button menu grid for fast tapping
- Table assignment with visual grid
- Auto-sends KOT to kitchen on order placement
- Links to billing terminal for payment

---

## 📁 Files to Modify

### 5. `src/components/layout/Sidebar.tsx` — Reorganize Navigation

New sidebar order (POS at top):
```
📋 POS & Billing (NEW TOP)
  🧾 Billing Terminal → /pos
  📝 Quick Order → /pos/quick-order
  📊 Order History → /pos/history

🍳 Kitchen & Orders (moved up)
  👨‍🍳 Kitchen Screen → /kitchen
  🗺️ Table Map → /floorplan
  🪑 Reservations → /reservations

📋 My Menu (moved down)
  📖 Menu Items, Categories, Preview, QR Codes

📊 Business
👥 My Team
💰 Money & Growth
⚙️ Settings
```

### 6. `desktop/main.js` — Change Default Home

Change `SERVER_URL` from `/dashboard` to `/pos`
Add "Billing Terminal" as first item in system tray context menu

### 7. `src/types/index.ts` — Add Types ✅ ALREADY DONE

Bill, BillItem, PaymentMode, BillStatus types already added.

---

## 🎨 Design System Reference

Existing Tailwind classes used throughout the app:
- Surfaces: `bg-surface`, `bg-surface-container`, `bg-surface-container-low`, `bg-surface-container-lowest`
- Text: `text-on-surface`, `text-on-surface-variant`, `text-outline`
- Primary: `bg-primary`, `text-on-primary`, `bg-primary-container`
- Typography: `font-headline-lg`, `font-headline-md`, `font-body-md`, `font-label-sm`
- Cards: `rounded-2xl`, `rounded-xl`, `shadow-sm`
- Icons: `<span className="material-symbols-outlined">icon_name</span>`
- Currency: `formatCurrency(280)` → `₹280`

---

## ✅ Verification

After all files are created:
1. Run `npm run build` — must compile 0 errors
2. Run `npm run dev` — open http://localhost:3000/pos
3. Verify billing terminal loads with menu grid + bill panel
4. Add items, change qty, apply GST, select payment → total recalculates
5. Check /pos/history shows bill list
6. Check sidebar has POS section at top
