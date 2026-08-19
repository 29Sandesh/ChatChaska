import { getDb } from '@/lib/database';
import { Bill, MenuItem } from '@/types';
import { cloudAdminClient, isCloudConfigured } from '@/lib/cloud-db';

/**
 * ChatChaska Offline-to-Cloud Sync Engine
 *
 * Automatically captures local POS events (bills generated, menu items updated)
 * in the SQLite `offline_queue` table and syncs them to Supabase cloud storage
 * when network connectivity is available.
 */

export interface QueueItem {
  id: number;
  action: string;
  payload_json: string;
  created_at: string;
  synced: number;
}

/**
 * Push an action into the local SQLite sync queue.
 */
export function queueOfflineAction(action: string, payload: unknown): number {
  try {
    const db = getDb();
    const stmt = db.prepare('INSERT INTO offline_queue (action, payload_json, synced) VALUES (?, ?, 0)');
    const result = stmt.run(action, JSON.stringify(payload));
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error('[Sync Queue Error]: Failed to enqueue offline action', error);
    return -1;
  }
}

/**
 * Retrieve unsynced items from SQLite offline queue.
 */
export function getPendingQueue(limit = 50): QueueItem[] {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM offline_queue WHERE synced = 0 ORDER BY id ASC LIMIT ?').all(limit) as QueueItem[];
  } catch (error) {
    console.error('[Sync Queue Error]: Failed to fetch pending items', error);
    return [];
  }
}

/**
 * Get sync queue health statistics.
 */
export function getSyncStatus(): { pending: number; synced: number } {
  try {
    const db = getDb();
    const pendingRow = db.prepare('SELECT COUNT(*) as count FROM offline_queue WHERE synced = 0').get() as { count: number };
    const syncedRow = db.prepare('SELECT COUNT(*) as count FROM offline_queue WHERE synced = 1').get() as { count: number };
    return {
      pending: pendingRow?.count || 0,
      synced: syncedRow?.count || 0,
    };
  } catch {
    return { pending: 0, synced: 0 };
  }
}

/**
 * Mark an offline queue item as synced.
 */
export function markItemSynced(id: number): void {
  try {
    const db = getDb();
    db.prepare('UPDATE offline_queue SET synced = 1 WHERE id = ?').run(id);
  } catch (error) {
    console.error('[Sync Queue Error]: Failed to mark item synced', error);
  }
}

/**
 * Queue a new bill to sync to cloud.
 */
export function syncBillToCloud(bill: Bill, cafeId = 'demo'): void {
  queueOfflineAction('SYNC_BILL', {
    cafeId,
    bill,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Queue a menu item update to sync to cloud.
 */
export function syncMenuItemToCloud(item: MenuItem, cafeId = 'demo'): void {
  queueOfflineAction('SYNC_MENU_ITEM', {
    cafeId,
    item,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Process the pending offline queue by dispatching records to Supabase.
 */
export async function processSyncQueue(): Promise<{ processed: number; failed: number }> {
  const pending = getPendingQueue(25);
  if (pending.length === 0) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const payload = JSON.parse(item.payload_json);

      if (isCloudConfigured()) {
        if (item.action === 'SYNC_BILL') {
          const { bill, cafeId } = payload;
          const targetCafeId = cafeId && cafeId !== 'demo' ? cafeId : '00000000-0000-0000-0000-000000000001';

          // Insert or update in cloud_orders / cloud_bills
          await cloudAdminClient.from('cloud_orders').upsert({
            id: bill.id || `bill-${Date.now()}`,
            cafe_id: targetCafeId,
            order_number: bill.id || `ORD-${Date.now().toString().slice(-4)}`,
            table_number: bill.tableNumber || 'Table 1',
            status: 'completed',
            subtotal: bill.subtotal || 0,
            gst_amount: (bill.cgstAmount || 0) + (bill.sgstAmount || 0),
            total_amount: bill.grandTotal || 0,
            customer_phone: bill.customerPhone || undefined,
            customer_name: bill.customerName || undefined,
            items: bill.items || [],
          });
        } else if (item.action === 'SYNC_MENU_ITEM') {
          const { item: menuItem, cafeId } = payload;
          const targetCafeId = cafeId && cafeId !== 'demo' ? cafeId : '00000000-0000-0000-0000-000000000001';

          await cloudAdminClient.from('cloud_menu_items').upsert({
            id: menuItem.id,
            cafe_id: targetCafeId,
            name: menuItem.name,
            category: menuItem.category,
            price: menuItem.price,
            is_available: menuItem.available !== false,
            is_veg: menuItem.veg !== false,
            description: menuItem.description || '',
          });
        }
      }

      // Mark locally as successfully synced
      markItemSynced(item.id);
      processed += 1;
    } catch (err) {
      console.warn(`[Sync Engine] Failed to sync queue item ${item.id}:`, err);
      failed += 1;
    }
  }

  return { processed, failed };
}
