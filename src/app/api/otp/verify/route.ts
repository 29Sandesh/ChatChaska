import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * POST /api/otp/verify
 * Verifies submitted 6-digit OTP, creates customer session, and sets secure cookie
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, name } = body;

    if (!phone || !otp || otp.trim().length !== 6) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit OTP code.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();
    const cleanOtp = otp.trim();

    // 1. Fetch latest pending OTP record for this phone
    let isMatch = false;
    let otpRecord: any = null;

    try {
      const { data, error } = await cloudAdminClient
        .from('otp_verifications')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('is_verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        otpRecord = data;
        if (data.attempts >= 3) {
          return NextResponse.json(
            { error: 'Too many incorrect attempts. Please request a new OTP.' },
            { status: 429 }
          );
        }

        isMatch = await bcrypt.compare(cleanOtp, data.otp_code);

        if (!isMatch) {
          await cloudAdminClient
            .from('otp_verifications')
            .update({ attempts: (data.attempts || 0) + 1 })
            .eq('id', data.id);

          const remaining = 3 - (data.attempts + 1);
          return NextResponse.json(
            { error: `Incorrect OTP. ${remaining} attempt(s) remaining.`, attemptsRemaining: remaining },
            { status: 400 }
          );
        }

        // Mark OTP record verified
        await cloudAdminClient
          .from('otp_verifications')
          .update({ is_verified: true })
          .eq('id', data.id);
      }
    } catch (e) {
      console.warn('DB OTP lookup error, falling back to bypass in test mode:', e);
    }

    // If in dev and DB record couldn't be queried, allow 123456 or recent console OTP
    if (!otpRecord && process.env.NODE_ENV !== 'production' && cleanOtp === '123456') {
      isMatch = true;
    }

    if (!isMatch && !otpRecord) {
      return NextResponse.json(
        { error: 'No active OTP found or OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 2. Generate secure UUID session token
    const sessionToken = crypto.randomUUID();
    const customerName = name?.trim() || 'Guest';

    // 3. Save to customer_sessions
    try {
      await cloudAdminClient.from('customer_sessions').insert({
        phone: cleanPhone,
        name: customerName,
        session_token: sessionToken,
        is_active: true,
      });
    } catch (sessionErr) {
      console.warn('Could not save customer_session to cloud:', sessionErr);
    }

    // 4. Set HTTP-only session cookie
    const response = NextResponse.json({
      verified: true,
      sessionToken,
      customer: {
        phone: cleanPhone,
        name: customerName,
      },
    });

    response.cookies.set('chatchaska_customer_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
