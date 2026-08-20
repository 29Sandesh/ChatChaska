import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Bill } from '@/types';
import { OrderPayload } from '@/app/api/orders/route';
import { DEMO_MENU_ITEMS, DEMO_TEAM } from '@/lib/mockData';

export function getDbPath(): string {
  let dirPath = process.cwd();
  if (process.env.APPDATA) {
    dirPath = path.join(process.env.APPDATA, 'MenuCraft POS');
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return path.join(dirPath, 'menucraft.db');
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    const dbPath = getDbPath();
    console.log(`[Database] Connecting to SQLite database at: ${dbPath}`);
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    initDbSchema(dbInstance);
  }
  return dbInstance;
}

function initDbSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      table_number TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      token_number TEXT,
      order_id TEXT,
      restaurant_id TEXT NOT NULL,
      restaurant_name TEXT NOT NULL,
      table_number TEXT NOT NULL,
      waiter_name TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      gst_percent REAL NOT NULL DEFAULT 5,
      cgst_amount REAL NOT NULL DEFAULT 0,
      sgst_amount REAL NOT NULL DEFAULT 0,
      gst_amount REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      grand_total REAL NOT NULL,
      payment_mode TEXT NOT NULL DEFAULT 'cash',
      split_details_json TEXT,
      status TEXT NOT NULL DEFAULT 'paid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      strike_price REAL,
      description TEXT,
      available INTEGER DEFAULT 1,
      popular INTEGER DEFAULT 0,
      veg INTEGER DEFAULT 1,
      spicy INTEGER DEFAULT 0,
      image TEXT,
      shortcode TEXT,
      variants_json TEXT,
      addons_json TEXT,
      tags_json TEXT
    );

    CREATE TABLE IF NOT EXISTS offline_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      visit_count INTEGER DEFAULT 1,
      total_spend REAL DEFAULT 0,
      tags_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      pin TEXT,
      phone TEXT,
      hourly_rate REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      cashier_name TEXT NOT NULL,
      opened_at DATETIME NOT NULL,
      closed_at DATETIME,
      opening_cash REAL DEFAULT 0,
      closing_cash REAL,
      expected_cash REAL,
      total_sales REAL DEFAULT 0,
      status TEXT DEFAULT 'open',
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      current_stock REAL NOT NULL DEFAULT 0,
      min_stock REAL NOT NULL DEFAULT 0,
      cost_per_unit REAL NOT NULL DEFAULT 0,
      expiry_date TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      item_id TEXT,
      rating INTEGER NOT NULL,
      comment TEXT,
      author_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS kitchen_stations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      printer_name TEXT,
      categories_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      menu_item_id TEXT NOT NULL,
      menu_item_name TEXT NOT NULL,
      ingredients_json TEXT NOT NULL,
      total_cost REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      phone TEXT,
      email TEXT,
      items_supplied_json TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS waste_log (
      id TEXT PRIMARY KEY,
      item_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      cost_value REAL NOT NULL,
      reason TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS online_orders (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      order_id TEXT NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      delivery_address TEXT,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      delivery_fee REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      rider_name TEXT,
      rider_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS held_orders (
      id TEXT PRIMARY KEY,
      table_number TEXT NOT NULL,
      waiter_name TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      grand_total REAL NOT NULL,
      held_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      visible INTEGER DEFAULT 1,
      icon TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS floors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      floor_id TEXT DEFAULT 'floor-main',
      seats INTEGER NOT NULL DEFAULT 4,
      status TEXT NOT NULL DEFAULT 'blank',
      current_bill_id TEXT DEFAULT '',
      current_amount REAL DEFAULT 0,
      seated_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bill_sequence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_bills_created ON bills(created_at);
    CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_number);
    CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
    CREATE INDEX IF NOT EXISTS idx_offline_queue_synced ON offline_queue(synced);
    CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
    CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
    CREATE INDEX IF NOT EXISTS idx_tables_floor ON tables(floor_id);
    CREATE INDEX IF NOT EXISTS idx_held_orders_table ON held_orders(table_number);
  `);

  // Seed default categories if empty
  const categoriesCount = (db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number }).count;
  if (categoriesCount === 0) {
    const insertCat = db.prepare('INSERT INTO categories (id, name, sort_order, visible, icon) VALUES (?, ?, ?, 1, "")');
    const defaultCats = [
      ['starters', 'Starters & Tandoor', 0],
      ['main-course', 'Main Course & Curries', 1],
      ['breads-rice', 'Breads, Rice & Biryani', 2],
      ['soups-salads', 'Soups, Salads & Papad', 3],
      ['raita-curd', 'Raita & Sides', 4],
      ['indo-chinese', 'Indo-Chinese', 5],
      ['snacks-chaat', 'Chaat & Street Snacks', 6],
      ['shakes-beverages', 'Shakes & Thick Drinks', 7],
      ['desserts', 'Desserts & Sweets', 8],
      ['drinks', 'Tea, Coffee & Beverages', 9],
    ];
    defaultCats.forEach(([id, name, sortOrder]) => {
      insertCat.run(id, name, sortOrder);
    });
  }

  // Seed default kitchen stations if empty
  const stationsCount = (db.prepare('SELECT COUNT(*) as count FROM kitchen_stations').get() as { count: number }).count;
  if (stationsCount === 0) {
    const insertStation = db.prepare(`
      INSERT INTO kitchen_stations (id, name, printer_name, categories_json)
      VALUES (?, ?, ?, ?)
    `);
    insertStation.run('station-main', 'Main Kitchen', 'Thermal Printer 1', JSON.stringify(['main-course', 'breads-rice']));
    insertStation.run('station-tandoor', 'Tandoor & Grill', 'Thermal Printer 2', JSON.stringify(['starters']));
    insertStation.run('station-bar', 'Bar & Drinks', 'Bar Printer', JSON.stringify(['drinks']));
    insertStation.run('station-desserts', 'Desserts Counter', 'Dessert Printer', JSON.stringify(['desserts']));
  }

  // Seed default floors if empty
  const floorsCount = (db.prepare('SELECT COUNT(*) as count FROM floors').get() as { count: number }).count;
  if (floorsCount === 0) {
    const insertFloor = db.prepare('INSERT INTO floors (id, name, sort_order) VALUES (?, ?, ?)');
    insertFloor.run('floor-main', 'Main Dining', 0);
    insertFloor.run('floor-patio', 'Patio', 1);
    insertFloor.run('floor-ac', 'AC Section', 2);
    insertFloor.run('floor-rooftop', 'Roof Top', 3);
  }

  // Check if database needs initial seeding
  const menuItemsCount = (db.prepare('SELECT COUNT(*) as count FROM menu_items').get() as { count: number }).count;
  if (menuItemsCount === 0) {
    resetAndSeedIndianDatabase();
  }

  // Always ensure 1 Rupee Tomato Ketchup Packet exists in SQLite database
  const insert1RsKetchup = db.prepare(`
    INSERT OR REPLACE INTO menu_items (
      id, restaurant_id, name, category, price, strike_price, description,
      available, popular, veg, spicy, image, shortcode, tags_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 1, 0, ?, ?, ?)
  `);
  insert1RsKetchup.run(
    'tomato-ketchup-1rs',
    'demo',
    'Tomato Ketchup Packet (₹1)',
    'starters',
    1,
    null,
    'Single sachet tomato ketchup packet for ₹1 payment testing.',
    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80',
    'KET',
    JSON.stringify(['starters', 'Veg'])
  );
}

export function resetAndSeedIndianDatabase(): { success: boolean; message: string } {
  const db = getDb();

  // Drop old tables so schema changes are freshly recreated
  db.exec(`
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS bills;
    DROP TABLE IF EXISTS menu_items;
    DROP TABLE IF EXISTS tables;
  `);

  // Re-initialize clean table schemas
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      table_number TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bills (
      id TEXT PRIMARY KEY,
      token_number TEXT,
      order_id TEXT,
      restaurant_id TEXT NOT NULL,
      restaurant_name TEXT NOT NULL,
      table_number TEXT NOT NULL,
      waiter_name TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      gst_percent REAL NOT NULL DEFAULT 5,
      cgst_amount REAL NOT NULL DEFAULT 0,
      sgst_amount REAL NOT NULL DEFAULT 0,
      gst_amount REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      grand_total REAL NOT NULL,
      payment_mode TEXT NOT NULL DEFAULT 'cash',
      split_details_json TEXT,
      status TEXT NOT NULL DEFAULT 'paid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      strike_price REAL,
      description TEXT,
      available INTEGER DEFAULT 1,
      popular INTEGER DEFAULT 0,
      veg INTEGER DEFAULT 1,
      spicy INTEGER DEFAULT 0,
      image TEXT,
      shortcode TEXT,
      variants_json TEXT,
      addons_json TEXT,
      tags_json TEXT
    );

    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      floor_id TEXT DEFAULT 'floor-main',
      seats INTEGER NOT NULL DEFAULT 4,
      status TEXT NOT NULL DEFAULT 'blank',
      current_bill_id TEXT DEFAULT '',
      current_amount REAL DEFAULT 0,
      seated_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default tables
  const insertTable = db.prepare('INSERT INTO tables (id, name, floor_id, seats, status) VALUES (?, ?, ?, ?, ?)');
  insertTable.run('table-t1', 'T1', 'floor-main', 4, 'running');
  insertTable.run('table-t2', 'T2', 'floor-main', 2, 'blank');
  insertTable.run('table-t3', 'T3', 'floor-main', 4, 'blank');
  insertTable.run('table-t4', 'T4', 'floor-main', 6, 'running');
  insertTable.run('table-t5', 'T5', 'floor-main', 4, 'blank');
  insertTable.run('table-t6', 'T6', 'floor-main', 8, 'blank');
  insertTable.run('table-p1', 'P1', 'floor-patio', 4, 'paid');
  insertTable.run('table-p2', 'P2', 'floor-patio', 4, 'blank');
  insertTable.run('table-vip1', 'VIP 1', 'floor-ac', 10, 'running');
  insertTable.run('table-vip2', 'VIP 2', 'floor-ac', 8, 'blank');

  // Seed Menu Items
  const insertMenuItem = db.prepare(`
    INSERT INTO menu_items (
      id, restaurant_id, name, category, price, strike_price, description,
      available, popular, veg, spicy, image, shortcode, variants_json, addons_json, tags_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of DEMO_MENU_ITEMS) {
    insertMenuItem.run(
      item.id,
      'demo',
      item.name,
      item.category,
      item.price,
      item.strikePrice || null,
      item.description || '',
      item.available ? 1 : 0,
      item.popular ? 1 : 0,
      item.veg ? 1 : 0,
      item.spicy ? 1 : 0,
      item.image || '',
      item.id.slice(0, 3).toUpperCase(),
      item.variants ? JSON.stringify(item.variants) : null,
      item.addons ? JSON.stringify(item.addons) : null,
      JSON.stringify(item.tags || [])
    );
  }

  // Seed fresh Indian active orders
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, restaurant_id, table_number, items_json, total_amount, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Order 1: Table T1 (Round 1 Pending)
  insertOrder.run(
    'ord-201',
    'demo',
    'Table T1',
    JSON.stringify([
      { id: 'masala-chai', name: 'Masala Chai', quantity: 2, price: 60 },
      { id: 'paneer-tikka', name: 'Paneer Tikka', quantity: 1, price: 280 },
    ]),
    400.0,
    'pending',
    'Round 1: Chai & Paneer Tikka Starter'
  );

  // Order 2: Table T4 (Round 1 Preparing)
  insertOrder.run(
    'ord-202',
    'demo',
    'Table T4',
    JSON.stringify([
      { id: 'butter-chicken', name: 'Butter Chicken', quantity: 1, price: 380 },
      { id: 'butter-naan', name: 'Butter Naan', quantity: 4, price: 70 },
      { id: 'mango-lassi', name: 'Mango Lassi', quantity: 2, price: 120 },
    ]),
    900.0,
    'preparing',
    'Make Butter Chicken mild'
  );

  // Order 3: Table VIP 1 (Party Feast - 20 Items Order)
  insertOrder.run(
    'ord-203',
    'demo',
    'Table VIP 1',
    JSON.stringify([
      { id: 'water-bottle', name: 'Mineral Water Bottle (1L)', quantity: 4, price: 30 },
      { id: 'fresh-lime', name: 'Fresh Lime Soda', quantity: 3, price: 80 },
      { id: 'paneer-tikka', name: 'Paneer Tikka', quantity: 2, price: 280 },
      { id: 'chicken-tikka', name: 'Chicken Tikka', quantity: 2, price: 320 },
      { id: 'hara-bhara', name: 'Hara Bhara Kebab', quantity: 2, price: 240 },
      { id: 'tandoori-chicken', name: 'Tandoori Chicken', quantity: 1, price: 340 },
      { id: 'fish-amritsari', name: 'Fish Amritsari', quantity: 2, price: 380 },
      { id: 'butter-chicken', name: 'Butter Chicken', quantity: 3, price: 380 },
      { id: 'dal-makhani', name: 'Dal Makhani', quantity: 2, price: 260 },
      { id: 'kadhai-paneer', name: 'Kadhai Paneer', quantity: 2, price: 290 },
      { id: 'mutton-rogan', name: 'Mutton Rogan Josh', quantity: 2, price: 480 },
      { id: 'garlic-naan', name: 'Garlic Naan', quantity: 8, price: 80 },
      { id: 'butter-naan', name: 'Butter Naan', quantity: 10, price: 70 },
      { id: 'tandoori-roti', name: 'Tandoori Roti', quantity: 12, price: 40 },
      { id: 'veg-pulao', name: 'Veg Pulao', quantity: 3, price: 180 },
      { id: 'jeera-rice', name: 'Jeera Rice', quantity: 2, price: 150 },
      { id: 'gulab-jamun', name: 'Gulab Jamun', quantity: 4, price: 150 },
      { id: 'rasmalai', name: 'Rasmalai', quantity: 4, price: 180 },
    ]),
    10480.0,
    'pending',
    'VIP Party Feast 20-Items'
  );

  // Order 4: Table P1 (Completed Order)
  insertOrder.run(
    'ord-204',
    'demo',
    'Table P1',
    JSON.stringify([
      { id: 'biryani', name: 'Hyderabadi Chicken Biryani', quantity: 1, price: 350 },
      { id: 'fresh-lime', name: 'Fresh Lime Soda', quantity: 2, price: 80 },
      { id: 'rasmalai', name: 'Rasmalai', quantity: 1, price: 180 },
    ]),
    690.0,
    'completed',
    'Patio dinner completed'
  );

  // Seed Bills
  const insertBill = db.prepare(`
    INSERT INTO bills (
      id, token_number, order_id, restaurant_id, restaurant_name, table_number, waiter_name,
      items_json, subtotal, gst_percent, cgst_amount, sgst_amount, gst_amount,
      discount_amount, grand_total, payment_mode, status, created_at, closed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();

  insertBill.run(
    'MHMMC00001',
    '01',
    'ord-199',
    'demo',
    'ChatChaska Cafe',
    'Table T2',
    'Priya Sharma',
    JSON.stringify([
      { id: 'chole-bhature', name: 'Chole Bhature', quantity: 2, unitPrice: 220, lineTotal: 440 },
      { id: 'masala-chai', name: 'Masala Chai', quantity: 2, unitPrice: 60, lineTotal: 120 },
    ]),
    560,
    5,
    14,
    14,
    28,
    0,
    588,
    'cash',
    'paid',
    new Date(now.getTime() - 3600000).toISOString(),
    new Date(now.getTime() - 3500000).toISOString()
  );

  return { success: true, message: 'Database reset & seeded with fresh Indian menu, orders, and bills!' };
}

// Order DAO
export function getAllOrders(): OrderPayload[] {
  const db = getDb();
  const orderRows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
  const existingOrderIds = new Set(orderRows.map((r) => r.id));

  const ordersList: OrderPayload[] = orderRows.map((r) => ({
    id: r.id,
    restaurantId: r.restaurant_id,
    tableNumber: r.table_number,
    items: JSON.parse(r.items_json),
    totalAmount: r.total_amount,
    status: r.status,
    notes: r.notes || '',
  }));

  // Automatically merge recent POS Bills into active Orders list if not already tracked
  try {
    const billRows = db.prepare("SELECT * FROM bills ORDER BY created_at DESC LIMIT 50").all() as any[];
    for (const b of billRows) {
      const derivedOrderId = b.order_id || `ord-${b.id.slice(-6)}`;
      if (!existingOrderIds.has(derivedOrderId) && !existingOrderIds.has(b.id)) {
        ordersList.unshift({
          id: derivedOrderId,
          restaurantId: b.restaurant_id || 'demo',
          tableNumber: b.table_number || 'Walk-In POS',
          items: JSON.parse(b.items_json).map((i: any) => ({
            id: (i.name || 'item').toLowerCase().replace(/\s+/g, '-'),
            name: i.name || 'Item',
            quantity: i.quantity || 1,
            price: i.unitPrice || (i.lineTotal / (i.quantity || 1)),
          })),
          totalAmount: b.grand_total,
          status: 'preparing', // Kitchen queue
          notes: `Paid via ${(b.payment_mode || 'cash').toUpperCase()} (Token #${b.token_number || '01'})`,
        });
      }
    }
  } catch (err) {
    console.warn('[Database] Optional bill merge error:', err);
  }

  return ordersList;
}

