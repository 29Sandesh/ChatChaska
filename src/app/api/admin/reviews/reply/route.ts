import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * PATCH /api/admin/reviews/reply
 * Allows cafe owners to post or update their reply to a customer review
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { review_id, reply_text } = body;

    if (!review_id || !reply_text) {
      return NextResponse.json({ error: 'Review ID and reply text are required' }, { status: 400 });
    }

    const { data, error } = await cloudAdminClient
      .from('cloud_reviews')
      .update({
        owner_reply: reply_text,
        owner_replied_at: new Date().toISOString(),
      })
      .eq('id', review_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, review: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
