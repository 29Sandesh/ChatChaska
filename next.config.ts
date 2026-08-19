import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3', 'bcryptjs'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
