/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Useful for Vercel deployment of simple static/hybrid pages or when local assets are preferred
  },
  async headers() {
    return [
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
    ];
  },
};

export default nextConfig;
