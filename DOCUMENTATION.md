# MenuCraft — Complete Architecture & Handoff Documentation

MenuCraft is an enterprise-ready SaaS platform built using **Next.js 15 App Router**, **TypeScript**, **Vanilla CSS custom properties**, and **Supabase Backend**.

---

## 1. Directory Structure

```
menucraft/
├── public/                     ← Favicons & static SVGs
├── supabase/
│   ├── migrations/             ← 001_initial_schema.sql (14 tables, indexes & RLS)
│   └── seed.sql                ← Mock database seed data
├── vercel.json                 ← Deployment & Security Headers configuration
├── src/
│   ├── app/
│   │   ├── (auth)/             ← Login & Signup pages
│   │   ├── (dashboard)/        ← CRM Shell, Sidebar & Admin Pages
│   │   │   ├── dashboard/      ← Screen 3: KPI Overview
│   │   │   ├── kitchen/        ← Kitchen Display System (KDS)
│   │   │   ├── locations/      ← Multi-Location Outlets Manager
│   │   │   ├── inventory/      ← Ingredient Stock & 86ing Manager
│   │   │   ├── admin/          ← Super Admin SaaS Dashboard
│   │   │   ├── billing/        ← Screen 13: Stripe Subscription & Billing
│   │   │   ├── notifications/  ← Screen 14: Notification Feed & Settings
│   │   │   ├── profile/        ← Screen 15: Profile & 2FA Settings
│   │   │   ├── team/           ← Screen 12: Team Management
│   │   │   └── restaurants/[id]/
│   │   │       ├── settings/   ← Screen 4: Restaurant Info & Operating Hours
│   │   │       ├── categories/ ← Screen 5: Reorderable Menu Categories
│   │   │       ├── items/      ← Screen 6: Menu Items List & AI Import
│   │   │       ├── preview/    ← Screen 8: Live Device Mockup Preview
│   │   │       ├── themes/     ← Screen 9: Theme Customizer Split View
│   │   │       ├── qr-codes/   ← Screen 10: QR Code Generator & Canvas
│   │   │       ├── analytics/  ← Screen 11: Recharts Analytics & Heatmaps
│   │   │       ├── reviews/    ← Customer Review Manager & Ratings
│   │   │       └── integrations/← POS Connectors & Webhooks Config
│   │   ├── (public)/
│   │   │   └── menu/[slug]/    ← Screen 7: Customer Digital Menu & Live Status
│   │   └── api/
│   │       ├── ai/             ← Gemini AI (Extract, Rewrite, Translate, Upsell)
│   │       ├── orders/         ← Orders REST API (GET, POST, PATCH)
│   │       └── reviews/        ← Customer Dish Reviews API
│   ├── components/
│   │   ├── ui/                 ← Button, Card, Input, Textarea, Select, Toggle, Badge, Modal, DataTable
│   │   └── layout/             ← Sidebar, TopBar, MobileHeader
│   ├── styles/
│   │   ├── design-tokens.css   ← CSS Custom Properties & Color Scale
│   │   ├── typography.css      ← Font typography scale
│   │   ├── components.css      ← Button, Card, Form & Table styles
│   │   └── layouts.css         ← 260px fixed Sidebar & responsive grid
│   ├── lib/
│   │   ├── supabase/           ← SSR & Browser Supabase clients
│   │   └── utils.ts            ← Utility helpers
│   └── types/
│       └── index.ts            ← TypeScript Interfaces
```

---

## 2. Complete App Routes List (26 Routes)

| Path | Type | Auth | Description |
|---|---|---|---|
| `/` | Page | Public | Landing Page & Hero Mockup |
| `/login` | Page | Public | User Login Form |
| `/signup` | Page | Public | User Registration |
| `/dashboard` | Page | Protected | Main KPI Dashboard |
| `/kitchen` | Page | Protected | Kitchen Display System (KDS) |
| `/locations` | Page | Protected | Multi-Location Branch Manager |
| `/inventory` | Page | Protected | Ingredient Stock & 86ing Manager |
| `/admin` | Page | Admin | Super Admin SaaS Overview |
| `/billing` | Page | Protected | Stripe Subscription & Invoices |
| `/notifications` | Page | Protected | Notification Feed & Settings |
| `/profile` | Page | Protected | User Profile & Security |
| `/team` | Page | Protected | Team Roster & Invitations |
| `/restaurants/[id]/settings` | Page | Protected | Restaurant Hours & Logo |
| `/restaurants/[id]/categories` | Page | Protected | Menu Categories List |
| `/restaurants/[id]/items` | Page | Protected | Menu Items List & AI Import |
| `/restaurants/[id]/items/[itemId]` | Page | Protected | Item Editor & ✨ AI Rewrite |
| `/restaurants/[id]/preview` | Page | Protected | Live Phone Mockup Preview |
| `/restaurants/[id]/themes` | Page | Protected | Theme Color/Font Customizer |
| `/restaurants/[id]/qr-codes` | Page | Protected | QR Generator & Downloads |
| `/restaurants/[id]/analytics` | Page | Protected | Recharts Analytics & Heatmaps |
| `/restaurants/[id]/reviews` | Page | Protected | Customer Review Manager |
| `/restaurants/[id]/integrations` | Page | Protected | POS & Webhooks Settings |
| `/menu/[slug]` | Page | Public | Customer Digital QR Menu |
| `/menu/[slug]/status` | Page | Public | Live Customer Order Status |
| `/api/ai/*` | API | Protected | Gemini AI Endpoints |
| `/api/orders` | API | Public/Prot | Orders REST Endpoint |
| `/api/reviews` | API | Public | Ratings & Reviews Endpoint |

---

## 3. Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GOOGLE_GEMINI_API_KEY=your-gemini-api-key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 4. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start Next.js development server
npm run dev

# 3. Run ESLint check
npm run lint

# 4. Run TypeScript check
npx tsc --noEmit

# 5. Build for production
npm run build
```
