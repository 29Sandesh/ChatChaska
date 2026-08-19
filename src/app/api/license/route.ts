import { NextResponse } from 'next/server';
import { getLicenseInfo, activateLicense, deactivateLicense } from '@/lib/license';

export async function GET() {
  try {
    const info = await getLicenseInfo();
    return NextResponse.json({ license: info });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
