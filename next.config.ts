import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['test.codinx.app'],

  async headers() {
    const headersList = [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];

    // In local development behind reverse proxies (like test.codinx.app),
    // prevent stale chunk caching that causes React hydration mismatches.
    if (isDev) {
      headersList.push({
        source: '/_next/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      });
    }

    return headersList;
  },
};

export default nextConfig;

