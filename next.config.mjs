/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Prevents Vercel Image Optimization quota consumption
  },
  async headers() {
    return [
      {
        // 1-year immutable browser & CDN caching for static public images
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 1-year immutable caching for static favicon
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache public HTML pages at the Vercel CDN Edge to eliminate Serverless Function invocations
        source: '/((?!api|_next|admin|lms-admin|dashboard|profile).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Edge CDN Cache for public read-only APIs (reduces Vercel Active CPU to near-zero)
        source: '/api/tenant/metadata',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/api/site-pages/navigation',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/api/site-pages/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/api/home-config',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/api/courses',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/api/youtube',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
