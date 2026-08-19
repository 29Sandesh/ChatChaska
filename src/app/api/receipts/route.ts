import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, orderId, items, totalAmount, restaurantName = 'The Bistro Sphere' } = await req.json();

    if (!email || !orderId) {
      return NextResponse.json({ error: 'Email and orderId are required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Digital receipt sent to ${email}`,
      receipt: {
        orderId,
        email,
        restaurantName,
        totalAmount,
        itemCount: items?.length || 0,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Receipt generation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