export function saveOrder(order: OrderPayload): OrderPayload {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO orders (id, restaurant_id, table_number, items_json, total_amount, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    order.id,
    order.restaurantId,
    order.tableNumber,
    JSON.stringify(order.items),
    order.totalAmount,
    order.status || 'pending',
    order.notes || ''
  );
  return order;
}

export function updateOrderStatus(id: string, status: string, notes?: string): boolean {
  const db = getDb();
  
  // 1. Try updating direct match in orders table
  let stmt = notes
    ? db.prepare('UPDATE orders SET status = ?, notes = ? WHERE id = ?')
    : db.prepare('UPDATE orders SET status = ? WHERE id = ?');
  let result = stmt.run(notes ? [status, notes, id] : [status, id]);

  if (result.changes > 0) return true;

  // 2. Fallback: If order was derived from a bill (or bill ID), upsert it into orders table
  try {
    const bill = db.prepare('SELECT * FROM bills WHERE id = ? OR order_id = ?').get(id, id) as any;
    if (bill) {
      const orderId = bill.order_id || id;
      const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO orders (id, restaurant_id, table_number, items_json, total_amount, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        orderId,
        bill.restaurant_id || 'demo',
        bill.table_number || 'Walk-In POS',
        bill.items_json,
        bill.grand_total,
        status,
        notes || `Paid via ${(bill.payment_mode || 'cash').toUpperCase()} (Token #${bill.token_number || '01'})`
      );
      return true;
    }
  } catch (err) {
    console.warn('[Database] updateOrderStatus fallback error:', err);
  }

  // 3. Fallback: If still no match, insert stub order so UI update never fails
  try {
    const stubStmt = db.prepare(`
      INSERT OR REPLACE INTO orders (id, restaurant_id, table_number, items_json, total_amount, status, notes)
      VALUES (?, 'demo', 'Table T1', '[]', 0, ?, ?)
    `);
    stubStmt.run(id, status, notes || '');
    return true;
  } catch {
    return false;
  }
}

