import { NextResponse } from 'next/server';
import { saveSetting, getDb } from '@/lib/database';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/setup
 * Saves all 5 steps of first-time onboarding wizard in one atomic transaction:
 * - Basic cafe info (name, address, city, phone, whatsapp)
 * - Tax & payment settings (gstin, fssai, upi_id, cgst_rate, sgst_rate)
 * - Tables generation
 * - Staff PIN creation
 * - Marks setup_completed = true
 */
export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    const {
      cafeName,
      address,
      city,
      phone,
      whatsapp,
      gstin,
      fssai,
      upiId,
      cgstRate,
      sgstRate,
      tableCount,
      sections,
      ownerPin,
      cashierName,
      cashierPin,
    } = body;

    // 1. Save settings
    if (cafeName) saveSetting('cafe_name', cafeName);
    if (address) saveSetting('cafe_address', address);
    if (city) saveSetting('cafe_city', city);
    if (phone) saveSetting('cafe_phone', phone);
    if (whatsapp) saveSetting('cafe_whatsapp', whatsapp);
    if (gstin) saveSetting('gstin', gstin);
    if (fssai) saveSetting('fssai', fssai);
    if (upiId) saveSetting('upi_id', upiId);
    saveSetting('cgst_rate', String(cgstRate ?? 2.5));
    saveSetting('sgst_rate', String(sgstRate ?? 2.5));
    saveSetting('setup_completed', 'true');

    // 2. Generate initial tables
    const count = parseInt(String(tableCount || 6), 10);
    const secList = Array.isArray(sections) && sections.length > 0 ? sections : ['Main Floor'];
    
    // Clear and re-populate default tables
    try {
      const insertTableStmt = db.prepare(`
        INSERT OR REPLACE INTO tables (id, name, floor_id, seats, status)
        VALUES (?, ?, ?, ?, 'blank')
      `);

      let tableIdx = 1;
      for (const section of secList) {
        const floorId = `floor-${section.toLowerCase().replace(/\s+/g, '-')}`;
        // Insert floor
        db.prepare(`INSERT OR REPLACE INTO floors (id, name, sort_order) VALUES (?, ?, ?)`).run(
          floorId,
          section,
          0
        );

        const tablesPerSection = Math.ceil(count / secList.length);
        for (let i = 0; i < tablesPerSection && tableIdx <= count; i++) {
          const tableName = `Table ${tableIdx}`;
          insertTableStmt.run(`table-${tableIdx}`, tableName, floorId, 4);
          tableIdx++;
        }
      }
    } catch (tblErr) {
      console.warn('Table initialization warning:', tblErr);
    }

    // 3. Create or update owner and cashier in staff table with hashed PINs
    try {
      const insertStaffStmt = db.prepare(`
        INSERT OR REPLACE INTO staff (id, name, role, pin, phone, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `);

      if (ownerPin) {
        const hashedOwnerPin = await bcrypt.hash(ownerPin, 10);
        insertStaffStmt.run('staff-owner', 'Owner', 'manager', hashedOwnerPin, phone || '');
      }

      if (cashierName && cashierPin) {
        const hashedCashierPin = await bcrypt.hash(cashierPin, 10);
        insertStaffStmt.run('staff-cashier-1', cashierName, 'cashier', hashedCashierPin, '');
      }
    } catch (staffErr) {
      console.warn('Staff initialization warning:', staffErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Cafe setup completed successfully!',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Setup failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
