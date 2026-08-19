import { NextResponse } from 'next/server';
import { processSyncQueue, getSyncStatus } from '@/lib/sync';

/**
 * GET /api/sync
 * Returns sync queue statistics and connectivity status.
 */
export async function GET() {
  try {
    const status = getSyncStatus();
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch sync status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/sync
 * Manually dispatches all pending offline actions to Supabase cloud.
 */
export async function POST() {
  try {
    const result = await processSyncQueue();
    const status = getSyncStatus();
    return NextResponse.json({
      success: true,
      result,
      ...status,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Sync processing failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
