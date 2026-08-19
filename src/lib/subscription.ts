/**
 * ChatChaska Subscription & Trial Engine
 *
 * Manages cafe subscription lifecycle:
 * - Free trial with configurable duration
 * - Plan tiers (trial → basic → pro → enterprise)
 * - Grace period after trial/payment expiry
 * - Kill switch for suspended cafes
 */

export type PlanTier = 'trial' | 'basic' | 'pro' | 'enterprise';
export type PaymentStatus = 'trial' | 'active' | 'overdue' | 'suspended' | 'expired';

export interface CafeSubscription {
  cafeId: string;
  plan: PlanTier;
  trialStartedAt: string | null;
  trialDays: number;
  trialExpiresAt: string | null;
  subscriptionAmount: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  lastPaymentAt: string | null;
  nextPaymentDue: string | null;
  paymentStatus: PaymentStatus;
  isActive: boolean;
  suspendedReason: string | null;
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
 * Returns detailed access status including warnings.
 */
export function checkCafeAccess(subscription: CafeSubscription): AccessCheckResult {
  const now = new Date();

  // ── Manually Suspended ──────────────────────────────────
  if (!subscription.isActive) {
    return {
      allowed: false,
      reason: subscription.suspendedReason || 'Your account has been suspended. Contact ChatChaska support.',
      daysLeft: 0,
      status: 'suspended',
      showWarning: false,
      warningMessage: null,
    };
  }

  // ── Trial Plan ──────────────────────────────────────────
  if (subscription.plan === 'trial') {
    // 0 Days Trial = No trial granted, immediate payment required
    if (subscription.trialDays === 0) {
      return {
        allowed: false,
        reason: 'No free trial is active for this cafe. Please activate a paid subscription to access the POS.',
        daysLeft: 0,
        status: 'expired',
        showWarning: false,
        warningMessage: null,
      };
    }

    if (!subscription.trialExpiresAt) {
      return {
        allowed: true,
        reason: 'Free trial active',
        daysLeft: subscription.trialDays,
        status: 'trial',
        showWarning: false,
        warningMessage: null,
      };
    }

    const expiresAt = new Date(subscription.trialExpiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Trial active
    if (daysLeft > 3) {
      return {
        allowed: true,
        reason: 'Free trial active',
        daysLeft,
        status: 'trial',
        showWarning: false,
        warningMessage: null,
      };
    }

    // Trial expiring soon (≤ 3 days)
    if (daysLeft > 0) {
      return {
        allowed: true,
        reason: 'Free trial active',
        daysLeft,
        status: 'trial',
        showWarning: true,
        warningMessage: `Your free trial expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Contact ChatChaska to upgrade.`,
      };
    }

    // Trial expired — grace period
    const graceDaysLeft = GRACE_PERIOD_DAYS + daysLeft; // daysLeft is negative here
    if (graceDaysLeft > 0) {
      return {
        allowed: true,
        reason: 'Trial expired — grace period',
        daysLeft: 0,
        status: 'expired',
        showWarning: true,
        warningMessage: `Your trial has expired. You have ${graceDaysLeft} grace day${graceDaysLeft === 1 ? '' : 's'} remaining. Contact ChatChaska to activate your subscription.`,
      };
    }

    // Trial + grace period fully expired
    return {
      allowed: false,
      reason: 'Your free trial has expired. Please contact ChatChaska to activate your subscription and continue using the POS.',
      daysLeft: 0,
      status: 'expired',
      showWarning: false,
      warningMessage: null,
    };
  }

  // ── Paid Plans ──────────────────────────────────────────
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

  // Payment overdue — grace period
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
 * Calculate trial expiry date from start date and trial days.
 */
export function calculateTrialExpiry(startDate: Date, trialDays: number): Date {
  const expiry = new Date(startDate);
  expiry.setDate(expiry.getDate() + trialDays);
  return expiry;
}

/**
 * Get pricing for a plan tier.
 */
export const PLAN_PRICING: Record<PlanTier, { monthly: number; quarterly: number; yearly: number; label: string }> = {
  trial: { monthly: 0, quarterly: 0, yearly: 0, label: 'Free Trial' },
  basic: { monthly: 999, quarterly: 2697, yearly: 9588, label: 'Basic' },
  pro: { monthly: 2499, quarterly: 6747, yearly: 23988, label: 'Pro' },
  enterprise: { monthly: 4999, quarterly: 13497, yearly: 47988, label: 'Enterprise' },
};

/**
 * Get feature limits for a plan tier.
 */
export const PLAN_LIMITS: Record<PlanTier, { maxDevices: number; maxStaff: number; maxMenuItems: number }> = {
  trial: { maxDevices: 1, maxStaff: 3, maxMenuItems: 50 },
  basic: { maxDevices: 2, maxStaff: 5, maxMenuItems: 200 },
  pro: { maxDevices: 5, maxStaff: 15, maxMenuItems: 500 },
  enterprise: { maxDevices: 99, maxStaff: 99, maxMenuItems: 9999 },
};
