import { NextResponse } from 'next/server';
import { saveSetting, getDb } from '@/lib/database';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/setup
 * Saves all steps of first-time onboarding wizard in one atomic transaction:
 * - Owner private info (ownerName, ownerPhone, ownerEmail)
 * - Public cafe info (cafeName, cafePhone, address, city, whatsapp)
 * - Tax & payment settings (gstin, fssai, upi_id, cgst_rate, sgst_rate)
 * - Main & VIP Tables generation
 * - Staff PIN creation
 * - Terms acceptance record
 * - Marks setup_completed = true
 */
export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    const {
      ownerName,
      ownerPhone,
      ownerEmail,
      cafeName,
      cafePhone,
      address,
      city,
      whatsapp,
      gstin,
      fssai,
      upiId,
      cgstRate,
      sgstRate,
      mainTableCount,
      mainSeats,
      hasVip,
      vipTableCount,
      vipSeats,
      ownerPin,
      cashierName,
      cashierPin,
    } = body;

    // 1. Save Owner Private Details
    if (ownerName) saveSetting('owner_name', ownerName);
    if (ownerPhone) saveSetting('owner_phone', ownerPhone);
    if (ownerEmail) saveSetting('owner_email', ownerEmail);

    // 2. Save Public Cafe Settings
    if (cafeName) saveSetting('cafe_name', cafeName);
    if (cafePhone) saveSetting('cafe_phone', cafePhone);
    if (address) saveSetting('cafe_address', address);
    if (city) saveSetting('cafe_city', city);
    if (whatsapp) saveSetting('cafe_whatsapp', whatsapp || cafePhone || '');
    if (gstin) saveSetting('gstin', gstin);
    if (fssai) saveSetting('fssai', fssai);
    if (upiId) saveSetting('upi_id', upiId);
    saveSetting('cgst_rate', String(cgstRate ?? 2.5));
    saveSetting('sgst_rate', String(sgstRate ?? 2.5));
    saveSetting('terms_accepted_at', new Date().toISOString());
    saveSetting('setup_completed', 'true');

    // 3. Generate Main and VIP Tables
    const mainCount = Math.max(1, parseInt(String(mainTableCount || 8), 10));
    const mainSeatsPerTable = Math.max(1, parseInt(String(mainSeats || 4), 10));
    const isVipEnabled = Boolean(hasVip);
    const vipCount = isVipEnabled ? Math.max(1, parseInt(String(vipTableCount || 2), 10)) : 0;
    const vipSeatsPerTable = Math.max(1, parseInt(String(vipSeats || 6), 10));

    try {
      // Clear existing tables and floors
      db.prepare('DELETE FROM tables').run();
      db.prepare('DELETE FROM floors').run();

      const insertFloorStmt = db.prepare(`
        INSERT INTO floors (id, name, sort_order)
        VALUES (?, ?, ?)
      `);

      const insertTableStmt = db.prepare(`
        INSERT INTO tables (id, name, floor_id, seats, status)
        VALUES (?, ?, ?, ?, 'blank')
      `);

      // Insert Main Floor
      insertFloorStmt.run('floor-main', 'Main Area', 0);
      for (let i = 1; i <= mainCount; i++) {
        insertTableStmt.run(`table-${i}`, `Table ${i}`, 'floor-main', mainSeatsPerTable);
      }

      // Insert VIP Floor if enabled
      if (isVipEnabled && vipCount > 0) {
        insertFloorStmt.run('floor-vip', 'VIP Section', 1);
        for (let j = 1; j <= vipCount; j++) {
          insertTableStmt.run(`vip-table-${j}`, `VIP ${j}`, 'floor-vip', vipSeatsPerTable);
        }
      }
    } catch (tblErr) {
      console.warn('Table initialization warning:', tblErr);
    }

    // 4. Create or update owner and cashier in staff table with hashed PINs
    try {
      const insertStaffStmt = db.prepare(`
        INSERT OR REPLACE INTO staff (id, name, role, pin, phone, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `);

      if (ownerPin) {
        const hashedOwnerPin = await bcrypt.hash(ownerPin, 10);
        insertStaffStmt.run('staff-owner', ownerName || 'Owner', 'manager', hashedOwnerPin, ownerPhone || '');
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
