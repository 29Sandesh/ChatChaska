import { NextResponse } from 'next/server';
import { getDb, getAllCategories, saveCategory } from '@/lib/database';
import { autoCategorizeMenuItem, PREDEFINED_CATEGORIES } from '@/lib/categorizer';

/**
 * POST /api/ai/auto-categorize
 * Scans all menu items in the database and automatically assigns them to their
 * optimal predefined category based on keywords and menu structure.
 */
export async function POST(req: Request) {
  try {
    const db = getDb();

    // 1. Ensure all predefined categories exist
    const existingCats = getAllCategories();
    const existingCatIds = new Set(existingCats.map((c) => c.id));

    for (const [catId, meta] of Object.entries(PREDEFINED_CATEGORIES)) {
      if (!existingCatIds.has(catId)) {
        saveCategory({
          id: catId,
          name: meta.name,
          icon: meta.icon,
          sort_order: meta.order,
          visible: true,
        });
        existingCatIds.add(catId);
      }
    }

    // 2. Fetch all menu items
    const items = db.prepare('SELECT id, name, category, description FROM menu_items').all() as {
      id: string;
      name: string;
      category: string;
      description?: string;
    }[];

    const updateStmt = db.prepare('UPDATE menu_items SET category = ? WHERE id = ?');
    let updatedCount = 0;
    const categoryCounts: Record<string, number> = {};

    const categorizedList = db.transaction(() => {
      for (const item of items) {
        const targetCategory = autoCategorizeMenuItem(item.name, item.description, item.category);
        categoryCounts[targetCategory] = (categoryCounts[targetCategory] || 0) + 1;

        if (item.category !== targetCategory) {
          updateStmt.run(targetCategory, item.id);
          updatedCount++;
        }
      }
      return items.length;
    })();

    return NextResponse.json({
      success: true,
      totalItems: categorizedList,
      updatedCount,
      categoryBreakdown: categoryCounts,
      message: `Successfully organized ${categorizedList} dishes into predefined categories! (${updatedCount} re-assigned)`,
    });
  } catch (error) {
    console.error('Auto-categorize error:', error);
    const msg = error instanceof Error ? error.message : 'Auto-categorization failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
