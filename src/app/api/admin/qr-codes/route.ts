import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * GET /api/admin/qr-codes
 * Returns all generated QR code records for the active cafe
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cafeId = searchParams.get('cafe_id');

    let query = cloudAdminClient.from('qr_codes').select('*').order('created_at', { ascending: true });
    if (cafeId) {
      query = query.eq('cafe_id', cafeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ qrCodes: data || [] });
  } catch (error: any) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/qr-codes
 * Creates or updates table QR codes in Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cafe_id, tables, template_id = 'classic' } = body;

    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      return NextResponse.json({ error: 'Tables array is required' }, { status: 400 });
    }

    const records = tables.map((t: any) => ({
      cafe_id: cafe_id || '00000000-0000-0000-0000-000000000001',
      table_label: t.label || `Table ${t.number}`,
      table_number: t.number,
      template_id,
      is_active: true,
      scan_count: 0,
    }));

    const { data, error } = await cloudAdminClient
      .from('qr_codes')
      .upsert(records, { onConflict: 'cafe_id,table_number' })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, created: data || [] });
  } catch (error: any) {
    console.error('Error saving QR codes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/qr-codes?id={id}
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await cloudAdminClient.from('qr_codes').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
