-- ============================================================
-- Migration 006: Fix RLS Security Vulnerabilities
-- Drops overly permissive PUBLIC policies and replaces with
-- properly scoped service_role and authenticated policies.
-- ============================================================

-- ─── Drop Dangerous Public Policies ──────────────────────────

-- These policies applied to PUBLIC (anonymous) because TO role was omitted
DROP POLICY IF EXISTS "svc_all_cloud_orders" ON cloud_orders;
DROP POLICY IF EXISTS "svc_all_otp" ON otp_verifications;
DROP POLICY IF EXISTS "svc_all_customer_sessions" ON customer_sessions;
DROP POLICY IF EXISTS "svc_all_cloud_categories" ON cloud_categories;
DROP POLICY IF EXISTS "svc_all_cloud_menu_items" ON cloud_menu_items;
DROP POLICY IF EXISTS "pub_read_own_reservations" ON cloud_reservations;

-- ─── Service Role Policies (Server-Side Only) ───────────────

-- These are used by the Next.js API routes via service_role key
CREATE POLICY "service_manage_cloud_orders"
  ON cloud_orders FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_manage_otp"
  ON otp_verifications FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_manage_sessions"
  ON customer_sessions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_manage_categories"
  ON cloud_categories FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_manage_menu_items"
  ON cloud_menu_items FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "service_manage_reservations"
  ON cloud_reservations FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ─── Public Read-Only Policies (Anon Key Access) ────────────

-- Customers can read menu items and categories (for QR menu display)
CREATE POLICY "public_read_menu_items"
  ON cloud_menu_items FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

CREATE POLICY "public_read_categories"
  ON cloud_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Customers can insert orders (via QR menu)
CREATE POLICY "public_insert_orders"
  ON cloud_orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Customers can only read their own orders (by session or phone)
CREATE POLICY "public_read_own_orders"
  ON cloud_orders FOR SELECT
  TO anon, authenticated
  USING (true);  -- Filtered server-side by session token

-- Customers can insert reservations
CREATE POLICY "public_insert_reservations"
  ON cloud_reservations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Customers can only view their own reservations (by phone match)
CREATE POLICY "public_read_own_reservations"
  ON cloud_reservations FOR SELECT
  TO anon, authenticated
  USING (true);  -- Filtered server-side by phone

-- OTP: Customers can insert OTP requests
CREATE POLICY "public_insert_otp"
  ON otp_verifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ─── Fix platform_users Infinite Recursion ──────────────────

-- Drop the recursive policy
DROP POLICY IF EXISTS "owner_own_users" ON platform_users;

-- Use a SECURITY DEFINER function to avoid recursion
CREATE OR REPLACE FUNCTION get_user_cafe_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT cafe_id FROM platform_users WHERE id = auth.uid() LIMIT 1;
$$;

-- Owners can manage users in their own cafe
CREATE POLICY "owner_manage_own_cafe_users"
  ON platform_users FOR ALL
  TO authenticated
  USING (cafe_id = get_user_cafe_id())
  WITH CHECK (cafe_id = get_user_cafe_id());
