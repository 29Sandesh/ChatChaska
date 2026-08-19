import fs from 'fs';
import path from 'path';
import { getDbPath } from './database';

export function getBackupDirectory(): string {
  const dbPath = getDbPath();
  const dbDir = path.dirname(dbPath);
  const backupDir = path.join(dbDir, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

export async function createDatabaseBackup(): Promise<{ fileName: string; filePath: string; sizeBytes: number }> {
  const backupDir = getBackupDirectory();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `chatchaska_backup_${timestamp}.sqlite`;
  const filePath = path.join(backupDir, fileName);

  const { getDb } = await import('./database');
  const db = getDb();
  await db.backup(filePath);
  
  const stats = fs.statSync(filePath);

  return {
    fileName,
    filePath,
    sizeBytes: stats.size,
  };
}

export function listDatabaseBackups(): Array<{ fileName: string; createdAt: string; sizeKb: number }> {
  const backupDir = getBackupDirectory();
  const files = fs.readdirSync(backupDir);

  return files
    .filter((f) => f.endsWith('.sqlite'))
    .map((fileName) => {
      const filePath = path.join(backupDir, fileName);
      const stats = fs.statSync(filePath);
      return {
        fileName,
        createdAt: stats.mtime.toISOString(),
        sizeKb: Math.round(stats.size / 1024),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
