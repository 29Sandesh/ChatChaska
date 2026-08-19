import { NextRequest, NextResponse } from 'next/server';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * POST /api/admin/menu-sync
 * Reads local menu items and categories and upserts into Supabase cloud_menu_items & cloud_categories
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cafeId = searchParams.get('cafe_id') || '00000000-0000-0000-0000-000000000001';

    // Fetch local categories and items via internal API
    const base = req.nextUrl.origin;
    const [menuRes, catRes] = await Promise.all([
      fetch(`${base}/api/menu-items`),
      fetch(`${base}/api/categories`),
    ]);

    const menuData = await menuRes.json();
    const catData = await catRes.json();

    const localCats = catData.categories || [];
    const localItems = menuData.items || [];

    // 1. Sync Categories to Cloud
    if (localCats.length > 0) {
      const cloudCatRecords = localCats.map((c: any) => ({
        cafe_id: cafeId,
        name: c.name,
        icon: c.icon || '🍽️',
        sort_order: c.sort_order || 0,
        visible: c.visible !== false,
      }));

      await cloudAdminClient
        .from('cloud_categories')
        .upsert(cloudCatRecords, { onConflict: 'cafe_id,name' });
    }

    // 2. Sync Menu Items to Cloud
    if (localItems.length > 0) {
      const cloudItemRecords = localItems.map((item: any) => ({
        id: item.id,
        cafe_id: cafeId,
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description || '',
        available: item.available !== false,
        veg: item.veg !== false,
        popular: item.popular === true,
        spicy: item.spicy === true,
        image: item.image || null,
      }));

      await cloudAdminClient
        .from('cloud_menu_items')
        .upsert(cloudItemRecords, { onConflict: 'id,cafe_id' });
    }

    return NextResponse.json({
      success: true,
      synced: {
        categories: localCats.length,
        items: localItems.length,
      },
    });
  } catch (error: any) {
    console.error('Error syncing menu to cloud:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