export function getTableRunningOrders(tableNumber: string): OrderPayload[] {
  const db = getDb();
  const cleanTable = tableNumber.replace(/^table\s*/i, '').trim();
  const rows = db.prepare(`
    SELECT * FROM orders 
    WHERE (table_number = ? OR table_number = ? OR table_number = ?) 
    AND status IN ('pending', 'preparing', 'ready', 'running')
    ORDER BY created_at ASC
  `).all(tableNumber, `Table ${cleanTable}`, `T${cleanTable}`) as any[];

  return rows.map((r) => ({
    id: r.id,
    restaurantId: r.restaurant_id,
    tableNumber: r.table_number,
    items: JSON.parse(r.items_json),
    totalAmount: r.total_amount,
    status: r.status,
    notes: r.notes || '',
  }));
}

export function clearTableOrders(tableNumber: string): boolean {
  const db = getDb();
  const cleanTable = tableNumber.replace(/^table\s*/i, '').trim();
  const stmt = db.prepare(`
    UPDATE orders 
    SET status = 'completed' 
    WHERE (table_number = ? OR table_number = ? OR table_number = ?) 
    AND status IN ('pending', 'preparing', 'ready', 'running')
  `);
  const result = stmt.run(tableNumber, `Table ${cleanTable}`, `T${cleanTable}`);
  return result.changes > 0;
}

