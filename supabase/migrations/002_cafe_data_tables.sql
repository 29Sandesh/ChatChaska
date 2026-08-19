-- ============================================================
-- ChatChaska Platform — Cafe Data Tables (Cloud Sync)
-- Migration 002: Cloud versions of local SQLite tables
-- ============================================================

-- Cloud-synced bills (from each cafe's local POS)
CREATE TABLE IF NOT EXISTS cloud_bills (
  id TEXT NOT NULL,
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  token_number TEXT,
  order_id TEXT,
  restaurant_name TEXT,
  table_number TEXT,
  waiter_name TEXT,
  items_json JSONB,
  subtotal REAL,
  gst_percent REAL DEFAULT 5,
  cgst_amount REAL DEFAULT 0,
  sgst_amount REAL DEFAULT 0,
  gst_amount REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  grand_total REAL,
  payment_mode TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'paid',
  local_created_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id, cafe_id)
);

-- Cloud-synced menu items
CREATE TABLE IF NOT EXISTS cloud_menu_items (
  id TEXT NOT NULL,
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  available BOOLEAN DEFAULT true,
  veg BOOLEAN DEFAULT true,
  popular BOOLEAN DEFAULT false,
  spicy BOOLEAN DEFAULT false,
  image TEXT,
  synced_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id, cafe_id)
);

-- Cloud-synced staff
CREATE TABLE IF NOT EXISTS cloud_staff (
  id TEXT NOT NULL,
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  pin_hash TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  synced_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (id, cafe_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cloud_bills_cafe ON cloud_bills(cafe_id);
CREATE INDEX IF NOT EXISTS idx_cloud_bills_date ON cloud_bills(local_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_bills_status ON cloud_bills(cafe_id, status);
CREATE INDEX IF NOT EXISTS idx_cloud_menu_cafe ON cloud_menu_items(cafe_id);
CREATE INDEX IF NOT EXISTS idx_cloud_staff_cafe ON cloud_staff(cafe_id);
