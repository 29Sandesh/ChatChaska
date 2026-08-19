import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Production health check endpoint for monitoring and uptime checkers
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'ChatChaska POS & Discovery Platform',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
}
