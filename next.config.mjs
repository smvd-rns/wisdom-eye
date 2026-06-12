/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Useful for Vercel deployment of simple static/hybrid pages or when local assets are preferred
  },
};

export default nextConfig;
