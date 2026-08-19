import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCurrentUser, type SessionUser, type UserRole } from '@/lib/auth';
import { logAuditEvent } from '@/lib/security';

/**
 * Reusable API route guard. Wraps an API handler with authentication
 * and role-based authorization.
 *
 * Usage:
 * ```ts
 * import { withAuth } from '@/lib/api-guard';
 *
 * export const GET = withAuth(['cafe_owner', 'super_admin'], async (req, user) => {
 *   // user is guaranteed to be authenticated with the right role
 *   return NextResponse.json({ data: 'secret' });
 * });
 * ```
 */
export function withAuth(
  allowedRoles: UserRole[],
  handler: (req: NextRequest, user: SessionUser) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required. Please log in.', code: 'UNAUTHENTICATED' },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(user.role)) {
        logAuditEvent({
          userId: user.id,
          cafeId: user.cafeId,
          action: 'unauthorized_access_attempt',
          details: {
            path: req.nextUrl.pathname,
            requiredRoles: allowedRoles,
            actualRole: user.role,
          },
        });

        return NextResponse.json(
          { error: `Access denied. Required role: ${allowedRoles.join(' or ')}`, code: 'FORBIDDEN' },
          { status: 403 }
        );
      }

      return handler(req, user);
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      const status = err?.status || 500;
      const message = err?.message || 'Internal server error';
      return NextResponse.json({ error: message }, { status });
    }
  };
}

/**
 * Lighter guard: just requires any authenticated user.
 */
export function withAnyAuth(
  handler: (req: NextRequest, user: SessionUser) => Promise<NextResponse>
) {
  return withAuth(
    ['super_admin', 'cafe_owner', 'cashier', 'waiter', 'kitchen'],
    handler
  );
}

/**
 * Guard for Super Admin only routes.
 */
export function withSuperAdmin(
  handler: (req: NextRequest, user: SessionUser) => Promise<NextResponse>
) {
  return withAuth(['super_admin'], handler);
}
