import { NextResponse } from 'next/server';
import { destroySession, getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/security';

/**
 * POST /api/auth/logout
 *
 * Destroys the current session and logs the event.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (user) {
      logAuditEvent({
        userId: user.id,
        cafeId: user.cafeId,
        action: 'logout',
        details: { name: user.name, role: user.role },
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      });
    }

    await destroySession();

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[Auth Logout Error]:', err);
    // Still destroy session even if logging fails
    try { await destroySession(); } catch { /* ignore */ }
    return NextResponse.json({ success: true, message: 'Logged out' });
  }
}
