-- ============================================================
-- ChatChaska Platform — Customer Discovery & QR Ordering
-- Migration 004: Extends platform for customer-facing features
-- ============================================================

-- 1. EXTEND CAFES TABLE for discovery profile
-- (slug, address, city, logo_url already exist from migration 001)
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS banner_url TEXT DEFAULT '';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS cuisine_tags TEXT[] DEFAULT '{}';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS avg_cost_for_two INTEGER DEFAULT 0;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS is_pure_veg BOOLEAN DEFAULT false;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS is_listed BOOLEAN DEFAULT true;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT '';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS instagram TEXT DEFAULT '';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS google_maps_url TEXT DEFAULT '';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS opening_time TIME DEFAULT '09:00';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS closing_time TIME DEFAULT '23:00';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS closed_days TEXT[] DEFAULT '{}';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(2,1) DEFAULT 0.0;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;


-- 2. CLOUD MENU CATEGORIES (per-cafe)
CREATE TABLE IF NOT EXISTS cloud_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🍽️',
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cafe_id, name)
);
CREATE INDEX IF NOT EXISTS idx_cloud_categories_cafe ON cloud_categories(cafe_id);


-- 3. EXTEND cloud_menu_items with new columns for discovery
-- (table already exists from migration 002 with basic columns)
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS strike_price REAL;
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT false;
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS diet_type TEXT DEFAULT 'veg';
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS spicy_level INTEGER DEFAULT 0;
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER DEFAULT 15;
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS variants_json JSONB DEFAULT '[]';
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS addons_json JSONB DEFAULT '[]';
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE cloud_menu_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();


-- 4. CAFE PHOTOS (gallery for discovery)
CREATE TABLE IF NOT EXISTS cafe_photos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  is_cover BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cafe_photos_cafe ON cafe_photos(cafe_id);


-- 5. CUSTOMER REVIEWS (per-cafe, verified phone)
CREATE TABLE IF NOT EXISTS cloud_reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT DEFAULT 'Guest',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  food_rating INTEGER CHECK (food_rating BETWEEN 1 AND 5),
  service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
  ambience_rating INTEGER CHECK (ambience_rating BETWEEN 1 AND 5),
  photos TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  owner_reply TEXT,
  owner_replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cloud_reviews_cafe ON cloud_reviews(cafe_id);
CREATE INDEX IF NOT EXISTS idx_cloud_reviews_rating ON cloud_reviews(cafe_id, rating);

-- Auto-update cafe avg_rating and total_reviews on review changes
CREATE OR REPLACE FUNCTION update_cafe_ratings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cafes SET
    avg_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM cloud_reviews WHERE cafe_id = COALESCE(NEW.cafe_id, OLD.cafe_id)), 0),
    total_reviews = (SELECT COUNT(*) FROM cloud_reviews WHERE cafe_id = COALESCE(NEW.cafe_id, OLD.cafe_id))
  WHERE id = COALESCE(NEW.cafe_id, OLD.cafe_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ratings ON cloud_reviews;
CREATE TRIGGER trigger_update_ratings
  AFTER INSERT OR UPDATE OR DELETE ON cloud_reviews
  FOR EACH ROW EXECUTE FUNCTION update_cafe_ratings();


-- 6. QR CODES (per-table configurations)
CREATE TABLE IF NOT EXISTS qr_codes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  table_label TEXT NOT NULL,
  table_number TEXT NOT NULL,
  template_id TEXT DEFAULT 'classic',
  is_active BOOLEAN DEFAULT true,
  scan_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cafe_id, table_number)
);
CREATE INDEX IF NOT EXISTS idx_qr_codes_cafe ON qr_codes(cafe_id);


-- 7. QR SCAN LOGS (analytics)
CREATE TABLE IF NOT EXISTS qr_scan_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  qr_code_id TEXT REFERENCES qr_codes(id) ON DELETE SET NULL,
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  table_number TEXT,
  device_info TEXT DEFAULT '',
  ip_address TEXT DEFAULT '',
  scanned_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_cafe ON qr_scan_logs(cafe_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_time ON qr_scan_logs(scanned_at);


-- 8. OTP VERIFICATION TABLE
CREATE TABLE IF NOT EXISTS otp_verifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  cafe_id UUID REFERENCES cafes(id),
  table_number TEXT,
  purpose TEXT DEFAULT 'order',
  attempts INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  session_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone, is_verified);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);


-- 9. CLOUD ORDERS (customer-placed orders via QR/app)
CREATE TABLE IF NOT EXISTS cloud_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  table_number TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT DEFAULT 'Guest',
  session_token TEXT,
  items_json JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  gst_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled', 'rejected')),
  rejection_reason TEXT,
  special_instructions TEXT DEFAULT '',
  source TEXT DEFAULT 'qr' CHECK (source IN ('qr', 'app', 'walk-in')),
  estimated_prep_minutes INTEGER DEFAULT 15,
  confirmed_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cloud_orders_cafe ON cloud_orders(cafe_id);
CREATE INDEX IF NOT EXISTS idx_cloud_orders_status ON cloud_orders(cafe_id, status);
CREATE INDEX IF NOT EXISTS idx_cloud_orders_table ON cloud_orders(cafe_id, table_number, status);
CREATE INDEX IF NOT EXISTS idx_cloud_orders_phone ON cloud_orders(customer_phone);

-- Auto-increment cafe total_orders when order is confirmed
CREATE OR REPLACE FUNCTION increment_cafe_orders()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE cafes SET total_orders = total_orders + 1 WHERE id = NEW.cafe_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_orders ON cloud_orders;
CREATE TRIGGER trigger_increment_orders
  AFTER INSERT OR UPDATE ON cloud_orders
  FOR EACH ROW EXECUTE FUNCTION increment_cafe_orders();


-- 10. CUSTOMER SESSIONS (lightweight identity)
CREATE TABLE IF NOT EXISTS customer_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  phone TEXT NOT NULL,
  name TEXT DEFAULT 'Guest',
  session_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_phone ON customer_sessions(phone);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_token ON customer_sessions(session_token);


-- 11. ROW LEVEL SECURITY
ALTER TABLE cloud_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;

-- Public read for discovery
CREATE POLICY "pub_read_categories" ON cloud_categories FOR SELECT USING (visible = true);
CREATE POLICY "pub_read_cafe_photos" ON cafe_photos FOR SELECT USING (true);
CREATE POLICY "pub_read_reviews" ON cloud_reviews FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "svc_all_cloud_categories" ON cloud_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "svc_all_cafe_photos" ON cafe_photos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "svc_all_cloud_reviews" ON cloud_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "svc_all_qr_codes" ON qr_codes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "svc_all_qr_scan_logs" ON qr_scan_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "svc_all_otp" ON otp_verifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "svc_all_cloud_orders" ON cloud_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "svc_all_customer_sessions" ON customer_sessions FOR ALL USING (true) WITH CHECK (true);


-- 12. SUPABASE REALTIME — enable for order tracking
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE cloud_orders;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'cloud_orders already in realtime publication or publication does not exist';
END $$;
