import { NextResponse } from 'next/server';
import { resetAndSeedIndianDatabase } from '@/lib/database';

export async function POST() {
  try {
    const result = resetAndSeedIndianDatabase();
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Database reset failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = resetAndSeedIndianDatabase();
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Database reset failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
