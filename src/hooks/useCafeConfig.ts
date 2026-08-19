'use client';

import { useState, useEffect } from 'react';

/** Public cafe configuration shape returned by /api/cafe-config */
export interface ClientCafeConfig {
  cafeName: string;
  cafeSlug: string;
  address: string;
  city: string;
  phone: string;
  gstin: string;
  fssai: string;
  cgstRate: number;
  sgstRate: number;
  gstRate: number;
  upiId: string;
}

/**
 * React hook to load cafe configuration from the server.
 * Replaces all hardcoded cafe names, GST numbers, addresses, and tax rates.
 *
 * @example
 * const { config, loading } = useCafeConfig();
 * // config.cafeName instead of 'ChatChaska Cafe'
 * // config.gstin instead of '27AABCM1234A1Z5'
 */
export function useCafeConfig() {
  const [config, setConfig] = useState<ClientCafeConfig>({
    cafeName: '',
    cafeSlug: '',
    address: '',
    city: '',
    phone: '',
    gstin: '',
    fssai: '',
    cgstRate: 2.5,
    sgstRate: 2.5,
    gstRate: 5,
    upiId: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/cafe-config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.warn('Failed to load cafe config:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { config, loading };
}
