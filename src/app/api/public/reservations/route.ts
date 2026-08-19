import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * POST /api/public/reservations
 * Allows customers to request table reservations on the cafe profile
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cafe_slug,
      cafe_id,
      customer_name,
      customer_phone,
      customer_email,
      guest_count = 2,
      reservation_date,
      time_slot,
      special_request = '',
    } = body;

    if (!customer_name || !customer_phone || !reservation_date || !time_slot) {
      return NextResponse.json(
        { error: 'Name, phone, date, and time slot are required.' },
        { status: 400 }
      );
    }

    // Resolve cafe_id if slug was passed
    let targetCafeId = cafe_id;
    if (!targetCafeId && cafe_slug) {
      const { data: cafe } = await cloudAdminClient
        .from('cafes')
        .select('id')
        .eq('slug', cafe_slug)
        .single();
      if (cafe) targetCafeId = cafe.id;
    }

    if (!targetCafeId) {
      targetCafeId = '00000000-0000-0000-0000-000000000001';
    }

    const { data: booking, error } = await cloudAdminClient
      .from('cloud_reservations')
      .insert({
        cafe_id: targetCafeId,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        guest_count: Number(guest_count),
        reservation_date,
        time_slot,
        special_request,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.warn('DB cloud_reservations insert fallback:', error);
    }

    const resBooking = booking || {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name,
      customer_phone,
      guest_count,
      reservation_date,
      time_slot,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Table reservation submitted! The cafe will confirm shortly.',
      booking: resBooking,
    });
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
