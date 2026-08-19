import { NextResponse } from 'next/server';
import { getAllBills, getSetting } from '@/lib/database';
import { archiveDailyBills } from '@/lib/bill-archive';

export async function POST() {
  try {
    const bills = getAllBills();
    const ownerEmail = getSetting('owner_email') || 'owner@chatchaska.com';
    const ownerPhone = getSetting('owner_phone') || '9876543210';

    const todayStr = new Date().toISOString().split('T')[0];

    // Filter today's bills
    const todayBills = bills.filter((b: any) => {
      const bDate = b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : todayStr;
      return bDate === todayStr;
    });

    const totalRevenue = todayBills.reduce((acc: number, b: any) => acc + (b.grandTotal || 0), 0);
    const totalBills = todayBills.length;
    const cashTotal = todayBills
      .filter((b: any) => (b.paymentMode || '').toLowerCase() === 'cash')
      .reduce((acc: number, b: any) => acc + (b.grandTotal || 0), 0);
    const upiTotal = todayBills
      .filter((b: any) => (b.paymentMode || '').toLowerCase() === 'upi')
      .reduce((acc: number, b: any) => acc + (b.grandTotal || 0), 0);
    const cardTotal = Math.max(0, totalRevenue - cashTotal - upiTotal);

    // Create compressed gzip archive on disk
    const archiveResult = archiveDailyBills(todayStr);

    const summary = {
      totalRevenue,
      totalBillsCount: totalBills,
      cashTotal,
      upiTotal,
      cardTotal,
      ownerEmail,
      ownerPhone,
      compressedFilePath: archiveResult.filePath,
      compressedSize: `${(archiveResult.compressedBytes / 1024).toFixed(1)} KB`,
      compressionRatio: archiveResult.compressionRatio,
    };

    return NextResponse.json({
      success: true,
      message: `Daily EOD Sales Report archived with ${archiveResult.compressionRatio} compression!`,
      path: archiveResult.filePath,
      summary,
    });
  } catch (error) {
    console.error('Error generating daily EOD report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate EOD report' },
      { status: 500 }
    );
  }
}


export async function GET() {
  return POST();
}
