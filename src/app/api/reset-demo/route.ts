import { NextResponse } from 'next/server';
import { resetAndSeedIndianDatabase } from '@/lib/database';
import { isSuperAdmin } from '@/lib/auth';

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  const isSuper = await isSuperAdmin();
  if (!isSuper) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = resetAndSeedIndianDatabase();
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Database reset failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  const isSuper = await isSuperAdmin();
  if (!isSuper) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = resetAndSeedIndianDatabase();
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Database reset failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
