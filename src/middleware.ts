import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ChatChaska Route Protection Middleware
 *
 * Enforces authentication and role-based access control on all routes.
 * Reads the session cookie and redirects unauthorized users.
 *
 * Route protection matrix:
 *   /admin/*       → requires role: cafe_owner OR super_admin
 *   /staff/*       → requires role: cashier | waiter | kitchen | cafe_owner | super_admin
 *   /dashboard/*   → requires any authenticated user
 *   /api/*         → requires valid session (except /api/auth/*)
 *   /login         → public (redirect if already logged in)
 *   /signup        → public
 */

const SESSION_COOKIE_NAME = 'chatchaska_session';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/auth/reset-password',
  '/api/cafe-config',
  '/api/health',
  '/menu',
  '/explore',
  '/my-orders',
  '/my-profile',
  '/bill',
];

const PUBLIC_PREFIXES = [
  '/api/auth/',
  '/api/public/',
  '/api/otp/',
  '/menu/',
  '/cafe/',
  '/bill/',
  '/_next/',
  '/favicon',
  '/chaska',
  '/manifest.json',
  '/icon.png',
  '/sounds/',
];

interface SessionPayload {
  user: {
    id: string;
    role: string;
    cafeId?: string;
  };
  expiresAt: number;
}

function parseSession(cookieValue: string): SessionPayload | null {
  try {
    // Handle both signed token format (payload.signature) and legacy base64
    const rawPayload = cookieValue.includes('.') ? cookieValue.split('.')[0] : cookieValue;
    const decoded = Buffer.from(rawPayload, 'base64').toString('utf-8');
    const session: SessionPayload = JSON.parse(decoded);

    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null; // Expired
    }

    return session;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // Allow root redirect (page.tsx redirects to /login)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Get session from cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = sessionCookie ? parseSession(sessionCookie.value) : null;

  // No valid session → redirect to login (for pages) or 401 (for API)
  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = session.user.role;

  // ── Admin Routes (Cafe Owner Panel) ─────────────────────
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'cafe_owner' && userRole !== 'super_admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Cafe Owner access required', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ── Staff Routes ────────────────────────────────────────
  if (pathname.startsWith('/staff')) {
    const staffRoles = ['cashier', 'waiter', 'kitchen', 'cafe_owner', 'super_admin'];
    if (!staffRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ── Customer Profile & Orders Check ────────────────────────
  if (pathname.startsWith('/my-orders') || pathname.startsWith('/my-profile')) {
    const customerSession = request.cookies.get('chatchaska_customer_session');
    if (!customerSession && !session) {
      const loginUrl = new URL('/explore', request.url);
      loginUrl.searchParams.set('auth', 'required');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Session is valid — proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icon.png
     * - public folder files (logos, manifest)
     */
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
};
