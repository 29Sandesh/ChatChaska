import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * GET /api/public/cafes
 * Public search & discovery endpoint for listed restaurants and cafes
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const city = searchParams.get('city') || '';
    const cuisine = searchParams.get('cuisine') || '';
    const vegOnly = searchParams.get('veg') === 'true';
    const sort = searchParams.get('sort') || 'rating'; // 'rating' | 'popular' | 'newest'

    let query = cloudAdminClient
      .from('cafes')
      .select('*')
      .eq('is_active', true);

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const { data: cafes, error } = await query;
    if (error) throw error;

    let filtered = cafes || [];

    // Filter by search query
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.city?.toLowerCase().includes(search) ||
          c.address?.toLowerCase().includes(search) ||
          (c.cuisine_tags && c.cuisine_tags.some((tag: string) => tag.toLowerCase().includes(search)))
      );
    }

    // Filter by cuisine tag
    if (cuisine) {
      filtered = filtered.filter(
        (c) => c.cuisine_tags && c.cuisine_tags.some((t: string) => t.toLowerCase() === cuisine.toLowerCase())
      );
    }

    // Filter by veg
    if (vegOnly) {
      filtered = filtered.filter((c) => c.is_pure_veg === true);
    }

    // Sort results
    if (sort === 'rating') {
      filtered.sort((a, b) => (b.avg_rating || 4.5) - (a.avg_rating || 4.5));
    } else if (sort === 'popular') {
      filtered.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0));
    } else if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Fallback demo cafe if database is empty so discovery UI is never empty
    if (filtered.length === 0 && !search && !cuisine) {
      filtered = [
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'ChatChaska Signature Cafe',
          slug: 'chatchaska-cafe',
          description: 'Authentic gourmet teas, artisan snacks, and delightful street fusion.',
          logo_url: '/chaska-c-logo.png',
          banner_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
          address: 'Main Boulevard, Koregaon Park',
          city: 'Pune',
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
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          name: 'Royal Spice Kitchen & Tandoor',
          slug: 'royal-spice-kitchen',
          description: 'Authentic North Indian curries, kebabs, and live tandoori breads.',
          logo_url: '/chaska-c-logo.png',
          banner_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
          address: 'Indiranagar 100ft Road',
          city: 'Bangalore',
          cuisine_tags: ['North Indian', 'Tandoor', 'Biryani', 'Mughlai'],
          avg_cost_for_two: 600,
          is_pure_veg: false,
          avg_rating: 4.6,
          total_reviews: 218,
          total_orders: 1420,
          featured: true,
          opening_time: '11:00',
          closing_time: '23:30',
          whatsapp: '919876543211',
          phone: '+91 98765 43211',
        },
      ];
    }

    return NextResponse.json({
      cafes: filtered,
      total: filtered.length,
    });
  } catch (error: any) {
    console.error('Error in /api/public/cafes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
