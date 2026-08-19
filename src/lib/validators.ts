import { z } from 'zod';

// ─── Authentication ───────────────────────────────────────────────

/** Login request for staff (PIN) or owner/admin (email+password) */
export const LoginSchema = z.discriminatedUnion('loginType', [
  z.object({
    loginType: z.literal('pin'),
    pin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
    staffRole: z.enum(['cashier', 'waiter', 'kitchen', 'manager']),
  }),
  z.object({
    loginType: z.literal('email'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
]);

/** Signup / cafe registration request */
export const SignupSchema = z.object({
  cafeName: z.string().min(2, 'Cafe name must be at least 2 characters').max(100),
  ownerName: z.string().min(2, 'Owner name required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─── Staff ────────────────────────────────────────────────────────

/** Create or update a staff member */
export const StaffSchema = z.object({
  name: z.string().min(2, 'Staff name required').max(100),
  role: z.enum(['cashier', 'waiter', 'kitchen', 'manager']),
  pin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be 4 digits'),
  phone: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
});

// ─── Menu Items ───────────────────────────────────────────────────

/** Create or update a menu item */
export const MenuItemSchema = z.object({
  name: z.string().min(1, 'Item name required').max(200),
  category: z.string().min(1, 'Category required'),
  price: z.number().positive('Price must be positive'),
  strikePrice: z.number().positive().optional(),
  description: z.string().max(500).optional(),
  veg: z.boolean().default(true),
  available: z.boolean().default(true),
  popular: z.boolean().default(false),
  spicy: z.boolean().default(false),
  image: z.string().url().optional(),
});

// ─── Orders ───────────────────────────────────────────────────────

/** Item within an order */
const OrderItemSchema = z.object({
  id: z.string().min(1, 'Item ID required'),
  name: z.string().min(1),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  // price is intentionally NOT accepted from client — looked up server-side
});

/** Public order creation (from QR menu) */
export const PublicOrderSchema = z.object({
  cafe_id: z.string().uuid('Invalid cafe ID'),
  table_number: z.string().min(1, 'Table number required'),
  items: z.array(OrderItemSchema).min(1, 'Order must have at least 1 item'),
  notes: z.string().max(500).optional(),
  customer_session: z.string().optional(),
});

// ─── Bills ────────────────────────────────────────────────────────

/** Bill creation from POS terminal */
export const BillSchema = z.object({
  orderId: z.string().optional(),
  tableNumber: z.string().min(1, 'Table required'),
  waiterName: z.string().min(1, 'Waiter name required'),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    category: z.string().optional(),
  })).min(1, 'Bill must have at least 1 item'),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  paymentMode: z.enum(['cash', 'upi', 'card', 'split']),
  customerPhone: z.string().regex(/^\d{10}$/).optional(),
  customerName: z.string().optional(),
});

// ─── Reservations ─────────────────────────────────────────────────

/** Table reservation request from customer */
export const ReservationSchema = z.object({
  cafe_slug: z.string().min(1),
  customer_name: z.string().min(2, 'Name required').max(100),
  customer_phone: z.string().regex(/^\d{10}$/, 'Valid 10-digit phone required'),
  guest_count: z.number().int().min(1).max(20),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  time_slot: z.string().min(1),
  special_request: z.string().max(500).optional(),
});

// ─── Settings ─────────────────────────────────────────────────────

/** GST and business settings update */
export const GSTSettingsSchema = z.object({
  gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[A-Z]{1}\d{1}$/, 'Invalid GSTIN format').optional().or(z.literal('')),
  fssai: z.string().optional(),
  upiId: z.string().optional(),
  cgstRate: z.number().min(0).max(50),
  sgstRate: z.number().min(0).max(50),
  ownerPhone: z.string().optional(),
  ownerEmail: z.string().email().optional(),
});

// ─── Reviews ──────────────────────────────────────────────────────

/** Customer review submission */
export const ReviewSchema = z.object({
  cafe_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Review must be at least 5 characters').max(1000),
  author_name: z.string().min(1).max(100),
});

// ─── OTP ──────────────────────────────────────────────────────────

/** OTP send request */
export const OTPSendSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Valid 10-digit phone required'),
  purpose: z.enum(['customer_verify', 'owner_login', 'admin_login']).default('customer_verify'),
});

/** OTP verify request */
export const OTPVerifySchema = z.object({
  phone: z.string().regex(/^\d{10}$/),
  otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
});
