import { NextResponse } from 'next/server';
import { getAllOrders, saveOrder, updateOrderStatus } from '@/lib/database';

export interface OrderPayload {
  id?: string;
  restaurantId: string;
  tableNumber: string;
  items: { id: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
  status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  notes?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tableNumber = searchParams.get('tableNumber');

    if (tableNumber) {
      const { getTableRunningOrders } = await import('@/lib/database');
      const runningOrders = getTableRunningOrders(tableNumber);
      return NextResponse.json({ orders: runningOrders });
    }

    const orders = getAllOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: OrderPayload = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Order must contain items' }, { status: 400 });
    }

    const newOrder: OrderPayload = {
      id: body.id || `ord-${Date.now().toString().slice(-4)}`,
      restaurantId: body.restaurantId || 'demo',
      tableNumber: body.tableNumber || 'Table 01',
      items: body.items,
      totalAmount: body.totalAmount,
      status: body.status || 'pending',
      notes: body.notes || '',
    };

    saveOrder(newOrder);

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Order creation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status, notes, rejectionReason } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Order id and status are required' }, { status: 400 });
    }

    const updated = updateOrderStatus(id, status, rejectionReason || notes);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Order status update failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

