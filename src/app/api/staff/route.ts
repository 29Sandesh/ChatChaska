import { NextResponse } from 'next/server';
import { getAllStaff, saveStaff, deleteStaff } from '@/lib/database';
import { requireRole } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await requireRole('super_admin', 'cafe_owner');
    const staff = getAllStaff();
    const safeStaff = staff.map((s: any) => {
      const { pin, ...rest } = s;
      return rest;
    });
    return NextResponse.json({ staff: safeStaff });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireRole('super_admin', 'cafe_owner');
    const body = await req.json();
    const { name, role, pin, phone, id } = body;

    if (!name || !role || !pin) {
      return NextResponse.json({ error: 'Name, role, and 4-digit PIN are required' }, { status: 400 });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    const staffId = id || `staff-${Date.now().toString().slice(-4)}`;
    const saved = saveStaff({ id: staffId, name, role, pin: hashedPin, phone });
    
    const { pin: _pin, ...safeSaved } = saved;
    return NextResponse.json({ success: true, staff: safeSaved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireRole('super_admin', 'cafe_owner');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const deleted = deleteStaff(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
