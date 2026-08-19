import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * GET & PUT /api/admin/profile
 * Reads and updates cafe public discovery profile
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cafeId = searchParams.get('cafe_id') || '00000000-0000-0000-0000-000000000001';

    const { data: cafe, error } = await cloudAdminClient
      .from('cafes')
      .select('*')
      .eq('id', cafeId)
      .single();

    if (error) {
      // Fallback
      return NextResponse.json({
        cafe: {
          id: cafeId,
          name: 'ChatChaska Signature Cafe',
          slug: 'chatchaska-cafe',
          description: 'Authentic gourmet teas, artisan snacks, and delightful street fusion.',
          logo_url: '/chaska-c-logo.png',
          banner_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
          address: 'Main Boulevard, Koregaon Park',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          cuisine_tags: ['Cafe', 'Tea & Coffee', 'Street Snacks'],
          avg_cost_for_two: 350,
          is_pure_veg: true,
          opening_time: '08:00',
          closing_time: '23:00',
          whatsapp: '9876543210',
          phone: '+91 98765 43210',
        },
      });
    }

    return NextResponse.json({ cafe });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id = '00000000-0000-0000-0000-000000000001', ...updates } = body;

    const { data, error } = await cloudAdminClient
      .from('cafes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, cafe: data });
  } catch (error: any) {
    console.error('Error updating cafe profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
