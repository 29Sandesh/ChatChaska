-- ============================================================
-- ChatChaska Platform — Core Tables
-- Migration 001: Platform infrastructure tables
-- ============================================================

-- Registered cafes on the platform
CREATE TABLE IF NOT EXISTS cafes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT,
  address TEXT,
  city TEXT,
  gstin TEXT,
  fssai TEXT,
  logo_url TEXT,
  
  -- Subscription & Trial
  plan TEXT NOT NULL DEFAULT 'trial',
  trial_started_at TIMESTAMPTZ DEFAULT now(),
  trial_days INTEGER DEFAULT 14,
  trial_expires_at TIMESTAMPTZ,
  subscription_amount REAL DEFAULT 0,
  billing_cycle TEXT DEFAULT 'monthly',
  last_payment_at TIMESTAMPTZ,
  next_payment_due TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'trial',
  
  -- Usage tracking
  max_devices INTEGER DEFAULT 2,
  max_staff INTEGER DEFAULT 5,
  
  -- Platform control
  is_active BOOLEAN DEFAULT true,
  suspended_reason TEXT,
  suspended_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Platform users (all roles)
CREATE TABLE IF NOT EXISTS platform_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE,
  
  -- Auth credentials
  email TEXT UNIQUE,
  password_hash TEXT,
  pin_hash TEXT,
  
  -- Profile
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  
  -- Role: super_admin | cafe_owner | cashier | waiter | kitchen
  role TEXT NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Billing/payment history
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  description TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'paid',
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES platform_users(id)
);

-- Device sessions (track active POS devices)
CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID REFERENCES cafes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  device_fingerprint TEXT,
  device_name TEXT,
  ip_address TEXT,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Security audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id UUID,
  user_id UUID,
  action TEXT NOT NULL,
  details_json JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cafes_slug ON cafes(slug);
CREATE INDEX IF NOT EXISTS idx_cafes_payment_status ON cafes(payment_status);
CREATE INDEX IF NOT EXISTS idx_platform_users_cafe ON platform_users(cafe_id);
CREATE INDEX IF NOT EXISTS idx_platform_users_email ON platform_users(email);
CREATE INDEX IF NOT EXISTS idx_platform_users_role ON platform_users(role);
CREATE INDEX IF NOT EXISTS idx_billing_history_cafe ON billing_history(cafe_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_cafe ON audit_log(cafe_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
