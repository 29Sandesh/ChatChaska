import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignupSchema } from '@/lib/validators';
import { cloudAdminClient } from '@/lib/cloud-db';
import { saveSetting, getDb } from '@/lib/database';

/**
 * POST /api/auth/signup
 * Registers a new cafe owner, creates a cafe record in Supabase and local DB,
 * initializes trial subscription, and returns a session redirect.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parseResult = SignupSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Invalid registration details';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { cafeName, ownerName, email, phone, password } = parseResult.data;

    // 1. Generate clean URL slug from cafe name
    const baseSlug = cafeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const slug = `${baseSlug || 'cafe'}-${randomSuffix}`;

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save to local SQLite database settings
    saveSetting('cafe_name', cafeName);
    saveSetting('owner_name', ownerName);
    saveSetting('owner_email', email);
    saveSetting('cafe_phone', phone);
    saveSetting('cafe_slug', slug);
    saveSetting('setup_completed', 'false');

    // Also create owner in local staff table
    try {
      const db = getDb();
      const hashedPin = await bcrypt.hash('1234', 10);
      db.prepare(`
        INSERT OR REPLACE INTO staff (id, name, role, pin, phone, status)
        VALUES (?, ?, 'manager', ?, ?, 'active')
      `).run('staff-owner', ownerName, hashedPin, phone);
    } catch (e) {
      console.warn('Local staff owner insert notice:', e);
    }

    // 4. Create in Supabase (cloud multi-tenant)
    let cafeId = `cafe-${Date.now()}`;
    try {
      const { data: newCafe, error: cafeErr } = await cloudAdminClient
        .from('cafes')
        .insert({
          name: cafeName,
          slug,
          owner_name: ownerName,
          phone,
          status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (cafeErr) {
        console.warn('Cloud cafe creation notice:', cafeErr.message);
      } else if (newCafe) {
        cafeId = newCafe.id;

        // Insert platform user
        await cloudAdminClient.from('platform_users').insert({
          cafe_id: newCafe.id,
          name: ownerName,
          email: email.toLowerCase(),
          password_hash: hashedPassword,
          role: 'cafe_owner',
        });
      }
    } catch (cloudErr) {
      console.warn('Cloud DB signup fallback:', cloudErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please sign in with your credentials.',
      slug,
      cafeId,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
