import { NextResponse } from 'next/server';
import { getSetting, saveSetting } from '@/lib/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Setting key parameter is required' }, { status: 400 });
    }

    const value = getSetting(key, '');
    return NextResponse.json({ key, value });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch setting';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { key, value } = await req.json();
    if (!key || value == null) {
      return NextResponse.json({ error: 'Setting key and value are required' }, { status: 400 });
    }

    saveSetting(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save setting';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
