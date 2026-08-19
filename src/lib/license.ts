import { getSetting, saveSetting } from '@/lib/database';

export interface LicenseInfo {
  licenseKey: string;
  restaurantName: string;
  plan: 'trial' | 'basic' | 'pro' | 'enterprise';
  isActive: boolean;
  expiresAt: string;
  lastCheckIn: string;
  daysRemaining: number;
}

/**
 * Validates software license status. Returns license information and validity.
 */
export async function getLicenseInfo(): Promise<LicenseInfo> {
  const licenseKey = getSetting('license_key', 'MNT-TRIAL-2026');
  const restaurantName = getSetting('restaurant_name', 'ChatChaska Cafe');
  const plan = (getSetting('license_plan', 'pro') as LicenseInfo['plan']);
  const isActiveSetting = getSetting('license_is_active', 'true');
  const expiresAtSetting = getSetting('license_expires_at', '');

  // Default expiry: 30 days from now if not set
  const expiresAtDate = expiresAtSetting
    ? new Date(expiresAtSetting)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const now = new Date();
  const diffMs = expiresAtDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const isActive = isActiveSetting === 'true' && daysRemaining > 0;

  return {
    licenseKey,
    restaurantName,
    plan,
    isActive,
    expiresAt: expiresAtDate.toISOString().slice(0, 10),
    lastCheckIn: new Date().toISOString(),
    daysRemaining,
  };
}

/**
 * Activates or updates license key
 */
export async function activateLicense(key: string): Promise<{ success: boolean; message: string }> {
  if (!key || key.trim().length < 8) {
    return { success: false, message: 'Invalid license key format' };
  }

  const cleanKey = key.trim().toUpperCase();
  saveSetting('license_key', cleanKey);
  saveSetting('license_is_active', 'true');
  
  // Set 1 year expiry for activated key
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  saveSetting('license_expires_at', oneYearFromNow);
  saveSetting('license_plan', 'pro');

  return { success: true, message: 'Software license activated successfully!' };
}

/**
 * Supreme Control: Remotely deactivates license (kill switch)
 */
export async function deactivateLicense(reason: string = 'License suspended'): Promise<void> {
  saveSetting('license_is_active', 'false');
  saveSetting('license_suspend_reason', reason);
}
