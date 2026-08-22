import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { checkCafeAccess, type CafeSubscription } from '@/lib/subscription';
import { getCafeUsageMetrics } from '@/lib/usage-monitor';
import { getDb } from '@/lib/database';

/**
 * GET /api/subscription/check
 *
 * Checks subscription and real-time usage metrics for the active cafe.
 * Free tier cafes are permanently active unless manually suspended.
 * Usage monitor tracks if the cafe is exceeding 100 bills/day.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    const cafeId = user?.cafeId || 'demo';

    // Fetch license settings from local DB settings table
    const db = getDb();
    const settingsRows = db.prepare('SELECT key, value FROM settings WHERE key LIKE "license_%"').all() as Array<{ key: string; value: string }>;
    
    const settingsMap: Record<string, string> = {};
    settingsRows.forEach((r) => {
      settingsMap[r.key] = r.value;
    });

    const plan = (settingsMap['license_plan'] || 'free') as CafeSubscription['plan'];
    const isActive = settingsMap['license_is_active'] !== 'false';
    const suspendedReason = settingsMap['license_suspended_reason'] || null;

    const subscription: CafeSubscription = {
      cafeId,
      plan,
      subscriptionAmount: parseFloat(settingsMap['license_amount'] || '0'),
      billingCycle: 'monthly',
      lastPaymentAt: settingsMap['license_last_payment'] || null,
      nextPaymentDue: settingsMap['license_next_due'] || null,
      paymentStatus: (settingsMap['license_status'] || (plan === 'free' ? 'free' : 'active')) as CafeSubscription['paymentStatus'],
      isActive,
      suspendedReason,
    };

    const accessResult = checkCafeAccess(subscription);
    const usage = getCafeUsageMetrics(cafeId);

    return NextResponse.json({
      subscription,
      access: accessResult,
      usage,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[Subscription Check Error]:', err);
    return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 });
  }
}
