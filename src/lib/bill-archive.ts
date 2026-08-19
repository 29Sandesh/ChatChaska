import zlib from 'zlib';
import fs from 'fs';
import path from 'path';
import { getAllBills } from '@/lib/database';
import { Bill } from '@/types';

/**
 * Compresses daily bills to a minimal JSON payload and saves it using gzip (.json.gz).
 * Provides ~90% compression compared to raw text.
 */
export function archiveDailyBills(targetDateStr?: string): {
  success: boolean;
  filePath: string;
  billCount: number;
  originalBytes: number;
  compressedBytes: number;
  compressionRatio: string;
} {
  const archiveDir = path.join(process.cwd(), 'reports_archive');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const todayStr = targetDateStr || new Date().toISOString().split('T')[0];
  const allBills = getAllBills();
  const dailyBills = allBills.filter((b) => b.createdAt.startsWith(todayStr));

  // Build compact bill schema for storage efficiency
  const compactPayload = {
    date: todayStr,
    archivedAt: new Date().toISOString(),
    totalBills: dailyBills.length,
    bills: dailyBills.map((b: Bill) => ({
      id: b.id,
      token: b.tokenNumber,
      tbl: b.tableNumber,
      wtr: b.waiterName,
      cust: b.customerPhone ? `${b.customerName || ''}:${b.customerPhone}` : undefined,
      items: b.items.map((i) => ({
        n: i.name,
        q: i.quantity,
        p: i.unitPrice,
        t: i.lineTotal,
      })),
      sub: b.subtotal,
      disc: b.discountAmount,
      tax: b.gstAmount,
      tot: b.grandTotal,
      mode: b.paymentMode,
      ts: b.createdAt,
    })),
  };

  const rawJson = JSON.stringify(compactPayload);
  const originalBytes = Buffer.byteLength(rawJson, 'utf8');

  // Gzip compress
  const compressedBuffer = zlib.gzipSync(rawJson, { level: 9 });
  const compressedBytes = compressedBuffer.length;

  const fileName = `EOD_Bills_${todayStr}.json.gz`;
  const filePath = path.join(archiveDir, fileName);
  fs.writeFileSync(filePath, compressedBuffer);

  const ratio = originalBytes > 0 
    ? `${((1 - compressedBytes / originalBytes) * 100).toFixed(1)}%` 
    : '0%';

  return {
    success: true,
    filePath,
    billCount: dailyBills.length,
    originalBytes,
    compressedBytes,
    compressionRatio: ratio,
  };
}

/**
 * Reads and decompresses an archived date's bills.
 */
export function readArchivedDailyBills(dateStr: string): any | null {
  const filePath = path.join(process.cwd(), 'reports_archive', `EOD_Bills_${dateStr}.json.gz`);
  if (!fs.existsSync(filePath)) return null;

  const compressedData = fs.readFileSync(filePath);
  const decompressedJson = zlib.gunzipSync(compressedData).toString('utf8');
  return JSON.parse(decompressedJson);
}
