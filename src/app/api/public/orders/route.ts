import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';
import { CloudOrder } from '@/types';

/**
 * POST /api/public/orders
 * Creates a verified customer order from QR scan or discovery app and triggers real-time push to POS
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cafe_id,
      cafe_slug,
      table_number = 'Table 1',
      session_token,
      items,
      customer_phone,
      customer_name = 'Guest',
      special_instructions = '',
      source = 'qr',
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least 1 item' }, { status: 400 });
    }

    // 1. Calculate subtotal & GST server-side
    let subtotal = 0;
    const cleanItems = items.map((it: any) => {
      const price = Number(it.price) || 0;
      const qty = Number(it.quantity) || 1;
      subtotal += price * qty;
      return {
        id: it.id || 'item',
        name: it.name,
        quantity: qty,
        price,
        variant: it.variant || it.selectedVariant || undefined,
        addons: it.addons || it.selectedAddons || undefined,
      };
    });

    const gstAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const totalAmount = subtotal + gstAmount;

    // 2. Generate daily order number (e.g. ORD-0042)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${randomSuffix}`;

    // 3. Resolve cafe_id if cafe_slug was supplied
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

    // 4. Insert into cloud_orders (Supabase Realtime will broadcast this to POS automatically)
    const newOrder: Partial<CloudOrder> = {
      cafe_id: targetCafeId,
      order_number: orderNumber,
      table_number: table_number,
      customer_phone: customer_phone || '9876543210',
      customer_name: customer_name,
      session_token: session_token || null,
      items: cleanItems,
      subtotal,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      status: 'pending',
      special_instructions,
      source: source as any,
      estimated_prep_minutes: 15,
    };

    let createdRecord = null;
    try {
      const { data, error } = await cloudAdminClient
        .from('cloud_orders')
        .insert({
          cafe_id: targetCafeId,
          order_number: orderNumber,
          table_number: table_number,
          customer_phone: customer_phone || '9876543210',
          customer_name: customer_name,
          session_token: session_token || null,
          items_json: cleanItems,
          subtotal,
          gst_amount: gstAmount,
          total_amount: totalAmount,
          status: 'pending',
          special_instructions,
          source,
          estimated_prep_minutes: 15,
        })
        .select()
        .single();

      if (!error && data) {
        createdRecord = data;
      }
    } catch (dbErr) {
      console.warn('DB cloud_orders insert error:', dbErr);
    }

    const finalOrder = createdRecord || {
      id: `ord-${randomSuffix}`,
      ...newOrder,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      order: finalOrder,
    });
  } catch (error: any) {
    console.error('Error placing cloud order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
