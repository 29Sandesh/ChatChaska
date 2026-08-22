import { getDb } from '@/lib/database';

export interface UsageMetrics {
  todayBills: number;
  threshold: number;
  breachDays: number;
  breachDaysRequired: number;
  isThresholdBreachedToday: boolean;
  isGrowing: boolean;
  shouldShowPrompt: boolean;
  totalBills: number;
}

const DEFAULT_DAILY_THRESHOLD = 100;
const DEFAULT_BREACH_DAYS = 3;

/**
 * Retrieves the current configured bill threshold from settings table.
 */
export function getGrowthThresholdSettings(): { threshold: number; breachDays: number } {
  try {
    const db = getDb();
    const rows = db.prepare(
      'SELECT key, value FROM settings WHERE key IN ("growth_bill_threshold", "growth_breach_days")'
    ).all() as Array<{ key: string; value: string }>;

    let threshold = DEFAULT_DAILY_THRESHOLD;
    let breachDays = DEFAULT_BREACH_DAYS;

    rows.forEach((r) => {
      if (r.key === 'growth_bill_threshold') {
        const val = parseInt(r.value, 10);
        if (!isNaN(val) && val > 0) threshold = val;
      }
      if (r.key === 'growth_breach_days') {
        const val = parseInt(r.value, 10);
        if (!isNaN(val) && val > 0) breachDays = val;
      }
    });

    return { threshold, breachDays };
  } catch (err) {
    console.error('[UsageMonitor] Error reading threshold settings:', err);
    return { threshold: DEFAULT_DAILY_THRESHOLD, breachDays: DEFAULT_BREACH_DAYS };
  }
}

/**
 * Calculates real-time usage metrics and threshold checks for a cafe.
 */
export function getCafeUsageMetrics(cafeId?: string): UsageMetrics {
  const { threshold, breachDays: breachDaysRequired } = getGrowthThresholdSettings();

  try {
    const db = getDb();

    // 1. Get today's bill count
    // Uses date(created_at, 'localtime') to accurately match local calendar day
    let todayQuery = 'SELECT COUNT(*) as count FROM bills WHERE date(created_at, "localtime") = date("now", "localtime")';
    const todayParams: unknown[] = [];

    if (cafeId && cafeId !== 'demo' && cafeId !== 'all') {
      todayQuery += ' AND restaurant_id = ?';
      todayParams.push(cafeId);
    }

    const todayRow = db.prepare(todayQuery).get(...todayParams) as { count: number } | undefined;
    const todayBills = todayRow?.count || 0;

    // 2. Count number of historical days where daily bills >= threshold
    let breachQuery = `
      SELECT COUNT(*) as daysCount FROM (
        SELECT date(created_at, "localtime") as bill_date, COUNT(*) as daily_count
        FROM bills
        ${cafeId && cafeId !== 'demo' && cafeId !== 'all' ? 'WHERE restaurant_id = ?' : ''}
        GROUP BY date(created_at, "localtime")
        HAVING daily_count >= ?
      )
    `;

    const breachParams: unknown[] = [];
    if (cafeId && cafeId !== 'demo' && cafeId !== 'all') {
      breachParams.push(cafeId);
    }
    breachParams.push(threshold);

    const breachRow = db.prepare(breachQuery).get(...breachParams) as { daysCount: number } | undefined;
    const breachDays = breachRow?.daysCount || 0;

    // 3. Total bills overall
    let totalQuery = 'SELECT COUNT(*) as total FROM bills';
    const totalParams: unknown[] = [];
    if (cafeId && cafeId !== 'demo' && cafeId !== 'all') {
      totalQuery += ' WHERE restaurant_id = ?';
      totalParams.push(cafeId);
    }
    const totalRow = db.prepare(totalQuery).get(...totalParams) as { total: number } | undefined;
    const totalBills = totalRow?.total || 0;

    const isThresholdBreachedToday = todayBills >= threshold;
    const isGrowing = breachDays >= 1 || isThresholdBreachedToday;
    const shouldShowPrompt = breachDays >= breachDaysRequired;

    return {
      todayBills,
      threshold,
      breachDays,
      breachDaysRequired,
      isThresholdBreachedToday,
      isGrowing,
      shouldShowPrompt,
      totalBills,
    };
  } catch (err) {
    console.error('[UsageMonitor] Error computing usage metrics:', err);
    return {
      todayBills: 0,
      threshold,
      breachDays: 0,
      breachDaysRequired,
      isThresholdBreachedToday: false,
      isGrowing: false,
      shouldShowPrompt: false,
      totalBills: 0,
    };
  }
}
