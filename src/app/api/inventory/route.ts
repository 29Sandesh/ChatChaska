import { NextResponse } from 'next/server';
import { getInventoryItems, saveInventoryItem } from '@/lib/database';

export async function GET() {
  try {
    const items = getInventoryItems();
    return NextResponse.json({ items });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inventory items';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.unit) {
      return NextResponse.json({ error: 'Item name and unit are required' }, { status: 400 });
    }

    const item = saveInventoryItem(body);
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save inventory item';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
