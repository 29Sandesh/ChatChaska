-- =============================================
-- MenuCraft Database Schema
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RESTAURANTS
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  whatsapp TEXT,
  instagram TEXT,
  facebook TEXT,
  operation_hours JSONB DEFAULT '{
    "monday": {"open": "11:00", "close": "22:00", "is_closed": false},
    "tuesday": {"open": "11:00", "close": "22:00", "is_closed": false},
    "wednesday": {"open": "11:00", "close": "22:00", "is_closed": false},
    "thursday": {"open": "11:00", "close": "22:00", "is_closed": false},
    "friday": {"open": "11:00", "close": "23:30", "is_closed": false},
    "saturday": {"open": "10:00", "close": "23:30", "is_closed": false},
    "sunday": {"open": null, "close": null, "is_closed": true}
  }'::jsonb,
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'en',
  is_published BOOLEAN DEFAULT FALSE,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_price DECIMAL(10,2),
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_recommended BOOLEAN DEFAULT FALSE,
  diet_type TEXT CHECK (diet_type IN ('veg', 'non-veg', 'vegan', 'egg')),
  spicy_level INTEGER DEFAULT 0 CHECK (spicy_level >= 0 AND spicy_level <= 5),
  prep_time_minutes INTEGER,
  calories INTEGER,
  ingredients TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ITEM VARIANTS
CREATE TABLE IF NOT EXISTS public.item_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  option_name TEXT NOT NULL,
  extra_price DECIMAL(10,2) DEFAULT 0,
  is_required BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

-- ITEM ADDONS
CREATE TABLE IF NOT EXISTS public.item_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- ITEM TAGS
CREATE TABLE IF NOT EXISTS public.item_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL
);

-- THEME SETTINGS
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID UNIQUE NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  base_theme TEXT DEFAULT 'light' CHECK (base_theme IN ('light', 'dark')),
  primary_color TEXT DEFAULT '#006c49',
  accent_color TEXT DEFAULT '#fea619',
  heading_font TEXT DEFAULT 'Inter',
  body_font TEXT DEFAULT 'Inter',
  border_radius INTEGER DEFAULT 16,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- QR CODES
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  label TEXT,
  url TEXT NOT NULL,
  color TEXT DEFAULT '#006c49',
  include_logo BOOLEAN DEFAULT TRUE,
  frame_style TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SCAN LOGS
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  qr_code_id UUID REFERENCES public.qr_codes(id) ON DELETE SET NULL,
  device_os TEXT,
  city TEXT,
  table_number TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'bounced')),
  scanned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'removed')),
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'starter' CHECK (plan_name IN ('starter', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- NOTIFICATION SETTINGS
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_daily_summary BOOLEAN DEFAULT TRUE,
  email_critical_alerts BOOLEAN DEFAULT TRUE,
  push_new_orders BOOLEAN DEFAULT TRUE,
  push_qr_scans BOOLEAN DEFAULT FALSE
);
