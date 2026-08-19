import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * GET & POST /api/public/cafes/[slug]/reviews
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data: cafe } = await cloudAdminClient
      .from('cafes')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!cafe) {
      return NextResponse.json({ reviews: [] });
    }

    const { data: reviews, error } = await cloudAdminClient
      .from('cloud_reviews')
      .select('*')
      .eq('cafe_id', cafe.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ reviews: reviews || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { rating, comment, customer_name, customer_phone, food_rating, service_rating, ambience_rating } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const { data: cafe } = await cloudAdminClient
      .from('cafes')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!cafe) {
      return NextResponse.json({ error: 'Cafe not found' }, { status: 404 });
    }

    const { data: review, error } = await cloudAdminClient
      .from('cloud_reviews')
      .insert({
        cafe_id: cafe.id,
        customer_phone: customer_phone || '9876543210',
        customer_name: customer_name || 'Guest',
        rating: Math.round(rating),
        comment: comment || '',
        food_rating: food_rating || rating,
        service_rating: service_rating || rating,
        ambience_rating: ambience_rating || rating,
        is_verified: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
