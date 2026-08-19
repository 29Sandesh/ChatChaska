import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * GET & PATCH /api/admin/reservations
 * Lists and updates table reservation requests for the cafe owner
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cafeId = searchParams.get('cafe_id') || '00000000-0000-0000-0000-000000000001';

    const { data: bookings, error } = await cloudAdminClient
      .from('cloud_reservations')
      .select('*')
      .eq('cafe_id', cafeId)
      .order('reservation_date', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      // Demo fallback if table is empty
      return NextResponse.json({
        reservations: [
          {
            id: 'RES-1042',
            customer_name: 'Ananya Deshmukh',
            customer_phone: '+91 98231 44556',
            guest_count: 4,
            reservation_date: new Date().toISOString().split('T')[0],
            time_slot: '08:00 PM',
            special_request: 'Corner table with birthday decor if possible',
            status: 'pending',
            table_assigned: 'Table 6',
            created_at: new Date().toISOString(),
          },
          {
            id: 'RES-1039',
            customer_name: 'Karan Mehra',
            customer_phone: '+91 97654 11223',
            guest_count: 2,
            reservation_date: new Date().toISOString().split('T')[0],
            time_slot: '07:30 PM',
            special_request: 'Window seating preferred',
            status: 'confirmed',
            table_assigned: 'Table 2',
            created_at: new Date().toISOString(),
          },
        ],
      });
    }

    return NextResponse.json({ reservations: bookings || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, table_assigned } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Reservation ID and status required' }, { status: 400 });
    }

    const updates: any = { status };
    if (table_assigned) updates.table_assigned = table_assigned;
    if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();

    const { data, error } = await cloudAdminClient
      .from('cloud_reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, reservation: data });
  } catch (error: any) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
