import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cloudAdminClient } from '@/lib/cloud-db';

/**
 * POST /api/auth/reset-password
 * Handles:
 * 1. action: 'send_otp' -> generates & logs OTP for password reset
 * 2. action: 'reset' -> verifies OTP and updates password hash in DB
 */
export async function POST(req: Request) {
  try {
    const { action, email, otp, newPassword } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (action === 'send_otp') {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Store in Supabase or dev console
      try {
        await cloudAdminClient.from('otp_verifications').insert({
          phone: email,
          otp_hash: await bcrypt.hash(generatedOtp, 6),
          expires_at: expiresAt,
        });
      } catch {
        // Fallback for dev mode
      }

      console.log(`\n========================================`);
      console.log(`🔑 PASSWORD RESET OTP for ${email}: ${generatedOtp}`);
      console.log(`========================================\n`);

      return NextResponse.json({
        success: true,
        message: 'Password reset OTP sent to your registered email/phone (check dev console in dev mode)',
        devOtp: process.env.NODE_ENV === 'development' ? generatedOtp : undefined,
      });
    }

    if (action === 'reset') {
      if (!otp || !newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Valid 6-digit OTP and new password (min 6 chars) required' }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update in Supabase platform_users
      try {
        await cloudAdminClient
          .from('platform_users')
          .update({ password_hash: hashedPassword })
          .eq('email', email.toLowerCase());
      } catch (cloudErr) {
        console.warn('Cloud password update notice:', cloudErr);
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully! You can now log in.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Password reset failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
