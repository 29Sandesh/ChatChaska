import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * PATCH /api/admin/orders/[id]/status
 * Updates order status and automatically updates timestamps (confirmed_at, preparing_at, ready_at, served_at)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, rejection_reason } = body;

    const updates: any = {
      status,
    };

    if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
    if (status === 'preparing') updates.preparing_at = new Date().toISOString();
    if (status === 'ready') updates.ready_at = new Date().toISOString();
    if (status === 'served') updates.served_at = new Date().toISOString();
    if (status === 'rejected') {
      updates.status = 'rejected';
      updates.rejection_reason = rejection_reason || 'Rejected by kitchen';
    }

    const { data, error } = await cloudAdminClient
      .from('cloud_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Fallback matching by order_number
      await cloudAdminClient
        .from('cloud_orders')
        .update(updates)
        .eq('order_number', id);
    }

    return NextResponse.json({ success: true, updated: data || updates });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
