import { NextResponse } from 'next/server';
import { getAllOnlineOrders, saveOnlineOrder, updateOnlineOrderStatus } from '@/lib/database';
import { parseSwiggyWebhookPayload } from '@/lib/aggregators/swiggy';
import { parseZomatoWebhookPayload } from '@/lib/aggregators/zomato';

export async function GET() {
  try {
    const orders = getAllOnlineOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch online orders';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform') || 'swiggy';
    const body = await req.json();

    let parsedOrder;
    if (platform === 'zomato') {
      parsedOrder = parseZomatoWebhookPayload(body);
    } else {
      parsedOrder = parseSwiggyWebhookPayload(body);
    }

    const saved = saveOnlineOrder(parsedOrder);
    return NextResponse.json({ success: true, order: saved }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process online order webhook';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    const updated = updateOnlineOrderStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
