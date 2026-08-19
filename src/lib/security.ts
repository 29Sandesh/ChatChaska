import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt with 12 salt rounds.
 * Used for cafe owner email/password authentication.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Hash a 4-digit staff PIN using bcrypt.
 * PINs are never stored in plaintext.
 */
export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }
  return bcrypt.hash(pin, SALT_ROUNDS);
}

/**
 * Verify a 4-digit PIN against a bcrypt hash.
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Sanitize user input to prevent XSS attacks.
 * Escapes HTML special characters.
 */
export function sanitizeInput(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ============================================================
// In-Memory Rate Limiter
// ============================================================

interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if a key (e.g., IP + action) is rate limited.
 * Returns { allowed, retryAfterMs }
 *
 * @param key - Unique identifier (e.g., "login:192.168.1.1")
 * @param maxAttempts - Max attempts before lockout (default: 5)
 * @param windowMs - Time window in ms (default: 15 minutes)
 * @param lockoutMs - Lockout duration in ms (default: 30 minutes)
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
  lockoutMs = 30 * 60 * 1000
): { allowed: boolean; retryAfterMs: number; remainingAttempts: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No previous attempts
  if (!entry) {
    rateLimitStore.set(key, { attempts: 1, firstAttemptAt: now, lockedUntil: null });
    return { allowed: true, retryAfterMs: 0, remainingAttempts: maxAttempts - 1 };
  }

  // Currently locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, retryAfterMs: entry.lockedUntil - now, remainingAttempts: 0 };
  }

  // Window expired — reset
  if (now - entry.firstAttemptAt > windowMs) {
    rateLimitStore.set(key, { attempts: 1, firstAttemptAt: now, lockedUntil: null });
    return { allowed: true, retryAfterMs: 0, remainingAttempts: maxAttempts - 1 };
  }

  // Within window — increment
  entry.attempts += 1;

  if (entry.attempts > maxAttempts) {
    entry.lockedUntil = now + lockoutMs;
    rateLimitStore.set(key, entry);
    return { allowed: false, retryAfterMs: lockoutMs, remainingAttempts: 0 };
  }

  rateLimitStore.set(key, entry);
  return { allowed: true, retryAfterMs: 0, remainingAttempts: maxAttempts - entry.attempts };
}

/**
 * Reset rate limit for a key (e.g., after successful login).
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// ============================================================
// Audit Logging
// ============================================================

export interface AuditEvent {
  userId?: string;
  cafeId?: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log an audit event. Currently logs to console + local array.
 * When Supabase is connected, this will write to the audit_log table.
 */
export function logAuditEvent(event: AuditEvent): void {
  const entry = {
    id: crypto.randomUUID(),
    ...event,
    createdAt: new Date().toISOString(),
  };

  // Console log for dev
  console.log(`[AUDIT] ${event.action}`, JSON.stringify(entry));

  // TODO: When Supabase is connected, upsert to audit_log table
  // supabaseAdmin.from('audit_log').insert(entry);
}
