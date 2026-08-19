import { NextResponse } from 'next/server';
import { getPublicCafeConfig } from '@/lib/cafe-config';

/**
 * GET /api/cafe-config
 * Returns the current cafe's configuration for frontend components.
 * This replaces all hardcoded cafe names, GST numbers, addresses, etc.
 */
export async function GET() {
  try {
    const config = getPublicCafeConfig();
    return NextResponse.json(config);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to load cafe config';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
