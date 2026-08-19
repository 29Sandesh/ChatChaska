import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { checkCafeAccess, type CafeSubscription } from '@/lib/subscription';
import { getDb } from '@/lib/database';

/**
 * GET /api/subscription/check
 *
 * Checks subscription / trial status for the active cafe.
 * Used by POS and Admin dashboard to render trial countdown banners or lockout screens.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = await getCurrentUser();
    const cafeId = searchParams.get('cafeId') || user?.cafeId || 'demo';

    // Fetch license settings from local DB settings table as fallback/local source
    const db = getDb();
    const settingsRows = db.prepare('SELECT key, value FROM settings WHERE key LIKE "license_%"').all() as Array<{ key: string; value: string }>;
    
    const settingsMap: Record<string, string> = {};
    settingsRows.forEach((r) => {
      settingsMap[r.key] = r.value;
    });

    const plan = (settingsMap['license_plan'] || 'trial') as CafeSubscription['plan'];
    const isActive = settingsMap['license_is_active'] !== 'false';
    const trialDays = parseInt(settingsMap['license_trial_days'] || '14', 10);
    const trialExpiresAt = settingsMap['license_expires_at'] || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const suspendedReason = settingsMap['license_suspended_reason'] || null;

    const subscription: CafeSubscription = {
      cafeId,
      plan,
      trialStartedAt: settingsMap['license_started_at'] || new Date().toISOString(),
      trialDays,
      trialExpiresAt,
      subscriptionAmount: parseFloat(settingsMap['license_amount'] || '2499'),
      billingCycle: 'monthly',
      lastPaymentAt: settingsMap['license_last_payment'] || null,
      nextPaymentDue: settingsMap['license_next_due'] || null,
      paymentStatus: (settingsMap['license_status'] || 'trial') as CafeSubscription['paymentStatus'],
      isActive,
      suspendedReason,
    };

    const accessResult = checkCafeAccess(subscription);

    return NextResponse.json({
      subscription,
      access: accessResult,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[Subscription Check Error]:', err);
    return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 500 });
  }
}
