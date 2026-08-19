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

