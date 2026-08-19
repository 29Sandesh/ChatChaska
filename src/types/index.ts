// MenuCraft Data Types Specification

export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface OperationHourDay {
  open: string | null;
  close: string | null;
  is_closed: boolean;
}

export interface OperationHours {
  monday: OperationHourDay;
  tuesday: OperationHourDay;
  wednesday: OperationHourDay;
  thursday: OperationHourDay;
  friday: OperationHourDay;
  saturday: OperationHourDay;
  sunday: OperationHourDay;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  operation_hours: OperationHours;
  currency: string;
  language: string;
  is_published: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  item_count?: number;
}

export type DietType = 'veg' | 'non-veg' | 'vegan' | 'egg';

export interface ItemVariant {
  id: string;
  item_id: string;
  group_name: string;
  option_name: string;
  extra_price: number;
  is_required: boolean;
  sort_order: number;
}

export interface ItemAddon {
  id: string;
  item_id: string;
  name: string;
  price: number;
  is_available: boolean;
  sort_order: number;
}

export interface ItemTag {
  id: string;
  item_id: string;
  tag_name: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  image_url?: string;
  is_available: boolean;
  is_popular: boolean;
  is_new: boolean;
  is_recommended: boolean;
  diet_type?: DietType;
  spicy_level?: number;
  prep_time_minutes?: number;
  calories?: number;
  ingredients?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  variants?: ItemVariant[];
  addons?: ItemAddon[];
  tags?: string[];
}

export interface ThemeSettings {
  id: string;
  restaurant_id: string;
  base_theme: 'light' | 'dark';
  primary_color: string;
  accent_color: string;
  heading_font: string;
  body_font: string;
  border_radius: number;
  updated_at: string;
}

export interface QRCodeConfig {
  id: string;
  restaurant_id: string;
  label: string;
  url: string;
  color: string;
  include_logo: boolean;
  frame_style: string;
  created_at: string;
}

export interface ScanLog {
  id: string;
  restaurant_id: string;
  qr_code_id?: string;
  device_os: 'iOS' | 'Android' | 'Unknown';
  city?: string;
  table_number?: string;
  duration_seconds: number;
  status: 'active' | 'completed' | 'bounced';
  scanned_at: string;
}

export interface TeamMember {
  id: string;
  user_id?: string;
  restaurant_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: 'owner' | 'manager' | 'staff';
  status: 'active' | 'pending' | 'removed';
  invited_at: string;
  accepted_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'qr_scan' | 'order' | 'subscription' | 'team' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_daily_summary: boolean;
  email_critical_alerts: boolean;
  push_new_orders: boolean;
  push_qr_scans: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedVariants: Record<string, string>;
  selectedAddons: ItemAddon[];
  totalPrice: number;
}

export type PaymentMode = 'cash' | 'upi' | 'card' | 'split';
export type BillStatus = 'open' | 'paid' | 'cancelled' | 'held';

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  veg: boolean;
}

export interface Bill {
  id: string;
  tokenNumber?: string;
  orderId?: string;
  restaurantId: string;
  restaurantName: string;
  gstin?: string;
  fssai?: string;
  address?: string;
  customerName?: string;
  customerPhone?: string;
  tableNumber: string;
  waiterName: string;
  items: BillItem[];
  subtotal: number;
  gstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  gstAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  splitDetails?: { cash: number; upi: number; card: number };
  status: BillStatus;
  createdAt: string;
  closedAt?: string;
}

// ============================================================
// ChatChaska Customer Platform Types
// ============================================================

/** Public-facing cafe profile for the discovery platform */
export interface CafePublicProfile {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string;
  banner_url: string;
  owner_name: string;
  owner_email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  cuisine_tags: string[];
  avg_cost_for_two: number;
  is_pure_veg: boolean;
  is_listed: boolean;
  whatsapp: string;
  instagram: string;
  google_maps_url: string;
  opening_time: string;
  closing_time: string;
  closed_days: string[];
  avg_rating: number;
  total_reviews: number;
  total_orders: number;
  featured: boolean;
  phone: string;
  gstin?: string;
  fssai?: string;
  is_open?: boolean;
  distance_km?: number;
  created_at: string;
}

