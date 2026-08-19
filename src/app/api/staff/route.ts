import { NextResponse } from 'next/server';
import { getAllStaff, saveStaff, deleteStaff } from '@/lib/database';

export async function GET() {
  try {
    const staff = getAllStaff();
    return NextResponse.json({ staff });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, pin, phone, id } = body;

    if (!name || !role || !pin) {
      return NextResponse.json({ error: 'Name, role, and 4-digit PIN are required' }, { status: 400 });
    }

    const staffId = id || `staff-${Date.now().toString().slice(-4)}`;
    const saved = saveStaff({ id: staffId, name, role, pin, phone });

    return NextResponse.json({ success: true, staff: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

