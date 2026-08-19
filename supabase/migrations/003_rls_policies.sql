-- ============================================================
-- ChatChaska Platform — Row Level Security Policies
-- Migration 003: Data isolation between cafes
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_staff ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SUPER ADMIN: Full access to everything
-- ============================================================

CREATE POLICY "super_admin_cafes" ON cafes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE platform_users.id = auth.uid() 
      AND platform_users.role = 'super_admin'
    )
  );

CREATE POLICY "super_admin_users" ON platform_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu 
      WHERE pu.id = auth.uid() 
      AND pu.role = 'super_admin'
    )
  );

CREATE POLICY "super_admin_billing" ON billing_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE platform_users.id = auth.uid() 
      AND platform_users.role = 'super_admin'
    )
  );

CREATE POLICY "super_admin_devices" ON device_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE platform_users.id = auth.uid() 
      AND platform_users.role = 'super_admin'
    )
  );

CREATE POLICY "super_admin_audit" ON audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE platform_users.id = auth.uid() 
      AND platform_users.role = 'super_admin'
    )
  );

CREATE POLICY "super_admin_bills" ON cloud_bills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE platform_users.id = auth.uid() 
      AND platform_users.role = 'super_admin'
    )
  );

CREATE POLICY "super_admin_menu" ON cloud_menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE platform_users.id = auth.uid() 
      AND platform_users.role = 'super_admin'
    )
  );

CREATE POLICY "super_admin_staff" ON cloud_staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE platform_users.id = auth.uid() 
      AND platform_users.role = 'super_admin'
    )
  );

-- ============================================================
-- CAFE OWNER: Own cafe only
-- ============================================================

CREATE POLICY "owner_own_cafe" ON cafes
  FOR SELECT USING (
    id IN (
      SELECT cafe_id FROM platform_users 
      WHERE platform_users.id = auth.uid()
      AND platform_users.role = 'cafe_owner'
    )
  );

CREATE POLICY "owner_own_users" ON platform_users
  FOR ALL USING (
    cafe_id IN (
      SELECT cafe_id FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.role = 'cafe_owner'
    )
  );

CREATE POLICY "owner_own_bills" ON cloud_bills
  FOR ALL USING (
    cafe_id IN (
      SELECT cafe_id FROM platform_users 
      WHERE platform_users.id = auth.uid()
    )
  );

CREATE POLICY "owner_own_menu" ON cloud_menu_items
  FOR ALL USING (
    cafe_id IN (
      SELECT cafe_id FROM platform_users 
      WHERE platform_users.id = auth.uid()
    )
  );

CREATE POLICY "owner_own_staff" ON cloud_staff
  FOR ALL USING (
    cafe_id IN (
      SELECT cafe_id FROM platform_users 
      WHERE platform_users.id = auth.uid()
      AND platform_users.role = 'cafe_owner'
    )
  );

-- ============================================================
-- STAFF: Read-only access to their cafe's data
-- ============================================================

CREATE POLICY "staff_own_cafe_bills" ON cloud_bills
  FOR SELECT USING (
    cafe_id IN (
      SELECT cafe_id FROM platform_users 
      WHERE platform_users.id = auth.uid()
    )
  );

CREATE POLICY "staff_own_cafe_menu" ON cloud_menu_items
  FOR SELECT USING (
    cafe_id IN (
      SELECT cafe_id FROM platform_users 
      WHERE platform_users.id = auth.uid()
    )
  );