/**
 * Generates exact 10-character unique lifetime Bill ID + Token Number (1 to 100).
 * 
 * 10-Character Bill ID Format:
 * - 5 letters starting prefix: State (2 letters e.g. MH) + City (1 letter e.g. M) + Cafe (2 letters e.g. MC) = MHMMC
 * - 5 digits sequential counter: 00001, 00002, 00003, ..., 99999
 * - Resulting Bill ID: MHMMC00001 (Exact 10 characters!)
 * 
 * Token Number:
 * - Loops 01 to 100 for customer pickup display
 */
export function getNextBillIdentifiers(customPrefix?: string): { billId: string; tokenNumber: string } {
  const db = getDb();
  
  let prefix = customPrefix;
  if (!prefix) {
    try {
      const row = db.prepare("SELECT value FROM settings WHERE key = 'bill_prefix'").get() as { value?: string } | undefined;
      prefix = row?.value || 'MHMMC';
    } catch {
      prefix = 'MHMMC';
    }
  }

  // Sanitize prefix to 5 uppercase letters
  let cleanPrefix = (prefix || 'MHMMC').toUpperCase().replace(/[^A-Z]/g, '');
  if (cleanPrefix.length < 5) {
    cleanPrefix = (cleanPrefix + 'MHMMC').slice(0, 5);
  } else {
    cleanPrefix = cleanPrefix.slice(0, 5);
  }

  // Insert into sequence and get lastInsertRowid
  const seqResult = db.prepare("INSERT INTO bill_sequence DEFAULT VALUES").run();
  const counter = seqResult.lastInsertRowid as number;

  // 5-digit padded counter: 00001, 00002, ...
  const paddedSeq = String(counter).padStart(5, '0');
  
  // Exact 10-character Bill ID (e.g. MHMMC00001)
  const billId = `${cleanPrefix}${paddedSeq}`;

  // Token number 1 to 100 (e.g. "01", "02", ..., "100")
  const tokenVal = ((counter - 1) % 100) + 1;
  const tokenNumber = String(tokenVal).padStart(2, '0');

  return { billId, tokenNumber };
}

