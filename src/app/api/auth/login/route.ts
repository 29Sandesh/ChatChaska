import { NextResponse } from 'next/server';
import { createSession, type UserRole } from '@/lib/auth';
import { verifyPassword, verifyPin, checkRateLimit, resetRateLimit, logAuditEvent } from '@/lib/security';
import { getDb } from '@/lib/database';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/login
 *
 * Handles authentication for all user roles:
 * - Super Admin: email + password
 * - Cafe Owner: email + password
 * - Staff (Cashier/Waiter/Kitchen): cafeSlug + 4-digit PIN
 *
 * Request body:
 * { loginType: 'email' | 'pin', email?, password?, cafeSlug?, pin?, staffRole? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { loginType } = body;

    // Get IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    if (loginType === 'email') {
      return handleEmailLogin(body, ip);
    } else if (loginType === 'pin') {
      return handlePinLogin(body, ip);
    } else {
      return NextResponse.json({ error: 'Invalid login type' }, { status: 400 });
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('[Auth Login Error]:', err);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}

async function handleEmailLogin(
  body: { email?: string; password?: string },
  ip: string
) {
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // Rate limit check
  const rateLimitKey = `login:email:${email}`;
  const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000, 30 * 60 * 1000);
  if (!rateCheck.allowed) {
    const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000);
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${retryMinutes} minutes.` },
      { status: 429 }
    );
  }

  // Check for Super Admin (hardcoded in env for now)
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@chatchaska.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'ChatChaska@2026';

  if (email.toLowerCase() === superAdminEmail.toLowerCase()) {
    if (password === superAdminPassword) {
      resetRateLimit(rateLimitKey);

      await createSession({
        id: 'super-admin-001',
        email: superAdminEmail,
        name: 'Platform Admin',
        role: 'super_admin',
      });

      logAuditEvent({
        userId: 'super-admin-001',
        action: 'login',
        details: { method: 'email', role: 'super_admin' },
        ipAddress: ip,
      });

      return NextResponse.json({
        success: true,
        user: { name: 'Platform Admin', role: 'super_admin' },
        redirect: '/superadmin',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid password', remainingAttempts: rateCheck.remainingAttempts },
        { status: 401 }
      );
    }
  }

  // Check for Cafe Owner in local DB
  // For now, we use a simple staff lookup. When Supabase is connected,
  // this will query the platform_users table.
  const db = getDb();
  const owner = db.prepare(
    "SELECT * FROM staff WHERE LOWER(phone) = LOWER(?) AND role IN ('owner', 'manager', 'Owner', 'Manager') AND status = 'active'"
  ).get(email.toLowerCase()) as Record<string, string> | undefined;

  if (owner) {
    // For now, check PIN as password (will be replaced with bcrypt)
    if (owner.pin && password === owner.pin) {
      resetRateLimit(rateLimitKey);

      await createSession({
        id: owner.id,
        email: email,
        name: owner.name,
        role: 'cafe_owner' as UserRole,
        cafeId: 'demo',
        cafeName: 'ChatChaska Cafe',
      });

      logAuditEvent({
        userId: owner.id,
        action: 'login',
        details: { method: 'email', role: 'cafe_owner' },
        ipAddress: ip,
      });

      return NextResponse.json({
        success: true,
        user: { name: owner.name, role: 'cafe_owner' },
        redirect: '/admin',
      });
    }
  }

  return NextResponse.json(
    { error: 'Invalid email or password', remainingAttempts: rateCheck.remainingAttempts },
    { status: 401 }
  );
}

async function handlePinLogin(
  body: { pin?: string; staffRole?: string; cafeSlug?: string },
  ip: string
) {
  const { pin, staffRole } = body;

  if (!pin || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'A valid 4-digit PIN is required' }, { status: 400 });
  }

  // Rate limit check
  const rateLimitKey = `login:pin:${ip}`;
  const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!rateCheck.allowed) {
    const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000);
    return NextResponse.json(
      { error: `Too many PIN attempts. Try again in ${retryMinutes} minutes.` },
      { status: 429 }
    );
  }

  // Look up ALL active staff in local DB to compare hashed pins
  const db = getDb();
  const staffList = db.prepare(
    "SELECT * FROM staff WHERE status = 'active'"
  ).all() as Record<string, string>[];

  let matchedStaff: Record<string, string> | undefined = undefined;

  for (const s of staffList) {
    if (s.pin && s.pin.startsWith('$2')) {
      const isMatch = await bcrypt.compare(pin, s.pin);
      if (isMatch) {
        matchedStaff = s;
        break;
      }
    } else if (s.pin === pin) {
      matchedStaff = s;
      const hashedPin = await bcrypt.hash(pin, 10);
      db.prepare("UPDATE staff SET pin = ? WHERE id = ?").run(hashedPin, s.id);
      break;
    }
  }

  const staff = matchedStaff;

  if (!staff) {
    return NextResponse.json(
      { error: 'Invalid PIN. No active staff member found.', remainingAttempts: rateCheck.remainingAttempts },
      { status: 401 }
    );
  }

  resetRateLimit(rateLimitKey);

  // Map staff role to system role
  const roleStr = (staff.role || '').toLowerCase();
  let role: UserRole = 'cashier';
  let redirect = '/staff/pos';

  if (roleStr.includes('owner') || roleStr.includes('manager')) {
    role = 'cafe_owner';
    redirect = '/admin';
  } else if (roleStr.includes('waiter') || roleStr.includes('captain')) {
    role = staffRole === 'waiter' ? 'waiter' : 'waiter';
    redirect = '/staff/orders';
  } else if (roleStr.includes('kitchen') || roleStr.includes('chef')) {
    role = 'kitchen';
    redirect = '/staff/kitchen';
  } else {
    // Default to requested staffRole or cashier
    if (staffRole === 'waiter') {
      role = 'waiter';
      redirect = '/staff/orders';
    } else if (staffRole === 'kitchen') {
      role = 'kitchen';
      redirect = '/staff/kitchen';
    } else {
      role = 'cashier';
      redirect = '/staff/pos';
    }
  }

  await createSession({
    id: staff.id,
    name: staff.name,
    role,
    cafeId: 'demo',
    cafeName: 'ChatChaska Cafe',
  });

  logAuditEvent({
    userId: staff.id,
    action: 'login',
    details: { method: 'pin', role, staffName: staff.name },
    ipAddress: ip,
  });

  return NextResponse.json({
    success: true,
    user: { name: staff.name, role },
    redirect,
  });
}
