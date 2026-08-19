-- ============================================================
-- ChatChaska Platform — Table Reservations & In-Table UPI Payments
-- Migration 005: Advanced Dining Features
-- ============================================================

-- 1. CLOUD TABLE RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS cloud_reservations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  guest_count INTEGER NOT NULL DEFAULT 2,
  reservation_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  special_request TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'seated', 'cancelled', 'declined')),
  table_assigned TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cloud_reservations_cafe ON cloud_reservations(cafe_id);
CREATE INDEX IF NOT EXISTS idx_cloud_reservations_date ON cloud_reservations(cafe_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_cloud_reservations_phone ON cloud_reservations(customer_phone);

-- 2. ENABLE RLS
ALTER TABLE cloud_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pub_insert_reservations" ON cloud_reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "pub_read_own_reservations" ON cloud_reservations FOR SELECT USING (true);
CREATE POLICY "svc_all_reservations" ON cloud_reservations FOR ALL USING (true) WITH CHECK (true);

-- 3. ENABLE REALTIME FOR RESERVATIONS
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE cloud_reservations;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'cloud_reservations already in realtime publication or publication does not exist';
END $$;
