import { NextResponse } from 'next/server';
import { getLicenseInfo, activateLicense, deactivateLicense } from '@/lib/license';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/license
 * Returns current software license status. No auth required (used by POS startup).
 */
export async function GET() {
  try {
    const info = await getLicenseInfo();
    return NextResponse.json({ license: info });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/license
 * Activate or deactivate (kill-switch) the POS license.
 * RESTRICTED: Only super_admin can perform these actions.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized — super admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, licenseKey, reason } = body;

    if (action === 'activate') {
      const result = await activateLicense(licenseKey);
      return NextResponse.json(result);
    }

    if (action === 'deactivate') {
      await deactivateLicense(reason || 'Suspended by admin');
      return NextResponse.json({ success: true, message: 'License deactivated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
