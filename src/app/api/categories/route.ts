import { NextResponse } from 'next/server';
import { getAllCategories, saveCategory, deleteCategory } from '@/lib/database';

export async function GET() {
  try {
    const categories = getAllCategories();
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, icon, sort_order, visible, id } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const saved = saveCategory({
      id,
      name: name.trim(),
      icon: icon || '🍽️',
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
      visible: visible !== false,
    });

    return NextResponse.json({ success: true, category: saved });
  } catch (error: any) {
    console.error('Error saving category:', error);
    return NextResponse.json({ error: error.message || 'Failed to save category' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const deleted = deleteCategory(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
