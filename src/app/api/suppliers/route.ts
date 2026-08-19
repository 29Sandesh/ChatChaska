import { NextResponse } from 'next/server';
import { getAllSuppliers, saveSupplier, getAllPurchaseOrders, savePurchaseOrder } from '@/lib/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'po') {
      const purchaseOrders = getAllPurchaseOrders();
      return NextResponse.json({ purchaseOrders });
    }

    const suppliers = getAllSuppliers();
    return NextResponse.json({ suppliers });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch suppliers';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const body = await req.json();

    if (type === 'po') {
      if (!body.supplierId || !body.items) {
        return NextResponse.json({ error: 'Supplier ID and items are required' }, { status: 400 });
      }
      const po = savePurchaseOrder(body);
      return NextResponse.json({ success: true, purchaseOrder: po }, { status: 201 });
    }

    if (!body.name) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 });
    }

    const supplier = saveSupplier(body);
    return NextResponse.json({ success: true, supplier }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save supplier data';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
