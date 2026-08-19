import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * POST /api/public/qr-scan
 * Logs a customer table QR scan for cafe analytics
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cafe_slug, table_number, qr_id } = body;

    if (qr_id) {
      try {
        await cloudAdminClient.rpc('increment_qr_scan', { qr_id });
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
