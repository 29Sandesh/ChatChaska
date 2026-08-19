import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/auth/me
 *
 * Returns the current authenticated user's info from the session.
 * Used by client components to check auth state.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cafeId: user.cafeId,
        cafeName: user.cafeName,
      },
    });
  } catch {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
}
