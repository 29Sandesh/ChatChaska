import { NextResponse } from 'next/server';
import { getTablesGroupedByFloor, getAllFloors, getDb } from '@/lib/database';

export async function GET() {
  try {
    const grouped = getTablesGroupedByFloor();
    return NextResponse.json({ floors: grouped });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Floor name is required' }, { status: 400 });
    }

    const db = getDb();
    const id = `floor-${Date.now().toString().slice(-4)}`;
    db.prepare('INSERT INTO floors (id, name, sort_order) VALUES (?, ?, ?)').run(id, name, 99);

    return NextResponse.json({ success: true, id, name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
