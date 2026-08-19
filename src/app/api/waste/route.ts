import { NextResponse } from 'next/server';
import { getWasteLogs, saveWasteLog } from '@/lib/database';

export async function GET() {
  try {
    const wasteLogs = getWasteLogs();
    return NextResponse.json({ wasteLogs });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch waste logs';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.itemName || body.quantity == null || !body.reason) {
      return NextResponse.json({ error: 'Item name, quantity, and reason are required' }, { status: 400 });
    }

    const waste = saveWasteLog(body);
    return NextResponse.json({ success: true, waste }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to log waste';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