/** Cloud-synced menu category for a specific cafe */
export interface CloudCategory {
  id: string;
  cafe_id: string;
  name: string;
  icon: string;
  sort_order: number;
  visible: boolean;
  item_count?: number;
  created_at: string;
}

/** Cloud-synced menu item with full discovery metadata */
export interface CloudMenuItem {
  id: string;
  cafe_id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  strike_price: number | null;
  image_url: string;
  is_available: boolean;
  is_popular: boolean;
  is_new: boolean;
  is_recommended: boolean;
  diet_type: 'veg' | 'non-veg' | 'vegan' | 'egg';
  spicy_level: number;
  prep_time_minutes: number;
  variants: { name: string; price: number }[];
  addons: { name: string; price: number }[];
  tags: string[];
  sort_order: number;
}

/** Cafe photo for the gallery */
export interface CafePhoto {
  id: string;
  cafe_id: string;
  url: string;
  caption: string;
  is_cover: boolean;
  sort_order: number;
  uploaded_at: string;
}

/** Customer review for a cafe */
export interface CloudReview {
  id: string;
  cafe_id: string;
  customer_phone: string;
  customer_name: string;
  rating: number;
  comment: string;
  food_rating: number | null;
  service_rating: number | null;
  ambience_rating: number | null;
  photos: string[];
  is_verified: boolean;
  helpful_count: number;
  owner_reply: string | null;
  owner_replied_at: string | null;
  created_at: string;
}

/** Customer-placed order via QR scan or app */
export interface CloudOrder {
  id: string;
  cafe_id: string;
  order_number: string;
  table_number: string;
  customer_phone: string;
  customer_name: string;
  session_token: string | null;
  items: CloudOrderItem[];
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  status: CloudOrderStatus;
  rejection_reason: string | null;
  special_instructions: string;
  source: 'qr' | 'app' | 'walk-in';
  estimated_prep_minutes: number;
  confirmed_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  served_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export type CloudOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'rejected';

/** Individual item within a cloud order */
export interface CloudOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string;
  addons?: string[];
}

/** QR code record for a specific table in a cafe */
export interface QRCodeRecord {
  id: string;
  cafe_id: string;
  table_label: string;
  table_number: string;
  template_id: string;
  is_active: boolean;
  scan_count: number;
  last_scanned_at: string | null;
  created_at: string;
}

/** OTP verification request */
export interface OTPVerification {
  id: string;
  phone: string;
  otp_code: string;
  cafe_id: string;
  table_number: string;
  purpose: 'order' | 'review' | 'signup';
  attempts: number;
  is_verified: boolean;
  session_token: string | null;
  expires_at: string;
  created_at: string;
}

/** Lightweight customer session identity */
export interface CustomerSession {
  id: string;
  phone: string;
  name: string;
  session_token: string;
  is_active: boolean;
  last_active_at: string;
  created_at: string;
}

/** QR code template configuration */
export interface QRTemplate {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  bgStyle: 'light' | 'dark' | 'gradient';
}

export interface ElectronAPI {
  isDesktop?: boolean;
  playOrderAlert?: (soundName: string) => void;
  printThermalKOT?: (kotData: any) => Promise<{ success: boolean; error?: string }>;
  printThermalBill?: (billData: any) => Promise<{ success: boolean; error?: string }>;
  getPrinters?: () => Promise<any[]>;
  minimizeToTray?: () => void;
  toggleAutoStart?: (enable: boolean) => Promise<{ autoStart: boolean }>;
  getSystemStatus?: () => Promise<any>;
  getNetworkStatus?: () => Promise<{ online: boolean }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

