/**
 * ChatChaska Subscription & Usage-Based Pricing Engine
 *
 * Business Model:
 * - Free Forever: Small cafes (< 100 bills/day) stay 100% free with NO countdown and NO lockouts.
 * - Growth Detection: High-volume cafes exceeding 100 bills/day on 3+ days are prompted to upgrade.
 * - Paid Tiers (Basic, Pro, Enterprise) for scaling operations.
 * - Suspension: Instant kill-switch if manually disabled by Super Admin.
 */

export type PlanTier = 'free' | 'trial' | 'basic' | 'pro' | 'enterprise';
export type PaymentStatus = 'free' | 'trial' | 'active' | 'overdue' | 'suspended' | 'expired';

export interface CafeSubscription {
  cafeId: string;
  plan: PlanTier;
  subscriptionAmount: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  lastPaymentAt: string | null;
  nextPaymentDue: string | null;
  paymentStatus: PaymentStatus;
  isActive: boolean;
  suspendedReason: string | null;
  // Legacy fields preserved for backward compatibility
  trialStartedAt?: string | null;
  trialDays?: number;
  trialExpiresAt?: string | null;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason: string;
  daysLeft: number;
  status: PaymentStatus;
  showWarning: boolean;
  warningMessage: string | null;
}

const GRACE_PERIOD_DAYS = 3;

/**
 * Check if a cafe has access to the POS system.
 * Free tier cafes are ALWAYS allowed access (no trial countdown, no time-based expiration).
 */
export function checkCafeAccess(subscription: CafeSubscription): AccessCheckResult {
  const now = new Date();

  // ── Manually Suspended by Super Admin ────────────────────
  if (!subscription.isActive || subscription.paymentStatus === 'suspended') {
    return {
      allowed: false,
      reason: subscription.suspendedReason || 'Your account has been suspended by Platform Administration.',
      daysLeft: 0,
      status: 'suspended',
      showWarning: false,
      warningMessage: null,
    };
  }

  // ── Free Tier / Legacy Trial (Free Forever for small businesses) ──
  if (subscription.plan === 'free' || subscription.plan === 'trial') {
    return {
      allowed: true,
      reason: 'Free tier active (Free for cafes < 100 bills/day)',
      daysLeft: 999,
      status: 'free',
      showWarning: false,
      warningMessage: null,
    };
  }

  // ── Paid Plans (Basic / Pro / Enterprise) ────────────────
  if (!subscription.nextPaymentDue) {
    return {
      allowed: true,
      reason: `${subscription.plan} plan active`,
      daysLeft: 999,
      status: 'active',
      showWarning: false,
      warningMessage: null,
    };
  }

  const paymentDue = new Date(subscription.nextPaymentDue);
  const paymentDiffMs = paymentDue.getTime() - now.getTime();
  const paymentDaysLeft = Math.ceil(paymentDiffMs / (1000 * 60 * 60 * 24));

  // Payment not yet due
  if (paymentDaysLeft > 7) {
    return {
      allowed: true,
      reason: `${subscription.plan} plan active`,
      daysLeft: paymentDaysLeft,
      status: 'active',
      showWarning: false,
      warningMessage: null,
    };
  }

  // Payment due soon (≤ 7 days)
  if (paymentDaysLeft > 0) {
    return {
      allowed: true,
      reason: `${subscription.plan} plan active`,
      daysLeft: paymentDaysLeft,
      status: 'active',
      showWarning: true,
      warningMessage: `Your subscription payment of ₹${subscription.subscriptionAmount.toLocaleString('en-IN')} is due in ${paymentDaysLeft} day${paymentDaysLeft === 1 ? '' : 's'}.`,
    };
  }

  // Payment overdue — grace period (3 days)
  const overdueGraceDays = GRACE_PERIOD_DAYS + paymentDaysLeft;
  if (overdueGraceDays > 0) {
    return {
      allowed: true,
      reason: 'Payment overdue — grace period',
      daysLeft: 0,
      status: 'overdue',
      showWarning: true,
      warningMessage: `Your subscription payment is overdue. ${overdueGraceDays} grace day${overdueGraceDays === 1 ? '' : 's'} remaining before service suspension.`,
    };
  }

  // Payment overdue beyond grace
  return {
    allowed: false,
    reason: 'Your subscription payment is overdue and your service has been suspended. Please make the payment and contact ChatChaska support.',
    daysLeft: 0,
    status: 'overdue',
    showWarning: false,
    warningMessage: null,
  };
}

/**
 * Helper to calculate arbitrary future expiry date.
 */
export function calculateTrialExpiry(startDate: Date, days: number): Date {
  const expiry = new Date(startDate);
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

/**
 * Plan pricing tiers
 */
export const PLAN_PRICING: Record<PlanTier, { monthly: number; quarterly: number; yearly: number; label: string }> = {
  free: { monthly: 0, quarterly: 0, yearly: 0, label: 'Free Forever (< 100 bills/day)' },
  trial: { monthly: 0, quarterly: 0, yearly: 0, label: 'Free Forever (< 100 bills/day)' },
  basic: { monthly: 999, quarterly: 2697, yearly: 9588, label: 'Starter (₹999/mo)' },
  pro: { monthly: 2499, quarterly: 6747, yearly: 23988, label: 'Growth Pro (₹2,499/mo)' },
  enterprise: { monthly: 4999, quarterly: 13497, yearly: 47988, label: 'Enterprise (₹4,999/mo)' },
};

/**
 * Feature limits per plan tier
 */
export const PLAN_LIMITS: Record<PlanTier, { maxDevices: number; maxStaff: number; maxMenuItems: number; dailyBillThreshold: number }> = {
  free: { maxDevices: 2, maxStaff: 5, maxMenuItems: 200, dailyBillThreshold: 100 },
  trial: { maxDevices: 2, maxStaff: 5, maxMenuItems: 200, dailyBillThreshold: 100 },
  basic: { maxDevices: 2, maxStaff: 5, maxMenuItems: 200, dailyBillThreshold: 500 },
  pro: { maxDevices: 5, maxStaff: 15, maxMenuItems: 500, dailyBillThreshold: 1500 },
  enterprise: { maxDevices: 99, maxStaff: 99, maxMenuItems: 9999, dailyBillThreshold: 999999 },
};
