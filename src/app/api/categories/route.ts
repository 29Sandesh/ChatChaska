import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/database';

export async function GET() {
  try {
    const categories = getAllCategories();
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

