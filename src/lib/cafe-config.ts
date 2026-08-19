import { getSetting } from '@/lib/database';

/**
 * Centralized cafe configuration loaded from local SQLite settings.
 * All components should use this instead of hardcoding cafe-specific values.
 */
export interface CafeConfig {
  cafeName: string;
  cafeSlug: string;
  gstin: string;
  fssai: string;
  upiId: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  ownerName: string;
  ownerEmail: string;
  cgstRate: number;
  sgstRate: number;
  gstRate: number;
  restaurantId: string;
  mapsUrl: string;
  cuisines: string[];
  openTime: string;
  closeTime: string;
  avgCostForTwo: number;
}

/**
 * Loads cafe configuration from the local settings database.
 * Returns sensible empty defaults if settings haven't been configured yet.
 * Every component, API route, and receipt generator should call this
 * instead of hardcoding values like 'ChatChaska Cafe' or '27AABCM1234A1Z5'.
 */
export function getCafeConfig(): CafeConfig {
  const cgstRate = parseFloat(getSetting('cgst_rate', '2.5'));
  const sgstRate = parseFloat(getSetting('sgst_rate', '2.5'));

  return {
    cafeName: getSetting('cafe_name', ''),
    cafeSlug: getSetting('cafe_slug', ''),
    gstin: getSetting('gstin', ''),
    fssai: getSetting('fssai', ''),
    upiId: getSetting('upi_id', ''),
    address: getSetting('cafe_address', ''),
    city: getSetting('cafe_city', ''),
    phone: getSetting('cafe_phone', ''),
    whatsapp: getSetting('cafe_whatsapp', ''),
    ownerName: getSetting('owner_name', ''),
    ownerEmail: getSetting('owner_email', ''),
    cgstRate,
    sgstRate,
    gstRate: cgstRate + sgstRate,
    restaurantId: getSetting('restaurant_id', ''),
    mapsUrl: getSetting('google_maps_url', ''),
    cuisines: JSON.parse(getSetting('cuisines_json', '[]')),
    openTime: getSetting('open_time', '10:00 AM'),
    closeTime: getSetting('close_time', '11:00 PM'),
    avgCostForTwo: parseFloat(getSetting('avg_cost_for_two', '350')),
  };
}

/**
 * Returns a subset of cafe config safe for client-side use (no secrets).
 * Used by API routes that serve data to the frontend.
 */
export function getPublicCafeConfig() {
  const config = getCafeConfig();
  return {
    cafeName: config.cafeName,
    cafeSlug: config.cafeSlug,
    address: config.address,
    city: config.city,
    phone: config.phone,
    gstin: config.gstin,
    fssai: config.fssai,
    cgstRate: config.cgstRate,
    sgstRate: config.sgstRate,
    gstRate: config.gstRate,
    upiId: config.upiId,
  };
}
