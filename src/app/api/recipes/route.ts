import { NextResponse } from 'next/server';
import { getAllRecipes, saveRecipe } from '@/lib/database';

export async function GET() {
  try {
    const recipes = getAllRecipes();
    return NextResponse.json({ recipes });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch recipes';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.menuItemId || !body.menuItemName) {
      return NextResponse.json({ error: 'Menu item ID and name are required' }, { status: 400 });
    }

    const recipe = saveRecipe(body);
    return NextResponse.json({ success: true, recipe }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save recipe';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
