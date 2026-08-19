import { NextResponse } from 'next/server';
import { getAllMenuItems, saveMenuItem, deleteMenuItem } from '@/lib/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const items = getAllMenuItems(category);
    return NextResponse.json({ items });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch menu items';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.category || body.price == null) {
      return NextResponse.json({ error: 'Name, category, and price are required' }, { status: 400 });
    }

    const saved = saveMenuItem(body);
    return NextResponse.json({ success: true, item: saved }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save menu item';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Item id is required' }, { status: 400 });
    }

    const saved = saveMenuItem(body);
    return NextResponse.json({ success: true, item: saved });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update menu item';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Item id is required' }, { status: 400 });
    }

    const deleted = deleteMenuItem(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Item not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu item';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

