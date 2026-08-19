import { NextResponse } from 'next/server';
import { getAllTables, updateTableStatus, getDb } from '@/lib/database';

export async function GET() {
  try {
    const tables = getAllTables();
    return NextResponse.json({ tables });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, floorId, seats } = await req.json();
    if (!name || !floorId) {
      return NextResponse.json({ error: 'Name and floorId are required' }, { status: 400 });
    }

    const db = getDb();
    const id = `table-${name.toLowerCase().replace(/\s+/g, '-')}`;
    db.prepare('INSERT INTO tables (id, name, floor_id, seats, status) VALUES (?, ?, ?, ?, ?)').run(
      id,
      name,
      floorId,
      seats || 4,
      'blank'
    );

    return NextResponse.json({ success: true, id, name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, currentBillId, currentAmount } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }
    
    // Support matching by name (e.g., "T1") or id ("table-t1")
    const db = getDb();
    let targetId = id;
    const existing = db.prepare('SELECT id FROM tables WHERE id = ? OR name = ?').get(id, id) as { id: string } | undefined;
    if (existing) {
      targetId = existing.id;
    }

    updateTableStatus(targetId, status, currentBillId, currentAmount);
    return NextResponse.json({ success: true, targetId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