// Bill DAO
export function getAllBills(statusFilter?: string | null): Bill[] {
  const db = getDb();
  let query = 'SELECT * FROM bills';
  const params: any[] = [];
  if (statusFilter && statusFilter !== 'all') {
    query += ' WHERE status = ?';
    params.push(statusFilter);
  }
  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r) => ({
    id: r.id,
    tokenNumber: r.token_number || '01',
    orderId: r.order_id || undefined,
    restaurantId: r.restaurant_id,
    restaurantName: r.restaurant_name,
    tableNumber: r.table_number,
    waiterName: r.waiter_name,
    items: JSON.parse(r.items_json),
    subtotal: r.subtotal,
    gstPercent: r.gst_percent,
    cgstAmount: r.cgst_amount,
    sgstAmount: r.sgst_amount,
    gstAmount: r.gst_amount,
    discountAmount: r.discount_amount,
    grandTotal: r.grand_total,
    paymentMode: r.payment_mode,
    splitDetails: r.split_details_json ? JSON.parse(r.split_details_json) : undefined,
    status: r.status,
    createdAt: r.created_at,
    closedAt: r.closed_at || undefined,
  }));
}

export function saveBill(bill: Bill): Bill {
  const db = getDb();
  
  let maxRetries = 5;
  while (maxRetries > 0) {
    let finalId = bill.id;
    let finalToken = bill.tokenNumber;
    // Generate new ID if missing, invalid, or during retry (when maxRetries < 5)
    if (!finalId || finalId.length !== 10 || maxRetries < 5) {
      const ids = getNextBillIdentifiers();
      finalId = ids.billId;
      finalToken = ids.tokenNumber;
    }

    try {
      const stmt = db.prepare(`
        INSERT INTO bills (
          id, token_number, order_id, restaurant_id, restaurant_name, table_number, waiter_name,
          items_json, subtotal, gst_percent, cgst_amount, sgst_amount, gst_amount,
          discount_amount, grand_total, payment_mode, split_details_json, status, created_at, closed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        finalId,
        finalToken || '01',
        bill.orderId || null,
        bill.restaurantId,
        bill.restaurantName,
        bill.tableNumber,
        bill.waiterName,
        JSON.stringify(bill.items),
        bill.subtotal,
        bill.gstPercent,
        bill.cgstAmount,
        bill.sgstAmount,
        bill.gstAmount,
        bill.discountAmount,
        bill.grandTotal,
        bill.paymentMode,
        bill.splitDetails ? JSON.stringify(bill.splitDetails) : null,
        bill.status,
        bill.createdAt || new Date().toISOString(),
        bill.closedAt || new Date().toISOString()
      );

      return { ...bill, id: finalId, tokenNumber: finalToken || '01' };
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
        maxRetries--;
        if (maxRetries === 0) throw err;
      } else {
        throw err;
      }
    }
  }
  throw new Error('Failed to save bill due to ID collision.');
}

export function updateBillStatus(id: string, status?: string, paymentMode?: string): boolean {
  const db = getDb();
  let query = 'UPDATE bills SET closed_at = ?';
  const params: any[] = [new Date().toISOString()];

  if (status) {
    query += ', status = ?';
    params.push(status);
  }
  if (paymentMode) {
    query += ', payment_mode = ?';
    params.push(paymentMode);
  }

  query += ' WHERE id = ?';
  params.push(id);

  const stmt = db.prepare(query);
  const result = stmt.run(...params);
  return result.changes > 0;
}

// Menu Items DAO
export function getAllMenuItems(category?: string | null): any[] {
  const db = getDb();
  let query = 'SELECT * FROM menu_items';
  const params: any[] = [];
  if (category && category !== 'ALL' && category !== 'all') {
    query += ' WHERE category = ?';
    params.push(category);
  }
  query += ' ORDER BY price ASC, name ASC';
  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r) => ({
    id: r.id,
    restaurantId: r.restaurant_id,
    name: r.name,
    category: r.category,
    price: r.price,
    strikePrice: r.strike_price,
    description: r.description,
    available: Boolean(r.available),
    popular: Boolean(r.popular),
    veg: Boolean(r.veg),
    spicy: Boolean(r.spicy),
    image: r.image,
    shortcode: r.shortcode,
    variants: r.variants_json ? JSON.parse(r.variants_json) : undefined,
    addons: r.addons_json ? JSON.parse(r.addons_json) : undefined,
    tags: r.tags_json ? JSON.parse(r.tags_json) : [],
  }));
}

export function saveMenuItem(item: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO menu_items (
      id, restaurant_id, name, category, price, strike_price, description,
      available, popular, veg, spicy, image, shortcode, variants_json, addons_json, tags_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    item.id || `item-${Date.now()}`,
    item.restaurantId || 'demo',
    item.name,
    item.category,
    item.price,
    item.strikePrice || null,
    item.description || '',
    item.available !== false ? 1 : 0,
    item.popular ? 1 : 0,
    item.veg !== false ? 1 : 0,
    item.spicy ? 1 : 0,
    item.image || '',
    item.shortcode || item.name.slice(0, 3).toUpperCase(),
    item.variants ? JSON.stringify(item.variants) : null,
    item.addons ? JSON.stringify(item.addons) : null,
    item.tags ? JSON.stringify(item.tags) : null
  );
  return item;
}

export function deleteMenuItem(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM menu_items WHERE id = ?');
  const res = stmt.run(id);
  return res.changes > 0;
}

// Customers DAO
export function getAllCustomers(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    visitCount: r.visit_count,
    totalSpend: r.total_spend,
    tags: r.tags_json ? JSON.parse(r.tags_json) : [],
    createdAt: r.created_at,
  }));
}

export function saveCustomer(customer: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO customers (id, name, phone, email, visit_count, total_spend, tags_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    customer.id || `cust-${Date.now()}`,
    customer.name,
    customer.phone,
    customer.email || null,
    customer.visitCount || 1,
    customer.totalSpend || 0,
    customer.tags ? JSON.stringify(customer.tags) : null
  );
  return customer;
}

// Staff DAO
export function getAllStaff(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM staff ORDER BY name ASC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    pin: r.pin,
    phone: r.phone,
    hourlyRate: r.hourly_rate,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export function saveStaff(staff: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO staff (id, name, role, pin, phone, hourly_rate, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    staff.id || `staff-${Date.now()}`,
    staff.name,
    staff.role,
    staff.pin || '1234',
    staff.phone || null,
    staff.hourlyRate || 0,
    staff.status || 'active'
  );
  return staff;
}

export function deleteStaff(id: string): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM staff WHERE id = ?').run(id);
  return res.changes > 0;
}

export function getStaffByPin(pin: string): any | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM staff WHERE pin = ? AND status = "active"').get(pin) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    pin: row.pin,
    phone: row.phone,
    hourlyRate: row.hourly_rate,
    status: row.status,
  };
}

// Inventory DAO
export function getInventoryItems(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM inventory_items ORDER BY name ASC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    unit: r.unit,
    currentStock: r.current_stock,
    minStock: r.min_stock,
    costPerUnit: r.cost_per_unit,
    expiryDate: r.expiry_date,
  }));
}

export function saveInventoryItem(item: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO inventory_items (id, name, unit, current_stock, min_stock, cost_per_unit, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    item.id || `inv-${Date.now()}`,
    item.name,
    item.unit,
    item.currentStock || 0,
    item.minStock || 0,
    item.costPerUnit || 0,
    item.expiryDate || null
  );
  return item;
}

// Settings DAO
export function getSetting(key: string, defaultValue: string = ''): string {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
  return row ? row.value : defaultValue;
}

export function saveSetting(key: string, value: string): void {
  const db = getDb();
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  stmt.run(key, value);
}

// Reviews DAO
export function getAllReviews(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    itemId: r.item_id,
    rating: r.rating,
    comment: r.comment,
    authorName: r.author_name,
    createdAt: r.created_at,
  }));
}

export function saveReview(review: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO reviews (id, item_id, rating, comment, author_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const newReview = {
    id: review.id || `rev-${Date.now()}`,
    itemId: review.itemId || 'general',
    rating: review.rating,
    comment: review.comment || '',
    authorName: review.authorName || 'Guest Customer',
    createdAt: review.createdAt || new Date().toISOString(),
  };
  stmt.run(newReview.id, newReview.itemId, newReview.rating, newReview.comment, newReview.authorName, newReview.createdAt);
  return newReview;
}

// Kitchen Stations DAO
export function getKitchenStations(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM kitchen_stations ORDER BY name ASC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    printerName: r.printer_name,
    categories: r.categories_json ? JSON.parse(r.categories_json) : [],
    createdAt: r.created_at,
  }));
}

export function saveKitchenStation(station: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO kitchen_stations (id, name, printer_name, categories_json)
    VALUES (?, ?, ?, ?)
  `);
  const id = station.id || `station-${Date.now()}`;
  stmt.run(id, station.name, station.printerName || null, JSON.stringify(station.categories || []));
  return { ...station, id };
}

export function deleteKitchenStation(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM kitchen_stations WHERE id = ?');
  const res = stmt.run(id);
  return res.changes > 0;
}

// Recipes DAO
export function getAllRecipes(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM recipes ORDER BY menu_item_name ASC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    menuItemId: r.menu_item_id,
    menuItemName: r.menu_item_name,
    ingredients: JSON.parse(r.ingredients_json),
    totalCost: r.total_cost,
    createdAt: r.created_at,
  }));
}

