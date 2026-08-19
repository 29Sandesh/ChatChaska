# 🍵 ChatChaska — Smart Restaurant POS & Customer Discovery Platform

<p align="center">
  <img src="public/chaska-c-logo.png" alt="ChatChaska Logo" width="100" />
</p>

ChatChaska is an offline-first, lightning-fast Point of Sale (POS), Kitchen Display System (KDS), and customer QR self-ordering ecosystem built for modern Indian cafes, bakeries, and restaurants.

---

## ✨ Key Features

### 🖥️ Cafe Staff & Billing Terminal
- **Sub-100ms Billing**: Zero-lag SQLite local cache with instant thermal receipt & KOT printing.
- **Dynamic NPCI UPI Pay-at-Table**: Pre-filled bill QR codes with 1-tap Google Pay / PhonePe deep links.
- **Touchscreen PIN Keypad**: Fast 4-digit PIN authentication for cashiers, waiters, and kitchen chefs.
- **Shift & Cash Drawer Reconciliation**: Opening cash float, real-time drawer balance, and end-of-shift Z-reports.
- **Kitchen Display System (KDS)**: Real-time order queue with audio chimes and urgency color-coding.

### 🏢 Cafe Owner & Admin Suite
- **First-Run Onboarding Wizard**: 5-step guided setup for taxes (GST/FSSAI), floor plans, menu items, and staff PINs.
- **5 Branded Tabletop QR Standees**: Export print-ready PNG and multi-page A4 PDF standees.
- **Real-Time Analytics**: Net revenue, real payment mode distributions (Cash vs UPI vs Card), top dishes, and nightly WhatsApp summaries.
- **Table Reservations Engine**: Manage advance dining bookings and table assignments.

### 📱 Customer QR Discovery & Ordering
- **Anti-Fake Order OTP**: Secure phone verification before order dispatch.
- **Live Order Tracker**: Real-time status updates (*Order Received $\rightarrow$ Preparing $\rightarrow$ Ready $\rightarrow$ Served*).
- **Digital WhatsApp Invoices**: Paperless hosted receipts with full tax breakdown.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.3 (App Router)](https://nextjs.org/) + React 19 + TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Local Storage**: [SQLite (better-sqlite3)](https://github.com/WiseLibs/better-sqlite3) with WAL Mode
- **Cloud Database**: [Supabase (PostgreSQL)](https://supabase.com/) with Row-Level Security (RLS) & Realtime
- **Mobile Builds**: [Capacitor 7](https://capacitorjs.com/) (Android APK)
- **Desktop Builds**: [Electron](https://www.electronjs.org/) (Windows NSIS Installer)

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 22+
- npm 10+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/29Sandesh/ChatChaska.git
cd ChatChaska

# Install dependencies
npm install

# Run local development server
npm run dev
```
Open `http://localhost:3000` to view the application.

---

## 🔑 Default Credentials (Development)

| Portal | Role | Identifier / Email | Password / PIN |
|---|---|---|---|
| `/login` | **Cashier** | Select Staff $\rightarrow$ Cashier | `1234` |
| `/login` | **Owner Admin** | `owner@cafe.com` | `password` |
| `/login` | **Super Admin** | `29sandesh.agrawal@gmail.com` | `Sejal_2912` |

---

## 📦 Production Builds

### Web (Vercel)
Connect repository to [Vercel](https://vercel.com) and deploy with standard Next.js presets.

### Android APK
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```
The APK is also automatically built via GitHub Actions (`.github/workflows/build-apk.yml`).

---

## 📄 License
Private & Proprietary © 2026 ChatChaska Technologies.
