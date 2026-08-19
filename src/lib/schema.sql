-- MenuCraft SQLite Database Schema

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  table_number TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  table_number TEXT NOT NULL,
  waiter_name TEXT NOT NULL,
  items_json TEXT NOT NULL,
  subtotal REAL NOT NULL,
  gst_percent REAL NOT NULL DEFAULT 5,
  cgst_amount REAL NOT NULL DEFAULT 0,
  sgst_amount REAL NOT NULL DEFAULT 0,
  gst_amount REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  grand_total REAL NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'cash',
  split_details_json TEXT,
  status TEXT NOT NULL DEFAULT 'paid',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT,
  available INTEGER DEFAULT 1,
  popular INTEGER DEFAULT 0,
  veg INTEGER DEFAULT 1,
  spicy INTEGER DEFAULT 0,
  image TEXT,
  shortcode TEXT
);

CREATE TABLE IF NOT EXISTS offline_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  synced INTEGER DEFAULT 0
);
