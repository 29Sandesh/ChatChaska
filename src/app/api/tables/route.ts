import { NextResponse } from 'next/server';
import { getDb } from '@/lib/database';

export async function GET() {
  try {
    const db = getDb();
    const tables = db.prepare('SELECT * FROM tables ORDER BY CAST(REPLACE(REPLACE(name, "Table ", ""), "T", "") AS INTEGER), name ASC').all() as any[];

    // Fetch active non-completed orders to compute real-time table occupancy
    const activeOrders = db.prepare(
      "SELECT * FROM orders WHERE status IN ('pending', 'preparing', 'ready', 'served') ORDER BY created_at DESC"
    ).all() as any[];

    const activeOrdersByTable: Record<string, any> = {};
    for (const order of activeOrders) {
      const tNum = (order.table_number || '').trim();
      if (tNum && !activeOrdersByTable[tNum]) {
        activeOrdersByTable[tNum] = order;
      }
    }

    const enrichedTables = tables.map((t) => {
      // Check if table has active order by name (e.g., "Table 1" or "T1")
      const activeOrder = activeOrdersByTable[t.name] || activeOrdersByTable[t.name.replace('Table ', 'T')];
      
      const isOccupied = !!activeOrder || t.status === 'running' || t.status === 'occupied';

      let items: any[] = [];
      let totalAmount = 0;
      let orderId = '';

      if (activeOrder) {
        try {
          items = JSON.parse(activeOrder.items_json || '[]');
        } catch {
          items = [];
        }
        totalAmount = activeOrder.total_amount || 0;
        orderId = activeOrder.id;
      } else if (t.current_amount) {
        totalAmount = t.current_amount;
      }

      return {
        id: t.id,
        name: t.name,
        seats: t.seats || 4,
        floorId: t.floor_id || 'floor-main',
        status: isOccupied ? 'occupied' : 'free',
        activeOrderId: orderId,
        totalAmount,
        itemCount: items.length,
        items,
        orderTime: activeOrder ? activeOrder.created_at : null,
      };
    });

    return NextResponse.json({ tables: enrichedTables });
  } catch (error: any) {
    console.error('[API Tables GET Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, seats = 4, floorId = 'floor-main' } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
    }

    const db = getDb();
    // Normalize name e.g. "7" -> "Table 7", "Table 7" -> "Table 7"
    const cleanName = name.startsWith('Table ') ? name : isNaN(Number(name)) ? name : `Table ${name}`;
    const id = `table-${cleanName.toLowerCase().replace(/\s+/g, '-')}`;

    db.prepare('INSERT OR REPLACE INTO tables (id, name, floor_id, seats, status) VALUES (?, ?, ?, ?, ?)').run(
      id,
      cleanName,
      floorId,
      Number(seats) || 4,
      'blank'
    );

    return NextResponse.json({ success: true, id, name: cleanName });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Table id is required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM tables WHERE id = ?').run(id);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, currentBillId, currentAmount } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing table id' }, { status: 400 });
    }
    
    const db = getDb();
    const dbStatus = status === 'free' ? 'blank' : 'running';
    db.prepare('UPDATE tables SET status = ?, current_bill_id = ?, current_amount = ? WHERE id = ? OR name = ?').run(
      dbStatus,
      currentBillId || '',
      currentAmount || 0,
      id,
      id
    );

    // If clearing table to free, also mark running orders as completed
    if (status === 'free' || dbStatus === 'blank') {
      db.prepare("UPDATE orders SET status = 'completed' WHERE (table_number = ? OR table_number = ?) AND status IN ('pending', 'preparing', 'ready', 'served')").run(
        id,
        id.replace('table-', '').replace('-', ' ')
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
