import { NextResponse } from 'next/server';
import { getAllHeldOrders, saveHeldOrder, deleteHeldOrder } from '@/lib/database';

export async function GET() {
  try {
    const heldOrders = getAllHeldOrders();
    return NextResponse.json({ heldOrders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, tableNumber, waiterName, items, subtotal, grandTotal } = body;
    
    if (!id || !tableNumber || !waiterName || !items || subtotal === undefined || grandTotal === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const saved = saveHeldOrder({ id, tableNumber, waiterName, items, subtotal, grandTotal });
    return NextResponse.json({ order: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }
    const success = deleteHeldOrder(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