export function saveRecipe(recipe: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO recipes (id, menu_item_id, menu_item_name, ingredients_json, total_cost)
    VALUES (?, ?, ?, ?, ?)
  `);
  const id = recipe.id || `recipe-${Date.now()}`;
  stmt.run(id, recipe.menuItemId, recipe.menuItemName, JSON.stringify(recipe.ingredients), recipe.totalCost || 0);
  return { ...recipe, id };
}

// Suppliers DAO
export function getAllSuppliers(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    phone: r.phone,
    email: r.email,
    itemsSupplied: r.items_supplied_json ? JSON.parse(r.items_supplied_json) : [],
    status: r.status,
    createdAt: r.created_at,
  }));
}

export function saveSupplier(supplier: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO suppliers (id, name, category, phone, email, items_supplied_json, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const id = supplier.id || `sup-${Date.now()}`;
  stmt.run(id, supplier.name, supplier.category || 'General', supplier.phone || '', supplier.email || '', JSON.stringify(supplier.itemsSupplied || []), supplier.status || 'active');
  return { ...supplier, id };
}

// Purchase Orders DAO
export function getAllPurchaseOrders(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM purchase_orders ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    supplierId: r.supplier_id,
    supplierName: r.supplier_name,
    items: JSON.parse(r.items_json),
    totalAmount: r.total_amount,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export function savePurchaseOrder(po: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO purchase_orders (id, supplier_id, supplier_name, items_json, total_amount, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const id = po.id || `PO-${Date.now().toString().slice(-4)}`;
  stmt.run(id, po.supplierId, po.supplierName, JSON.stringify(po.items), po.totalAmount, po.status || 'draft');
  return { ...po, id };
}

// Waste Log DAO
export function getWasteLogs(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM waste_log ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    itemName: r.item_name,
    quantity: r.quantity,
    unit: r.unit,
    costValue: r.cost_value,
    reason: r.reason,
    createdAt: r.created_at,
  }));
}

export function saveWasteLog(waste: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO waste_log (id, item_name, quantity, unit, cost_value, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const id = waste.id || `waste-${Date.now()}`;
  stmt.run(id, waste.itemName, waste.quantity, waste.unit, waste.costValue, waste.reason);
  return { ...waste, id };
}

// Online Orders DAO
export function getAllOnlineOrders(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM online_orders ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    platform: r.platform,
    orderId: r.order_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    deliveryAddress: r.delivery_address,
    items: JSON.parse(r.items_json),
    subtotal: r.subtotal,
    tax: r.tax,
    deliveryFee: r.delivery_fee,
    totalAmount: r.total_amount,
    status: r.status,
    riderName: r.rider_name,
    riderPhone: r.rider_phone,
    createdAt: r.created_at,
  }));
}

export function saveOnlineOrder(order: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO online_orders (
      id, platform, order_id, customer_name, customer_phone, delivery_address,
      items_json, subtotal, tax, delivery_fee, total_amount, status, rider_name, rider_phone, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    order.id || `online-${Date.now()}`,
    order.platform || 'swiggy',
    order.orderId || `ORD-${Date.now()}`,
    order.customerName || 'Online Guest',
    order.customerPhone || '',
    order.deliveryAddress || '',
    JSON.stringify(order.items || []),
    order.subtotal || 0,
    order.tax || 0,
    order.deliveryFee || 0,
    order.totalAmount || 0,
    order.status || 'pending',
    order.riderName || '',
    order.riderPhone || '',
    order.createdAt || new Date().toISOString()
  );
  return order;
}

export function updateOnlineOrderStatus(id: string, status: string): boolean {
  const db = getDb();
  const stmt = db.prepare('UPDATE online_orders SET status = ? WHERE id = ?');
  const res = stmt.run(status, id);
  return res.changes > 0;
}

// Held Orders DAO
export function getAllHeldOrders(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM held_orders ORDER BY held_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    tableNumber: r.table_number,
    waiterName: r.waiter_name,
    items: JSON.parse(r.items_json),
    subtotal: r.subtotal,
    grandTotal: r.grand_total,
    heldAt: r.held_at,
  }));
}

export function saveHeldOrder(order: any): any {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO held_orders (id, table_number, waiter_name, items_json, subtotal, grand_total)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    order.id,
    order.tableNumber,
    order.waiterName,
    typeof order.items === 'string' ? order.items : JSON.stringify(order.items),
    order.subtotal,
    order.grandTotal
  );
  return order;
}

export function deleteHeldOrder(id: string): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM held_orders WHERE id = ?');
  const res = stmt.run(id);
  return res.changes > 0;
}

// Tables DAO
function seedDefaultTables(db: Database.Database) {
  // Seed default tables if empty
  const tablesCount = (db.prepare('SELECT COUNT(*) as count FROM tables').get() as { count: number }).count;
  if (tablesCount === 0) {
    const insertTable = db.prepare('INSERT INTO tables (id, name, floor_id, seats, status) VALUES (?, ?, ?, ?, ?)');
    for (let i = 1; i <= 8; i++) {
      insertTable.run(`table-${i}`, `Table ${i}`, 'floor-main', i <= 2 ? 2 : i <= 6 ? 4 : 6, 'blank');
    }
  }
}

export function getAllTables(): any[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM tables').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    zone: r.zone,
    seats: r.seats,
    status: r.status,
    guestName: r.guest_name,
    currentOrderId: r.current_order_id,
    seatedAt: r.seated_at,
  }));
}

export function getTableByName(name: string): any {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tables WHERE name = ?').get(name) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    zone: row.zone,
    seats: row.seats,
    status: row.status,
    guestName: row.guest_name,
    currentOrderId: row.current_order_id,
    seatedAt: row.seated_at,
  };
}

/** Get all floors ordered by sort_order */
export function getAllFloors() {
  const db = getDb();
  return db.prepare('SELECT * FROM floors ORDER BY sort_order ASC').all();
}

/** Get all tables grouped by floor */
export function getTablesGroupedByFloor() {
  const db = getDb();
  const floors = db.prepare('SELECT * FROM floors ORDER BY sort_order ASC').all() as Array<{id: string; name: string; sort_order: number}>;
  const tables = db.prepare('SELECT * FROM tables ORDER BY name ASC').all() as Array<{id: string; name: string; floor_id: string; seats: number; status: string; current_bill_id: string; current_amount: number}>;
  
  return floors.map(floor => ({
    ...floor,
    tables: tables.filter(t => t.floor_id === floor.id)
  }));
}

/** Update table status */
export function updateTableStatus(tableId: string, status: string, billId?: string, amount?: number) {
  const db = getDb();
  db.prepare(`
    UPDATE tables SET status = ?, current_bill_id = ?, current_amount = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, billId || '', amount || 0, tableId);
}

