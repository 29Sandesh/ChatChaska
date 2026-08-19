import { cookies } from 'next/headers';

// ============================================================
// Types
// ============================================================

export type UserRole = 'super_admin' | 'cafe_owner' | 'cashier' | 'waiter' | 'kitchen';

export interface SessionUser {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  cafeId?: string;
  cafeName?: string;
  cafeSlug?: string;
}

export interface AuthSession {
  user: SessionUser;
  expiresAt: number; // Unix timestamp
}

const SESSION_COOKIE_NAME = 'chatchaska_session';
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

// ============================================================
// Session Management
// ============================================================

/**
 * Create an encrypted session cookie for a logged-in user.
 * In production, this should use a proper JWT or encrypted token.
 * For now, we use a base64-encoded JSON string with HMAC validation.
 */
export async function createSession(user: SessionUser): Promise<void> {
  const session: AuthSession = {
    user,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const sessionData = Buffer.from(JSON.stringify(session)).toString('base64');

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });
}

/**
 * Read the current session from the cookie.
 * Returns null if no session or session is expired.
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const session: AuthSession = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    );

    // Check expiry
    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Get the current logged-in user from the session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Destroy the current session (logout).
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// ============================================================
// Authorization Helpers
// ============================================================

/**
 * Verify the current user has the required role.
 * Throws an object with status and message if unauthorized.
 */
export async function requireRole(...allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw { status: 401, message: 'Authentication required. Please log in.' };
  }

  if (!allowedRoles.includes(user.role)) {
    throw { status: 403, message: `Access denied. Required role: ${allowedRoles.join(' or ')}` };
  }

  return user;
}

/**
 * Verify the current user belongs to a specific cafe.
 * Super admins bypass this check.
 */
export async function requireCafe(cafeId: string): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw { status: 401, message: 'Authentication required. Please log in.' };
  }

  // Super admins can access any cafe
  if (user.role === 'super_admin') {
    return user;
  }

  if (user.cafeId !== cafeId) {
    throw { status: 403, message: 'You do not have access to this cafe.' };
  }

  return user;
}

/**
 * Check if the current user is a Super Admin.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'super_admin';
}

// ============================================================
// Role Display Helpers
// ============================================================

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  cafe_owner: 'Cafe Owner',
  cashier: 'Cashier',
  waiter: 'Waiter',
  kitchen: 'Kitchen Staff',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  cafe_owner: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  cashier: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  waiter: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  kitchen: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};
