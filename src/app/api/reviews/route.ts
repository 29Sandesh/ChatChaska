import { NextResponse } from 'next/server';
import { getAllReviews, saveReview } from '@/lib/database';

export interface ReviewPayload {
  id?: string;
  itemId?: string;
  rating: number;
  comment?: string;
  authorName?: string;
  createdAt?: string;
}

export async function GET() {
  try {
    const reviews = getAllReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: ReviewPayload = await req.json();

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Rating between 1 and 5 is required' }, { status: 400 });
    }

    const newReview = saveReview(body);

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Review submission failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