/** Category DAO Functions */
export interface CategoryRecord {
  id: string;
  name: string;
  sort_order: number;
  visible: boolean;
  icon: string;
}

export function getAllCategories(): CategoryRecord[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    sort_order: r.sort_order,
    visible: r.visible === 1,
    icon: r.icon || '🍽️',
  }));
}

export function saveCategory(cat: { id?: string; name: string; sort_order?: number; visible?: boolean; icon?: string }): CategoryRecord {
  const db = getDb();
  const id = cat.id || cat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const sortOrder = cat.sort_order ?? 0;
  const visible = cat.visible !== false ? 1 : 0;
  const icon = cat.icon || '🍽️';

  db.prepare(`
    INSERT INTO categories (id, name, sort_order, visible, icon)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      sort_order = excluded.sort_order,
      visible = excluded.visible,
      icon = excluded.icon
  `).run(id, cat.name, sortOrder, visible, icon);

  return { id, name: cat.name, sort_order: sortOrder, visible: visible === 1, icon };
}

export function updateCategoryVisibility(id: string, visible: boolean): boolean {
  const db = getDb();
  const res = db.prepare('UPDATE categories SET visible = ? WHERE id = ?').run(visible ? 1 : 0, id);
  return res.changes > 0;
}

export function deleteCategory(id: string): boolean {
  const db = getDb();
  const res = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return res.changes > 0;
}

/** Get current active shift */
export function getActiveShift() {
  const db = getDb();
  return db.prepare("SELECT * FROM shifts WHERE status = 'open' ORDER BY opened_at DESC LIMIT 1").get();
}

/** Open shift */
export function openShift(cashierName: string, openingCash: number) {
  const db = getDb();
  const id = `shift-${Date.now().toString().slice(-6)}`;
  db.prepare(`
    INSERT INTO shifts (id, cashier_name, opened_at, opening_cash, status)
    VALUES (?, ?, CURRENT_TIMESTAMP, ?, 'open')
  `).run(id, cashierName, openingCash);
  return id;
}

/** Close shift */
export function closeShift(id: string, closingCash: number, expectedCash: number, totalSales: number, notes?: string) {
  const db = getDb();
  db.prepare(`
    UPDATE shifts SET closed_at = CURRENT_TIMESTAMP, closing_cash = ?, expected_cash = ?, total_sales = ?, status = 'closed', notes = ?
    WHERE id = ?
  `).run(closingCash, expectedCash, totalSales, notes || '', id);
}


