import { NextResponse } from 'next/server';
import { getAllCustomers, saveCustomer } from '@/lib/database';

export async function GET() {
  try {
    const customers = getAllCustomers();
    return NextResponse.json({ customers });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch customers';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Customer name and phone are required' }, { status: 400 });
    }

    const customer = saveCustomer(body);
    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save customer';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
