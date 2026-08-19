import { cookies } from 'next/headers';
import crypto from 'crypto';

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
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_fallback_secret_must_be_long_enough_for_hmac';

// ============================================================
// Session Management
// ============================================================

export function signToken(payload: any): string {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadBase64);
  const signature = hmac.digest('hex');
  return `${payloadBase64}.${signature}`;
}

export function verifyToken(token: string): any {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadBase64, signature] = parts;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadBase64);
  const expectedSignature = hmac.digest('hex');
  
  if (signature.length !== expectedSignature.length) {
    return null;
  }

  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    try {
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
      if (payload.expiresAt && Date.now() > payload.expiresAt) {
        return null; // Expired
      }
      return payload;
    } catch {
      return null;
    }
  }
  return null;
}

export async function createSession(user: SessionUser): Promise<void> {
  const isOwner = user.role === 'super_admin' || user.role === 'cafe_owner';
  const maxAgeSeconds = isOwner ? 24 * 60 * 60 : 8 * 60 * 60;

  const session: AuthSession = {
    user,
    expiresAt: Date.now() + maxAgeSeconds * 1000,
  };

  const sessionData = signToken(session);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: maxAgeSeconds,
    path: '/',
  });
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const session = verifyToken(sessionCookie.value);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(...allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw { status: 401, message: 'Authentication required. Please log in.' };
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    throw { status: 401, message: 'Unauthorized' };
  }
  return user;
}

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

export async function requireCafe(cafeId: string): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw { status: 401, message: 'Authentication required. Please log in.' };
  }

  if (user.role === 'super_admin') {
    return user;
  }

  if (user.cafeId !== cafeId) {
    throw { status: 403, message: 'You do not have access to this cafe.' };
  }

  return user;
}

export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'super_admin';
}

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
