import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * GET /api/public/cafes/[slug]
 * Returns full profile, categories, menu items, and reviews for a single cafe
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Fetch Cafe Profile
    let cafeData: any = null;
    const { data: cafe, error } = await cloudAdminClient
      .from('cafes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && cafe) {
      cafeData = cafe;
    } else {
      // Demo fallback
      cafeData = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'ChatChaska Signature Cafe',
        slug: slug || 'chatchaska-cafe',
        description: 'Authentic gourmet teas, artisan snacks, and delightful street fusion.',
        logo_url: '/chaska-c-logo.png',
        banner_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
        address: 'Main Boulevard, Koregaon Park',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        cuisine_tags: ['Cafe', 'Tea & Coffee', 'Street Snacks', 'Fast Food'],
        avg_cost_for_two: 350,
        is_pure_veg: true,
        avg_rating: 4.8,
        total_reviews: 142,
        total_orders: 890,
        featured: true,
        opening_time: '08:00',
        closing_time: '23:00',
        whatsapp: '919876543210',
        phone: '+91 98765 43210',
        google_maps_url: 'https://maps.google.com/?q=Pune',
      };
    }

    // 2. Fetch Categories & Menu Items
    let categories: any[] = [];
    let menuItems: any[] = [];

    const { data: cloudCats } = await cloudAdminClient
      .from('cloud_categories')
      .select('*')
      .eq('cafe_id', cafeData.id)
      .eq('visible', true)
      .order('sort_order', { ascending: true });

    if (cloudCats && cloudCats.length > 0) {
      categories = cloudCats;
    }

    const { data: cloudItems } = await cloudAdminClient
      .from('cloud_menu_items')
      .select('*')
      .eq('cafe_id', cafeData.id)
      .eq('available', true);

    if (cloudItems && cloudItems.length > 0) {
      menuItems = cloudItems;
    }

    // 3. Fetch Reviews
    const { data: reviews } = await cloudAdminClient
      .from('cloud_reviews')
      .select('*')
      .eq('cafe_id', cafeData.id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      cafe: cafeData,
      categories,
      menuItems,
      reviews: reviews || [],
    });
  } catch (error: any) {
    console.error('Error fetching cafe detail:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
