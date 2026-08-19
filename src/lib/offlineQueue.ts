import { getDb } from './database';

export interface OfflineAction {
  id?: number;
  action: string;
  payload: any;
  createdAt?: string;
  synced?: boolean;
}

export function queueOfflineAction(action: string, payload: any): void {
  try {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO offline_queue (action, payload_json)
      VALUES (?, ?)
    `);
    stmt.run(action, JSON.stringify(payload));
  } catch (error) {
    console.error('[OfflineQueue] Failed to queue offline action:', error);
  }
}

export function getUnsyncedActions(): OfflineAction[] {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM offline_queue WHERE synced = 0 ORDER BY created_at ASC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      action: r.action,
      payload: JSON.parse(r.payload_json),
      createdAt: r.created_at,
      synced: Boolean(r.synced),
    }));
  } catch (error) {
    console.error('[OfflineQueue] Failed to fetch unsynced actions:', error);
    return [];
  }
}

export function markActionSynced(id: number): void {
  try {
    const db = getDb();
    const stmt = db.prepare('UPDATE offline_queue SET synced = 1 WHERE id = ?');
    stmt.run(id);
  } catch (error) {
    console.error('[OfflineQueue] Failed to mark action as synced:', error);
  }
}
