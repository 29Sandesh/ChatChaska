# 🚀 ChatChaska Customer Platform — Complete Implementation Plan

> **Version**: 2.0 (Complete — All Gaps Filled)
> **Last Updated**: August 19, 2026
> **Status**: PLANNING — Awaiting approval before execution

---

## Table of Contents

1. [Goal & Vision](#goal--vision)
2. [Architecture Overview](#architecture-overview)
3. [What Already Exists (Do NOT Rebuild)](#what-already-exists)
4. [Open Questions for Decision](#open-questions-for-decision)
5. [Phase 1: Database Schema Extensions](#phase-1-database-schema-extensions)
6. [Phase 2: Customer Discovery Platform](#phase-2-customer-discovery-platform-swiggy-dineout-style)
7. [Phase 3: QR Code Generation & Branded Templates](#phase-3-qr-code-generation--branded-templates)
8. [Phase 4: OTP Verification System](#phase-4-otp-verification-system)
9. [Phase 5: QR Scan → Menu → Order Flow](#phase-5-qr-scan--digital-menu--order-flow)
10. [Phase 6: Real-Time Order Pipeline](#phase-6-real-time-order-pipeline)
11. [Phase 7: Cafe Owner Tools](#phase-7-cafe-owner--menu-preview--profile-editor)
12. [Phase 8: Customer App Layout & Navigation](#phase-8-customer-app-layout--navigation)
13. [Phase 9: Middleware, Routing & Auth Updates](#phase-9-middleware-routing--auth-updates)
14. [Phase 10: Admin Sidebar & Navigation Updates](#phase-10-admin-sidebar--navigation-updates)
15. [Phase 11: Supabase Storage & Image Uploads](#phase-11-supabase-storage--image-uploads)
16. [Phase 12: Environment Variables & Configuration](#phase-12-environment-variables--configuration)
17. [New Dependencies](#new-dependencies)
18. [Complete File Summary](#complete-file-summary)
19. [Verification Plan](#verification-plan)

---

## Goal & Vision

Transform ChatChaska from a **cafe-owner-only POS** into a **two-sided platform**:

**Side 1 — Cafe Owners** (existing + enhanced):
- Manage their menu, staff, and billing via the POS
- Generate branded QR codes for every table
- Preview their digital menu as customers see it
- Edit their public profile (photos, location, hours, cuisine)
- Sync their local POS menu to the cloud for customer ordering
- See incoming customer QR orders in real-time and accept/reject them

**Side 2 — Customers** (entirely new):
- Browse all listed cafes in a Swiggy Dineout-style discovery app
- View cafe profiles with menus, photos, reviews, directions
- Scan a QR code at their table → view the digital menu → place an order
- Verify identity via OTP (prevents fake orders)
- Track their order in real-time (pending → confirmed → preparing → ready → served)
- View past orders and reorder from favorites

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   CUSTOMER SIDE (Public)                  │
│                                                          │
│  /explore ──── Browse & search all cafes                 │
│  /cafe/[slug] ─ Cafe profile, menu, reviews, directions  │
│  /menu/[slug] ─ QR-scanned digital menu + ordering       │
│  /menu/[slug]/status ── Real-time order tracker          │
│  /my-orders ── Customer order history                    │
│  /my-profile ─ Customer phone/name settings              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                   CAFE OWNER SIDE (Admin)                 │
│                                                          │
│  /admin/qr-codes ───── Generate & print branded QR codes │
│  /admin/menu-preview ── Live preview of customer menu    │
│  /admin/settings/profile ── Public profile editor        │
│  /admin/reviews ──────── View & reply to customer reviews│
│                                                          │
├──────────────────────────────────────────────────────────┤
│                   STAFF SIDE (POS)                        │
│                                                          │
│  /staff/pos ─── Existing POS + incoming orders drawer    │
│                 (real-time QR order notifications)        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                   BACKEND (Supabase Cloud)                │
│                                                          │
│  PostgreSQL ──── All data (cafes, menu, orders, reviews) │
│  Realtime ────── WebSocket push for live order tracking   │
│  Storage ─────── Cafe photos, logos, banners              │
│  Auth (OTP) ──── Phone verification for customers         │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                   API ROUTES                              │
│                                                          │
│  /api/public/cafes ─────── Discovery listing + search     │
│  /api/public/cafes/[slug] ─ Individual cafe data          │
│  /api/public/cafes/[slug]/reviews ── Reviews CRUD         │
│  /api/public/orders ────── Customer order placement       │
│  /api/public/qr-scan ───── QR scan logging                │
│  /api/otp/send ─────────── Generate & send OTP            │
│  /api/otp/verify ────────── Verify OTP & create session   │
│  /api/admin/qr-codes ───── QR code CRUD                   │
│  /api/admin/qr-codes/download ── QR image/PDF download    │
│  /api/admin/orders/[id]/status ── Order status updates     │
│  /api/admin/menu-sync ──── Local SQLite → Cloud sync       │
│  /api/admin/profile ────── Cafe profile CRUD               │
│  /api/admin/reviews/reply ─ Owner reply to reviews         │
│  /api/admin/storage/upload ─ Image upload to Supabase      │
└──────────────────────────────────────────────────────────┘
```

---

## What Already Exists

> **CRITICAL**: The implementing model MUST read these existing files before writing code. Many components exist and need to be **upgraded**, not rewritten.

| Component | File Path | Status |
|:---|:---|:---|
| Public Digital Menu UI | `src/app/(public)/menu/[slug]/page.tsx` | ✅ Full Swiggy-style UI — uses **mock data**, wire to real Supabase |
| Order Status Tracker | `src/app/(public)/menu/[slug]/status/page.tsx` | ✅ UI exists — uses **simulated timer**, wire to real-time |
| Orders API | `src/app/api/orders/route.ts` | ✅ Full CRUD (SQLite) |
| Reviews API | `src/app/api/reviews/route.ts` | ✅ Rating + comment (SQLite) |
| Menu Items API | `src/app/api/menu-items/route.ts` | ✅ Full CRUD with variants, addons |
| Categories API | `src/app/api/categories/route.ts` | ✅ CRUD with sort order |
| Tables API | `src/app/api/tables/route.ts` | ✅ Table management with floors |
| Customers API | `src/app/api/customers/route.ts` | ✅ CRM with phone, visits |
| QR Code Library | `qrcode` v1.5.4 in package.json | ✅ Already installed |
| TypeScript Types | `src/types/index.ts` | ✅ All base types defined + new platform types already added |
| Staff POS Flow | `src/app/(staff)/staff/pos/page.tsx` | ✅ Full KOT → Payment → Receipt |
| Supabase Client | `src/lib/cloud-db.ts` | ✅ `cloudClient` (anon) + `cloudAdminClient` (service) |
| Mock Data | `src/lib/mockData.ts` | ⚠️ Used by public menu — will be replaced |
| Middleware | `src/middleware.ts` | ⚠️ Must be updated for new public routes |
| Admin Sidebar | `src/components/layout/AdminSidebar.tsx` | ⚠️ Must add new nav links |
| Admin Layout | `src/app/(admin)/layout.tsx` | ✅ Uses AdminSidebar |

### Existing Database Schema (Supabase — already live)

**cafes** table columns:
```
id (UUID PK), name, slug (UNIQUE), owner_name, owner_email, owner_phone,
address, city, gstin, fssai, logo_url, plan, trial_started_at, trial_days,
trial_expires_at, subscription_amount, billing_cycle, last_payment_at,
next_payment_due, payment_status, max_devices, max_staff, is_active,
suspended_reason, suspended_at, created_at, updated_at
```

**cloud_menu_items** table columns (from migration 002):
```
id (TEXT), cafe_id (UUID FK), name, category, price, description,
available, veg, popular, spicy, image, synced_at
-- Composite PK: (id, cafe_id)
```

**platform_users, billing_history, device_sessions, audit_log,
cloud_bills, cloud_staff** — all already created and live.

---

## Open Questions for Decision

> These must be answered before implementation begins.

### Q1: Customer Accounts
Should customers create full accounts (name, email, password) to use the discovery app, or browse freely with OTP-only verification at the time of ordering?

**Recommendation**: Browse freely, OTP only when placing an order — lower friction = more users.

### Q2: Delivery / Takeaway
Should we support **dine-in only** or also **takeaway/pickup** orders from the discovery app?

**Recommendation**: Start with dine-in only for Phase 1, add takeaway in a future update.

### Q3: Payment via App
Should customers pay through the app (Razorpay/UPI) or should payment remain at the counter?

**Recommendation**: Keep payment at counter — avoids payment gateway complexity and commission fees.

### Q4: Cafe Onboarding for Discovery
Should ALL cafes automatically appear in the discovery app, or opt-in?

**Recommendation**: Auto-list with basic info, let owners enhance their profile for better visibility.

### Q5: SMS Gateway for OTP
Which provider to use for sending OTP SMS?

| Option | Cost | Notes |
|:---|:---|:---|
| **Twilio** | ~₹0.30/SMS | Most developer-friendly, international |
| **MSG91** | ~₹0.12/SMS | Indian-focused, cheaper |
| **Supabase Auth (Phone)** | Free (limited) | Simplest integration |
| **Console-only (Dev Mode)** | Free | OTP logged to server console |

**Recommendation**: Build with Console/Dev Mode first, add `SMS_PROVIDER` env var to switch to Twilio/MSG91 in production.

---

## Phase 1: Database Schema Extensions

**Priority**: 🔴 CRITICAL — Everything depends on this
**Status**: ✅ Migration file created, being applied to live Supabase

### What This Phase Does
Extends the Supabase PostgreSQL database with new tables for discovery, QR codes, OTP, and customer orders.

### Migration File

**File**: `supabase/migrations/004_customer_platform.sql`

**New columns added to `cafes` table**:
```
description, banner_url, state, pincode, latitude, longitude,
cuisine_tags (TEXT[]), avg_cost_for_two, is_pure_veg, is_listed,
whatsapp, instagram, google_maps_url, opening_time, closing_time,
closed_days (TEXT[]), avg_rating, total_reviews, total_orders, featured
```

**New tables created**:

| Table | Purpose | Key Columns |
|:---|:---|:---|
| `cloud_categories` | Per-cafe menu categories (cloud) | cafe_id, name, icon, sort_order, visible |
| `cafe_photos` | Gallery photos for discovery | cafe_id, url, caption, is_cover |
| `cloud_reviews` | Customer reviews per cafe | cafe_id, customer_phone, rating (1-5), food/service/ambience ratings, owner_reply |
| `qr_codes` | QR code per table | cafe_id, table_label, table_number, template_id, scan_count |
| `qr_scan_logs` | Analytics for QR scans | qr_code_id, cafe_id, device_info, scanned_at |
| `otp_verifications` | OTP codes with expiry | phone, otp_code (hashed), attempts, expires_at, session_token |
| `cloud_orders` | Customer-placed orders | cafe_id, order_number, table_number, customer_phone, items_json, status, timestamps |
| `customer_sessions` | Lightweight customer identity | phone, name, session_token, is_active |

**Triggers created**:
- `update_cafe_ratings()` — Auto-updates `avg_rating` and `total_reviews` on cafes when reviews change
- `increment_cafe_orders()` — Auto-increments `total_orders` when an order is confirmed

**New columns added to existing `cloud_menu_items`**:
```
category_id, strike_price, is_new, is_recommended, diet_type,
spicy_level, prep_time_minutes, variants_json (JSONB),
addons_json (JSONB), tags (TEXT[]), sort_order, updated_at
```

**RLS Policies**: Public read for categories, photos, reviews. Service role full access on all new tables.

**Realtime**: `cloud_orders` added to `supabase_realtime` publication for live order tracking.

### Migration Script Update

**File**: `scripts/apply-supabase-migrations.ts`
- Added `004_customer_platform.sql` to the migrations array

---

## Phase 2: Customer Discovery Platform (Swiggy Dineout-Style)

**Priority**: 🔴 HIGH
**Estimated Effort**: Large

### 2A: Discovery Homepage

**[NEW]** `src/app/(customer)/explore/page.tsx`

**Route**: `/explore`  
**Type**: Client Component (`'use client'`)

**UI Specification** (Mobile-First, Dark Theme):

1. **Hero Section** (Top 30vh):
   - Gradient overlay background image (food collage)
   - ChatChaska logo (small, top-left)
   - Location pill: `📍 Pune` with dropdown to change city
   - Heading: `"Discover the best cafes & restaurants near you"`
   - Subheading: `"Scan. Order. Enjoy. — No app download needed."`

2. **Search Bar** (Sticky):
   - Full-width input: `"Search for cafes, cuisines, or dishes..."`
   - 🔍 icon left, 🎙️ right (decorative)

3. **Quick Filter Chips** (Horizontal scroll):
   - `🌟 Top Rated` | `🔥 Trending` | `🥬 Pure Veg` | `☕ Cafes` | `🍕 Fast Food` | `🍛 Thali` | `🍰 Desserts` | `🍜 Chinese` | `💰 Under ₹300` | `🆕 Newly Opened`
   - Toggle filters, active = filled orange-500

4. **Featured Cafes Carousel** (if `featured = true`):
   - Horizontal snap, 85vw cards with banner, logo, rating, cuisine tags

5. **All Cafes Grid**:
   - 1 col mobile / 2 tablet / 3 desktop
   - Each card: Cover image (16:9), veg badge, name, cuisines, `⭐ 4.3 (210)`, `₹350 for two`, distance, open/closed status, Directions + View Menu buttons
   - Paginate 12 cafes at a time (Load More button)

6. **Empty State**: Illustration + `"No cafes found matching your filters"`

7. **Footer**: ChatChaska branding + links to About, Contact, For Cafe Owners

**Data Fetching**: `GET /api/public/cafes?city=Pune&cuisine=chinese&veg=true&sort=rating&page=1&limit=12`

**Geolocation**: Browser `navigator.geolocation` → compute distance with Haversine formula client-side

**State**: `searchQuery`, `activeFilters[]`, `selectedCity`, `cafes[]`, `page`, `hasMore`, `isLoading`

---

### 2B: Cafe Profile Page

**[NEW]** `src/app/(customer)/cafe/[slug]/page.tsx`

**Route**: `/cafe/[slug]`

**UI Specification**:

1. **Hero Banner** (40vh): Banner image, gradient overlay, back button, share button, logo, name, rating, cuisine tags, cost
2. **Quick Info Bar** (Sticky): Open/Closed status, address (tappable → Google Maps), Call + WhatsApp buttons
3. **Tab Bar** (Sticky): Menu | Photos | Reviews | Info — underline active tab
4. **Menu Tab**: Dietary toggles, collapsible category sections, menu item cards (same design as existing `/menu/[slug]`). Shows `"Scan QR at your table to place an order"` banner instead of Call Waiter/Request Bill
5. **Photos Tab**: Masonry grid → full-screen lightbox on tap
6. **Reviews Tab**: Overall rating summary, breakdown bar chart, individual review cards with owner replies, Write a Review button (requires OTP)
7. **Info Tab**: Full address with Google Maps static image, operating hours table, phone/WhatsApp/Instagram links, FSSAI license
8. **Floating CTA**: `"📱 Scan QR to Order"` → opens camera, or `"🛒 Start Ordering"` → navigates to `/menu/[slug]`

**Data Fetching**: `GET /api/public/cafes/[slug]` → returns cafe + categories + items + photos + reviews

---

### 2C: Discovery API Routes

**[NEW]** `src/app/api/public/cafes/route.ts`
```
GET /api/public/cafes
Query: city, cuisine, veg, sort (rating|reviews|distance|newest), search, page, limit
Returns: { cafes: CafePublicProfile[], total, page, hasMore }
Uses Supabase service role → query cafes WHERE is_listed = true
```

**[NEW]** `src/app/api/public/cafes/[slug]/route.ts`
```
GET /api/public/cafes/[slug]
Returns: { cafe, categories, menuItems, photos, reviews: { items, total, avgRating } }
```

**[NEW]** `src/app/api/public/cafes/[slug]/reviews/route.ts`
```
GET - Paginated reviews
POST - Submit review (requires valid session_token)
Body: { rating, comment, food_rating, service_rating, ambience_rating, session_token }
```

---

### 2D: New TypeScript Interfaces

**[MODIFY]** `src/types/index.ts` — ✅ ALREADY DONE

Added: `CafePublicProfile`, `CloudCategory`, `CloudMenuItem`, `CafePhoto`, `CloudReview`, `CloudOrder`, `CloudOrderItem`, `CloudOrderStatus`, `QRCodeRecord`, `OTPVerification`, `CustomerSession`, `QRTemplate`

---

## Phase 3: QR Code Generation & Branded Templates

**Priority**: 🔴 HIGH
**Estimated Effort**: Medium

### 3A: QR Code Generator Engine

**[NEW]** `src/lib/qr-generator.ts`

**Purpose**: Core engine for branded QR code generation.

```
Features:
1. QR data encodes: https://{domain}/menu/{slug}?table={tableNumber}&qr={qrId}
2. Center logo: ChatChaska "C" logo embedded in QR matrix
3. Bottom text: "ChatChaska" watermark below QR
4. Error correction: HIGH (30%) to survive logo overlay

Exported functions:
- generateQRDataUrl(cafeSlug, tableNumber, options): Promise<string>
- generateQRBlob(cafeSlug, tableNumber, options): Promise<Blob>
- generateBulkQRPdf(cafeSlug, tables[], templateId): Promise<Blob>
```

Uses: `qrcode` npm package (already installed) + Canvas API for rendering.
For PDF: `jsPDF` library.

---

### 3B: Five Branded Templates

**[NEW]** `src/lib/qr-templates.ts`

Each template renders the QR matrix with a branded design. All include: QR code, ChatChaska branding, cafe name, table label, "Scan to Order" instruction.

| Template ID | Name | Design |
|:---|:---|:---|
| `classic` | Classic Elegant | White card, subtle shadow border, serif cafe name, gold accent (#D4A03C) |
| `modern` | Modern Minimal | Borderless white, bold sans-serif, coral accent (#FF6B6B), table pill badge |
| `premium` | Premium Dark | Dark bg (slate-900), white+gold, gold border frame, shield logo |
| `vibrant` | Vibrant Indian | Orange→saffron gradient, mandala corners, Hindi-English tagline |
| `festive` | Festive Special | Rangoli border, seasonal themes (Diwali/Holi), sparkle logo |

**Output Sizes**:
- Print: 400×500px @ 300 DPI (table tent cards)
- Digital: 800×1000px (screens)
- Sticker: 200×250px (small labels)

---

### 3C: QR Management Dashboard

**[NEW]** `src/app/(admin)/admin/qr-codes/page.tsx`

**Route**: `/admin/qr-codes`

**UI**:
1. **Generate QR Modal** (3 steps):
   - Step 1: Select tables (checkboxes from `/api/tables`)
   - Step 2: Choose template (5 cards in carousel with live preview)
   - Step 3: Preview grid + "Generate All" button

2. **QR Codes Grid**:
   - Card per QR: image, table label, template name, scan count, last scanned, active toggle
   - Actions: Download | Print | Delete
   - Bulk actions bar: Download All as PDF | Print All

3. **Print Options Modal**: Paper size (A4/A5/Individual), cutting guidelines toggle

4. **QR Analytics Section**: Total scans today, most popular table, scans-by-hour bar chart

---

### 3D: QR API Routes

**[NEW]** `src/app/api/admin/qr-codes/route.ts`
```
GET /api/admin/qr-codes → { qrCodes: QRCodeRecord[] }
POST /api/admin/qr-codes → { tables, template_id } → { created: QRCodeRecord[] }
DELETE /api/admin/qr-codes?id={id}
```

**[NEW]** `src/app/api/admin/qr-codes/download/route.ts`
```
POST → { qr_code_ids[], format: 'png'|'pdf', size: 'print'|'digital'|'sticker' }
Returns: Binary file response
```

---

## Phase 4: OTP Verification System

**Priority**: 🔴 CRITICAL — Required before any customer can order
**Estimated Effort**: Medium

### 4A: OTP Flow

```
1. Customer enters phone number
2. Server generates 6-digit OTP, hashes with bcrypt, stores with 5-min expiry
3. OTP sent via SMS (or logged to console in dev mode)
4. Customer enters 6 digits
5. Server compares hash, max 3 attempts
6. On success: creates customer_sessions record, returns session_token
7. Session cookie set: 'chatchaska_customer_session' (HTTP-only, 24hr)
```

### 4B: SMS Gateway Strategy

Build with **Console/Dev Mode** first (OTP printed to server console). Add `SMS_PROVIDER` env var:
- `SMS_PROVIDER=console` → logs OTP to server (free, for development)
- `SMS_PROVIDER=twilio` → sends via Twilio API
- `SMS_PROVIDER=msg91` → sends via MSG91 API

### 4C: OTP API Routes

**[NEW]** `src/app/api/otp/send/route.ts`
```
POST /api/otp/send
Body: { phone, cafe_id?, table_number?, purpose? }
Validations:
  - Phone: /^[6-9]\d{9}$/ (Indian 10-digit)
  - Rate limit: Max 3 requests per phone per 15 minutes
  - Cooldown: If unexpired OTP < 30 seconds old, return "Please wait"
Logic:
  - Generate: Math.floor(100000 + Math.random() * 900000)
  - Hash with bcrypt (10 rounds)
  - Store in otp_verifications (expires_at = now + 5 minutes)
  - Dispatch via SMS_PROVIDER
Returns: { success: true, expiresIn: 300 }
```

**[NEW]** `src/app/api/otp/verify/route.ts`
```
POST /api/otp/verify
Body: { phone, otp }
Validations:
  - OTP exactly 6 digits
  - Find latest non-expired, non-verified record for phone
  - attempts < 3
  - Compare with bcrypt hash
On success:
  - Mark verified, create customer_sessions, generate UUID session_token
  - Set cookie: 'chatchaska_customer_session' (httpOnly, maxAge: 86400)
  - Return { verified: true, session_token }
On failure:
  - Increment attempts
  - Return { verified: false, attemptsRemaining }
```

### 4D: OTP Verification UI Component

**[NEW]** `src/components/customer/OTPVerificationSheet.tsx`

**Type**: Bottom Sheet / Modal (Client Component)

1. **Phone Input Screen**: Title, `+91 🇮🇳` prefix, 10-digit input, "Send OTP" button
2. **OTP Entry Screen**: 6 individual digit boxes (auto-advance), countdown timer (30s), resend link, shake animation on wrong, "Change Phone Number" link
3. **Success Screen**: Green checkmark, "✅ Verified!", optional name input, auto-dismiss after 1.5s

**State**: `step: 'phone'|'otp'|'success'`, `phone`, `otpDigits[6]`, `resendTimer`, `attemptsRemaining`, `isLoading`, `error`

---

## Phase 5: QR Scan → Digital Menu → Order Flow

**Priority**: 🔴 CRITICAL
**Estimated Effort**: Large

### 5A: Wire Existing Menu to Real Data

**[MODIFY]** `src/app/(public)/menu/[slug]/page.tsx`

> Do NOT rewrite — modify specific sections only.

**Changes**:
1. **Replace mock data imports**: Remove `import { DEMO_RESTAURANT, ... } from '@/lib/mockData'`. Add Supabase fetching for cafe, categories, and menu items by slug.
2. **Read table from URL**: Parse `?table=T5&qr=qr-xyz` via `useSearchParams()`. If no `?table`, show `"Scan QR at your table to enable ordering"` banner.
3. **Log QR scan**: If `qr` param present, POST to `/api/public/qr-scan` to log analytics.
4. **OTP gate before ordering**: Before order submission, check `chatchaska_customer_session` cookie. If not verified, open `<OTPVerificationSheet />`. After verification, proceed.
5. **Submit to cloud**: Change from `POST /api/orders` (SQLite) to `POST /api/public/orders` (Supabase cloud_orders).
6. **Loading/error states**: Skeleton cards while loading, "Cafe not found" error, "Currently closed" message.

### 5B: Real-Time Order Tracker

**[MODIFY]** `src/app/(public)/menu/[slug]/status/page.tsx`

**Changes**:
1. **Replace simulated timer**: Remove `setInterval`. Add Supabase real-time channel subscription on `cloud_orders` table filtered by order ID.
2. **Read order from URL**: Parse `?order=ord-xxx`, fetch initial state from Supabase on mount.
3. **Status step mapping**: pending→1, confirmed→2, preparing→3, ready→4, served→5, rejected→error
4. **Real timestamps**: Display `confirmed_at`, `preparing_at`, `ready_at`, `served_at`
5. **Browser notification**: On status `'ready'`, fire `new Notification('🔔 Your order is ready!')`

### 5C: Customer Order API

**[NEW]** `src/app/api/public/orders/route.ts`
```
POST /api/public/orders
Body: { cafe_id, table_number, session_token, items[], subtotal, total_amount, special_instructions?, source }
Validations:
  1. Verify session_token in customer_sessions
  2. Verify cafe_id exists and is_listed = true
  3. Verify ≥1 item
  4. Verify item IDs exist in cloud_menu_items for this cafe
  5. SERVER-SIDE price recalculation (don't trust client)
Logic:
  - Generate order_number: "ORD-{4-digit, incrementing per cafe}"
  - Calculate GST: subtotal × 0.05
  - Insert into cloud_orders → triggers Supabase Realtime push to Staff POS
Returns: { order: CloudOrder }

GET /api/public/orders?order_id={id}&session_token={token}
Returns: current order status for initial page load
```

**[NEW]** `src/app/api/public/qr-scan/route.ts`
```
POST /api/public/qr-scan
Body: { qr_code_id }
Logs to qr_scan_logs, increments scan_count on qr_codes
Returns: { cafe_slug, table_number }
```

### 5D: Order Number Generation Strategy

Each cafe maintains its own order counter. On each new order:
1. Query: `SELECT COUNT(*) FROM cloud_orders WHERE cafe_id = $1 AND DATE(created_at) = CURRENT_DATE`
2. Generate: `ORD-${(count + 1).toString().padStart(4, '0')}` → e.g., `ORD-0042`
3. This resets daily (per cafe), so order numbers stay short and readable.

---

## Phase 6: Real-Time Order Pipeline

**Priority**: 🔴 CRITICAL
**Estimated Effort**: Medium

### 6A: Staff POS — Incoming Orders

**[MODIFY]** `src/app/(staff)/staff/pos/page.tsx`

**Add** (alongside existing POS):

1. **Notification Bell** (top-right header): Badge count of pending orders `🔴 3`
2. **Incoming Orders Drawer** (slides from right):
   - Lists `cloud_orders WHERE status = 'pending' AND cafe_id = $cafeId`
   - Each card: order_number, table, customer name/phone, time ago, items list, total, special instructions
   - Two buttons: `✅ Accept` (green) | `❌ Reject` (red)
   - Accept → `PATCH status='confirmed'`, sets `confirmed_at`
   - Reject → rejection reason modal → `PATCH status='rejected'`
   - **Audio notification**: Play chime sound on new order

3. **Supabase Real-Time Subscription**:
```javascript
supabase.channel('incoming-orders')
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'cloud_orders',
    filter: `cafe_id=eq.${cafeId}`
  }, (payload) => {
    // Add to list, play sound, show toast
  })
  .subscribe();
```

### 6B: Incoming Orders Drawer Component

**[NEW]** `src/components/staff/IncomingOrdersDrawer.tsx`

Extracted as a reusable component. Props: `cafeId`, `isOpen`, `onClose`, `onAccept`, `onReject`.

### 6C: Kitchen Display Integration

When staff clicks **Accept**:
1. Create local `order` record via existing `POST /api/orders`
2. Update table status to `'running'` via `PATCH /api/tables`
3. Existing KDS flow picks it up automatically (no changes needed to kitchen display)

### 6D: Order Status Update API

**[NEW]** `src/app/api/admin/orders/[id]/status/route.ts`
```
PATCH /api/admin/orders/[id]/status
Body: { status, reason? }
Updates cloud_orders in Supabase with corresponding timestamp field
Supabase Realtime automatically pushes to customer's tracker
```

### 6E: Notification Sound

**[NEW]** `public/sounds/order-chime.mp3`

- Short, pleasant chime/bell sound (< 2 seconds)
- Played via `new Audio('/sounds/order-chime.mp3').play()` when a new order arrives
- Source: Use a royalty-free notification sound, or generate one programmatically

---

## Phase 7: Cafe Owner — Menu Preview & Profile Editor

**Priority**: 🟡 MEDIUM
**Estimated Effort**: Medium

### 7A: Live Menu Preview

**[NEW]** `src/app/(admin)/admin/menu-preview/page.tsx`

**Route**: `/admin/menu-preview`

1. **Split Layout**: Left (40%) = iPhone device frame with iframe of `/menu/[slug]?preview=true`. Right (60%) = quick edit panel with available/popular/new toggles and price edits.
2. **Device Toggle**: Phone | Tablet | Desktop preview sizes.
3. **"Share Preview Link"** button: Generates QR code on screen for owner to scan with phone.
4. **"✅ Sync Menu to Cloud"**: Reads local SQLite menu, upserts to Supabase `cloud_menu_items` and `cloud_categories`.

### 7B: Cafe Profile Editor

**[NEW]** `src/app/(admin)/admin/settings/profile/page.tsx`

**Route**: `/admin/settings/profile`

Sections:
1. **Basic Info**: Name, description (200 chars), cuisine tags (multi-select chips), avg cost for two, pure veg toggle
2. **Branding**: Logo upload (512×512), banner upload (1200×600), gallery photos (up to 10) — all to Supabase Storage
3. **Location**: Full address, city dropdown, state, pincode, "📍 Set on Map" button (or manual lat/lng), Google Maps URL (auto-generated)
4. **Contact**: Phone, WhatsApp, Instagram, Facebook
5. **Hours**: Opening/closing time pickers, closed days checkboxes (Mon–Sun)
6. **Visibility**: "List on ChatChaska Discovery" master toggle, "Featured" badge (read-only, Super Admin only)
7. **Save & Sync** button → Updates `cafes` table in Supabase

### 7C: Owner Review Reply

**[NEW]** `src/app/(admin)/admin/reviews/page.tsx`

**Route**: `/admin/reviews`

- Lists all reviews for this cafe from `cloud_reviews`
- Each card: customer name, star rating, date, comment, sub-ratings
- **"Reply" button** → Opens inline textarea for owner to type a reply
- On submit: `PATCH /api/admin/reviews/reply` → updates `owner_reply` and `owner_replied_at`

### 7D: Menu Cloud Sync API

**[NEW]** `src/app/api/admin/menu-sync/route.ts`
```
POST /api/admin/menu-sync
Reads all menu_items and categories from local SQLite
Upserts into cloud_menu_items and cloud_categories in Supabase
Field mapping:
  - local veg (1/0) → cloud diet_type ('veg'/'non-veg')
  - local variants_json (string) → cloud variants_json (JSONB)
  - local addons_json (string) → cloud addons_json (JSONB)
  - local tags_json (string) → cloud tags (TEXT[])
Returns: { synced: { categories: number, items: number }, errors: string[] }
```

### 7E: Profile & Review Reply APIs

**[NEW]** `src/app/api/admin/profile/route.ts`
```
GET /api/admin/profile → current cafe profile from Supabase
PUT /api/admin/profile → update cafe profile
POST /api/admin/profile/photos → upload photo to Supabase Storage + add to cafe_photos
DELETE /api/admin/profile/photos?id={id} → remove photo
```

**[NEW]** `src/app/api/admin/reviews/reply/route.ts`
```
PATCH /api/admin/reviews/reply
Body: { review_id, reply_text }
Updates cloud_reviews: owner_reply = reply_text, owner_replied_at = now()
```

---

## Phase 8: Customer App Layout & Navigation

**Priority**: 🟡 MEDIUM
**Estimated Effort**: Small

### 8A: Customer Layout

**[NEW]** `src/app/(customer)/layout.tsx`

- **Mobile Bottom Tab Bar** (fixed, 5 tabs):
  - 🏠 Home → `/explore`
  - 🔍 Search → `/explore?focus=search`
  - 📱 Scan QR → Opens camera scanner (center, highlighted/accent)
  - 🛒 Orders → `/my-orders`
  - 👤 Profile → `/my-profile`

- **App Header** (transparent on heroes): ChatChaska logo, location indicator, notification bell

### 8B: Customer Order History

**[NEW]** `src/app/(customer)/my-orders/page.tsx`

- Lists past orders from `cloud_orders` filtered by `customer_phone` (from session cookie)
- Each card: Order number, cafe name, items summary, total, status badge, date
- Tappable → full order detail breakdown
- **"Reorder" button** → Navigates to `/menu/[slug]?reorder={orderId}`

### 8C: Reorder Flow

When `/menu/[slug]?reorder={orderId}` is loaded:
1. Fetch the original order's `items_json` from `cloud_orders`
2. Map each item to the current `cloud_menu_items` (verify still available, check price changes)
3. Pre-populate the cart with matched items
4. Show a toast: `"3 of 4 items added to cart. 1 item is no longer available."`
5. Customer can modify quantities and add more items before placing the new order

### 8D: Customer Profile

**[NEW]** `src/app/(customer)/my-profile/page.tsx`

- Phone number (verified, display only)
- Name (editable, saved to customer_sessions)
- "My Reviews" section
- "Logout" button → clears `chatchaska_customer_session` cookie

### 8E: QR Scanner Component

**[NEW]** `src/components/customer/QRScannerSheet.tsx`

- Uses `html5-qrcode` npm package for camera QR scanning
- Full-screen overlay with viewfinder UI
- On scan: Parse URL → extract `slug` and `table` → navigate to `/menu/{slug}?table={table}`
- Invalid QR: Show `"This QR code is not from ChatChaska"`

---

## Phase 9: Middleware, Routing & Auth Updates

**Priority**: 🔴 CRITICAL — Without this, new pages won't load
**Estimated Effort**: Small

### 9A: Middleware Updates

**[MODIFY]** `src/middleware.ts`

**Current state**: All routes except `/login`, `/signup`, `/menu/*`, `/api/auth/*` require authentication via `chatchaska_session` cookie.

**Required changes**:

1. **Add to `PUBLIC_ROUTES` array**:
```typescript
const PUBLIC_ROUTES = [
  '/login', '/signup', '/api/auth/login', '/api/auth/logout', '/menu',
  '/explore',       // Customer discovery homepage
  '/bill',          // Public bill viewer (already working)
];
```

2. **Add to `PUBLIC_PREFIXES` array**:
```typescript
const PUBLIC_PREFIXES = [
  '/api/auth/', '/menu/', '/_next/', '/favicon', '/chaska',
  '/manifest.json', '/icon.png',
  '/explore/',      // Customer discovery pages
  '/cafe/',         // Individual cafe profiles
  '/api/public/',   // All public API routes (cafes, orders, QR scan)
  '/api/otp/',      // OTP send/verify (unauthenticated customers)
  '/bill/',         // Public bill viewer
];
```

3. **Add customer session route protection** (new section after staff routes):
```typescript
// ── Customer Routes (require customer session) ──────────
if (pathname.startsWith('/my-orders') || pathname.startsWith('/my-profile')) {
  const customerSession = request.cookies.get('chatchaska_customer_session');
  if (!customerSession) {
    // Redirect to explore page (they need to verify phone first)
    return NextResponse.redirect(new URL('/explore', request.url));
  }
}
```

### 9B: Customer Session Cookie Handling

**Cookie name**: `chatchaska_customer_session`
**Cookie value**: UUID session_token (plain, not base64 encoded like the admin session)
**HttpOnly**: true (prevents XS S)
**Secure**: true in production
**SameSite**: lax
**MaxAge**: 86400 (24 hours)
**Path**: `/`

**Validation**: On protected customer routes (`/my-orders`, `/my-profile`), middleware reads the cookie value and checks if a matching `customer_sessions` record exists with `is_active = true`.

---

## Phase 10: Admin Sidebar & Navigation Updates

**Priority**: 🟡 MEDIUM
**Estimated Effort**: Small

### 10A: Admin Sidebar Navigation

**[MODIFY]** `src/components/layout/AdminSidebar.tsx`

Add 3 new navigation items to the `adminNavItems` array:

```typescript
const adminNavItems: AdminNavItem[] = [
  { id: 'dashboard', label: 'My Cafe', href: '/admin', icon: 'dashboard' },
  { id: 'menu', label: 'Menu', href: '/admin/menu', icon: 'restaurant_menu' },
  { id: 'reports', label: 'Sales', href: '/admin/reports', icon: 'analytics' },
  { id: 'staff', label: 'Staff', href: '/admin/staff', icon: 'badge' },
  // NEW: Customer Platform Features
  { id: 'qr-codes', label: 'QR Codes', href: '/admin/qr-codes', icon: 'qr_code_2' },
  { id: 'menu-preview', label: 'Menu Preview', href: '/admin/menu-preview', icon: 'visibility' },
  { id: 'reviews', label: 'Reviews', href: '/admin/reviews', icon: 'reviews' },
  { id: 'settings', label: 'Settings', href: '/admin/settings/gst', icon: 'settings' },
];
```

### 10B: Settings Sub-Navigation

The existing settings page is at `/admin/settings/gst`. The new profile editor is at `/admin/settings/profile`.

**[NEW]** `src/app/(admin)/admin/settings/layout.tsx` (if not exists)

Add a horizontal tab bar at the top of the settings section:
- **GST & Billing** → `/admin/settings/gst`
- **Public Profile** → `/admin/settings/profile`

This ensures the cafe owner can easily switch between tax settings and their public discovery profile.

---

## Phase 11: Supabase Storage & Image Uploads

**Priority**: 🟡 MEDIUM
**Estimated Effort**: Small

### 11A: Storage Bucket Setup

Create a Supabase Storage bucket called `cafe-assets` with the following structure:

```
cafe-assets/
├── {cafe_id}/
│   ├── logo.png          (café logo, 512×512)
│   ├── banner.jpg         (café banner, 1200×600)
│   └── photos/
│       ├── photo-1.jpg
│       ├── photo-2.jpg
│       └── ...
```

**Bucket Policy**: Public read (anyone can view images via URL), authenticated write (only the cafe's owner can upload).

**Setup**: This needs to be done via the Supabase Dashboard:
1. Go to Storage → New Bucket → Name: `cafe-assets` → Public: ON
2. Add RLS policy: Allow INSERT for authenticated users where `bucket_id = 'cafe-assets'`

### 11B: Image Upload API

**[NEW]** `src/app/api/admin/storage/upload/route.ts`

```
POST /api/admin/storage/upload
Body: FormData with 'file' field + 'type' ('logo'|'banner'|'photo')
Logic:
  1. Validate file type (image/jpeg, image/png, image/webp)
  2. Validate file size (max 5MB)
  3. Compress/resize if needed (sharp library or client-side)
  4. Upload to Supabase Storage: cafe-assets/{cafe_id}/{type}/{filename}
  5. Get public URL
  6. Update cafes table (logo_url/banner_url) or insert into cafe_photos
Returns: { url: string, id?: string }
```

### 11C: Image Optimization

Images should be optimized before upload:
- **Client-side**: Use Canvas API to resize before sending
- **Max dimensions**: Logo 512×512, Banner 1200×600, Photos 1200×900
- **Max file size**: 5MB per image
- **Formats accepted**: JPEG, PNG, WebP
- **Consider**: Adding `sharp` as an optional dependency for server-side optimization

---

## Phase 12: Environment Variables & Configuration

**Priority**: 🔴 CRITICAL
**Estimated Effort**: Small

### 12A: New Environment Variables

Add to `.env.local`:

```bash
# ── Existing (already configured) ──────────────────
GROQ_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://eyrbndkelwcrevreopjg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_DB_PASSWORD=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPER_ADMIN_EMAIL=29sandesh.agrawal@gmail.com
SUPER_ADMIN_PASSWORD=Sejal_2912

# ── NEW: Customer Platform Config ──────────────────

# SMS Provider for OTP ('console' | 'twilio' | 'msg91')
SMS_PROVIDER=console

# Twilio credentials (only needed if SMS_PROVIDER=twilio)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=

# MSG91 credentials (only needed if SMS_PROVIDER=msg91)
# MSG91_AUTH_KEY=
# MSG91_TEMPLATE_ID=
# MSG91_SENDER_ID=

# App domain (used in QR code URLs)
NEXT_PUBLIC_APP_DOMAIN=https://chatchaska.vercel.app

# Google Maps API key (for location picker and directions)
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

### 12B: Vercel Environment Variables

When deploying to Vercel, ALL of the above must be added in the Vercel project settings under "Environment Variables". The following are **required**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMS_PROVIDER` (set to `console` initially)
- `NEXT_PUBLIC_APP_DOMAIN` (set to your Vercel URL or custom domain)

### 12C: Domain-Aware QR URL Generation

The QR generator must use `NEXT_PUBLIC_APP_DOMAIN` to construct QR URLs:
```typescript
const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3000';
const qrUrl = `${domain}/menu/${cafeSlug}?table=${tableNumber}&qr=${qrId}`;
```

This ensures QR codes work in development (`localhost:3000`) and production (`chatchaska.vercel.app` or `chatchaska.com`).

---

## New Dependencies

```bash
# Already installed
npm install jspdf html5-qrcode

# Already in package.json
# qrcode v1.5.4, @types/qrcode, @supabase/supabase-js, bcrypt
```

**Optional** (if server-side image optimization is needed):
```bash
npm install sharp
```

> **Note**: `canvas` (node-canvas) is NOT needed. All QR template rendering uses the browser Canvas API (client-side). This avoids native build issues on Vercel.

---

## Complete File Summary

### New Files (30 files)

| # | File | Phase | Purpose |
|:--|:---|:--|:---|
| 1 | `supabase/migrations/004_customer_platform.sql` | 1 | Database tables, triggers, RLS, realtime |
| 2 | `src/app/(customer)/explore/page.tsx` | 2 | Discovery homepage (Swiggy Dineout-style) |
| 3 | `src/app/(customer)/cafe/[slug]/page.tsx` | 2 | Cafe profile with menu, photos, reviews |
| 4 | `src/app/(customer)/layout.tsx` | 8 | Customer app shell + bottom tab bar |
| 5 | `src/app/(customer)/my-orders/page.tsx` | 8 | Customer order history + reorder |
| 6 | `src/app/(customer)/my-profile/page.tsx` | 8 | Customer profile settings |
| 7 | `src/app/(admin)/admin/qr-codes/page.tsx` | 3 | QR code management dashboard |
| 8 | `src/app/(admin)/admin/menu-preview/page.tsx` | 7 | Live customer menu preview |
| 9 | `src/app/(admin)/admin/settings/profile/page.tsx` | 7 | Public profile editor |
| 10 | `src/app/(admin)/admin/reviews/page.tsx` | 7 | Review management + owner replies |
| 11 | `src/app/(admin)/admin/settings/layout.tsx` | 10 | Settings sub-navigation tabs |
| 12 | `src/app/api/public/cafes/route.ts` | 2 | Discovery listing API |
| 13 | `src/app/api/public/cafes/[slug]/route.ts` | 2 | Individual cafe data API |
| 14 | `src/app/api/public/cafes/[slug]/reviews/route.ts` | 2 | Reviews API (GET + POST) |
| 15 | `src/app/api/public/orders/route.ts` | 5 | Customer order placement |
| 16 | `src/app/api/public/qr-scan/route.ts` | 5 | QR scan logging |
| 17 | `src/app/api/otp/send/route.ts` | 4 | OTP generation & dispatch |
| 18 | `src/app/api/otp/verify/route.ts` | 4 | OTP verification & session creation |
| 19 | `src/app/api/admin/qr-codes/route.ts` | 3 | QR code CRUD |
| 20 | `src/app/api/admin/qr-codes/download/route.ts` | 3 | QR image/PDF download |
| 21 | `src/app/api/admin/orders/[id]/status/route.ts` | 6 | Order status updates |
| 22 | `src/app/api/admin/menu-sync/route.ts` | 7 | Local → Cloud menu sync |
| 23 | `src/app/api/admin/profile/route.ts` | 7 | Cafe profile CRUD |
| 24 | `src/app/api/admin/reviews/reply/route.ts` | 7 | Owner reply to reviews |
| 25 | `src/app/api/admin/storage/upload/route.ts` | 11 | Image upload to Supabase Storage |
| 26 | `src/lib/qr-generator.ts` | 3 | QR code generation engine |
| 27 | `src/lib/qr-templates.ts` | 3 | 5 branded QR templates |
| 28 | `src/components/customer/OTPVerificationSheet.tsx` | 4 | OTP bottom sheet UI |
| 29 | `src/components/customer/QRScannerSheet.tsx` | 8 | Camera QR scanner overlay |
| 30 | `src/components/staff/IncomingOrdersDrawer.tsx` | 6 | Staff POS incoming orders panel |

### Modified Files (7 files)

| # | File | Phase | Change |
|:--|:---|:--|:---|
| 1 | `src/app/(public)/menu/[slug]/page.tsx` | 5 | Replace mock data → Supabase, add OTP gate, table from URL |
| 2 | `src/app/(public)/menu/[slug]/status/page.tsx` | 5 | Replace timer → Supabase real-time subscription |
| 3 | `src/app/(staff)/staff/pos/page.tsx` | 6 | Add incoming orders bell + drawer + real-time |
| 4 | `src/types/index.ts` | 2 | ✅ DONE — New interfaces added |
| 5 | `scripts/apply-supabase-migrations.ts` | 1 | ✅ DONE — Added migration 004 |
| 6 | `src/middleware.ts` | 9 | Add public routes, customer session check |
| 7 | `src/components/layout/AdminSidebar.tsx` | 10 | Add QR Codes, Menu Preview, Reviews nav items |

### New Assets (1 file)

| # | File | Purpose |
|:--|:---|:---|
| 1 | `public/sounds/order-chime.mp3` | Notification sound for incoming customer orders |

---

## Verification Plan

### Automated Tests

```bash
# TypeScript compilation — must pass with 0 errors
npx tsc --noEmit

# Next.js production build — all routes must compile
npm run build

# Run existing architecture verification
npx tsx scripts/verify-architecture.ts
```

### Manual Verification Checklist

**Discovery & Browsing:**
- [ ] `/explore` loads cafes from Supabase with images, ratings, filters
- [ ] Search by cafe name and cuisine works
- [ ] Filter by Pure Veg, Top Rated, etc. works
- [ ] Click cafe card → `/cafe/[slug]` shows profile, menu, photos, reviews, info
- [ ] "Get Directions" opens Google Maps with correct lat/lng
- [ ] Share button uses Web Share API

**QR Code System:**
- [ ] `/admin/qr-codes` shows QR management dashboard
- [ ] Generate QR for 5 tables → all 5 templates render correctly
- [ ] Cafe name and ChatChaska branding visible on all templates
- [ ] Download single QR as PNG
- [ ] Download all QR as multi-page PDF with cutting guidelines
- [ ] Print dialog works correctly
- [ ] QR scan count increments when scanned

**OTP & Ordering:**
- [ ] Scan QR → menu loads with correct table number pre-filled
- [ ] Add items to cart → tap Proceed → OTP sheet opens
- [ ] Enter phone → OTP generated (visible in server console in dev mode)
- [ ] Enter correct 6-digit OTP → verified, session created
- [ ] Wrong OTP → shake animation, attempts decremented
- [ ] 3 wrong attempts → locked out, must request new OTP
- [ ] Place order → appears in Staff POS drawer within 1 second

**Real-Time Pipeline:**
- [ ] Staff sees 🔴 badge count on notification bell
- [ ] Staff opens drawer → sees pending order details
- [ ] Staff clicks Accept → customer tracker shows "Confirmed" instantly
- [ ] Staff updates to "Preparing" → customer sees it live
- [ ] Staff updates to "Ready" → customer gets browser notification
- [ ] Staff updates to "Served" → tracker shows complete
- [ ] Staff clicks Reject → customer sees rejection reason
- [ ] Chime sound plays on new incoming order

**Cafe Owner Tools:**
- [ ] `/admin/menu-preview` shows phone-frame preview with real menu
- [ ] "Sync Menu to Cloud" uploads all local items to Supabase
- [ ] `/admin/settings/profile` shows all editable fields
- [ ] Logo/banner/photo upload saves to Supabase Storage
- [ ] Profile changes appear on `/cafe/[slug]` immediately
- [ ] `/admin/reviews` shows all reviews with reply button
- [ ] Owner reply appears on public review card

**Customer App:**
- [ ] Bottom tab bar visible on all customer pages
- [ ] Scan QR tab opens camera scanner
- [ ] `/my-orders` shows past orders sorted by date
- [ ] "Reorder" pre-fills cart with previous items (checks availability)
- [ ] `/my-profile` shows verified phone, editable name
- [ ] Logout clears session cookie

**Middleware & Auth:**
- [ ] `/explore` loads without login
- [ ] `/cafe/[slug]` loads without login
- [ ] `/my-orders` redirects to `/explore` if no customer session
- [ ] `/admin/qr-codes` requires admin login
- [ ] `/api/public/*` routes work without auth
- [ ] `/api/admin/*` routes require admin auth

---

## Execution Order (Recommended)

For the implementing model, execute phases in this order to minimize dependency issues:

```
Phase 1  → Database migration (foundation for everything)
Phase 12 → Environment variables (needed by APIs)
Phase 9  → Middleware updates (needed for new routes to work)
Phase 10 → Admin sidebar updates (needed for navigation)
    ↓
Phase 2  → Discovery API routes + types (data layer)
Phase 4  → OTP system (needed before ordering)
Phase 3  → QR generator + templates (can parallel with above)
    ↓
Phase 5  → Wire menu to real data + customer order API
Phase 6  → Real-time pipeline + staff POS changes
    ↓
Phase 7  → Cafe owner tools (menu preview, profile, reviews)
Phase 8  → Customer layout + order history + scanner
Phase 11 → Storage & image uploads
    ↓
Verification → tsc, build, manual testing
```
