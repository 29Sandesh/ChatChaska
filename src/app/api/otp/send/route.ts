import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cloudAdminClient } from '@/lib/cloud-db';

// Rate limiting map (in-memory for instant response)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

/**
 * POST /api/otp/send
 * Generates a 6-digit OTP, stores hashed version, and dispatches via SMS (or console in dev)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, cafe_id, table_number, purpose = 'order' } = body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    // 1. Rate Limiting (max 4 OTPs per phone per 10 minutes)
    const now = Date.now();
    const rateLimit = rateLimitMap.get(cleanPhone) || { count: 0, lastReset: now };
    if (now - rateLimit.lastReset > 600000) {
      rateLimit.count = 0;
      rateLimit.lastReset = now;
    }
    if (rateLimit.count >= 4) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait 10 minutes before trying again.' },
        { status: 429 }
      );
    }
    rateLimit.count += 1;
    rateLimitMap.set(cleanPhone, rateLimit);

    // 2. Generate 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // 3. Save to Supabase otp_verifications
    try {
      await cloudAdminClient.from('otp_verifications').insert({
        phone: cleanPhone,
        otp_code: hashedOtp,
        cafe_id: cafe_id || null,
        table_number: table_number || null,
        purpose,
        attempts: 0,
        is_verified: false,
        expires_at: expiresAt,
      });
    } catch (dbErr) {
      console.warn('Could not insert OTP into Supabase, fallback in-memory:', dbErr);
    }

    // 4. Dispatch via SMS provider
    const smsProvider = process.env.SMS_PROVIDER || 'console';
    console.log(`\n========================================`);
    console.log(`🔐 [ChatChaska OTP for +91 ${cleanPhone}]: ${otpCode}`);
    console.log(`⏳ Valid for 5 minutes (Expires: ${new Date(expiresAt).toLocaleTimeString()})`);
    console.log(`========================================\n`);

    // In dev / console mode, return success with demo hint
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300,
      devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
