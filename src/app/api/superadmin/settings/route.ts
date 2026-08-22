import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/database';
import { getGrowthThresholdSettings } from '@/lib/usage-monitor';

/**
 * GET /api/superadmin/settings
 * Read platform growth threshold and pricing settings.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'super_admin') {
      // Allow read with fallback defaults
    }

    const { threshold, breachDays } = getGrowthThresholdSettings();

    return NextResponse.json({
      success: true,
      growthBillThreshold: threshold,
      growthBreachDays: breachDays,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/superadmin/settings
 * Save platform growth threshold and billing settings.
 */
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized: super_admin required' }, { status: 403 });
    }

    const body = await req.json();
    const { growthBillThreshold, growthBreachDays } = body;

    const db = getDb();

    if (growthBillThreshold !== undefined) {
      db.prepare(`
        INSERT INTO settings (key, value) VALUES ('growth_bill_threshold', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(String(growthBillThreshold));
    }

    if (growthBreachDays !== undefined) {
      db.prepare(`
        INSERT INTO settings (key, value) VALUES ('growth_breach_days', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(String(growthBreachDays));
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
