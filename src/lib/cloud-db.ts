import { createClient } from '@supabase/supabase-js';

/**
 * ChatChaska Cloud DB Client & Helpers
 *
 * Provides a standardized client to interact with the central Supabase PostgreSQL
 * database hosting all multi-tenant cafes, platform users, and billing data.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for browser or user-scoped queries (RLS enforced)
export const cloudClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side Super Admin operations (bypasses RLS)
export const cloudAdminClient = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : cloudClient;

/**
 * Check if the application is connected to a production Supabase project.
 */
export function isCloudConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo-project') &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('demo')
  );
}
