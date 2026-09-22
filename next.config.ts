import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Fix workspace root detection for monorepo setup */
  turbopack: {
    root: __dirname,
  },
  images: {
    // Disable Vercel's server-side image optimization so external image
    // URLs served from your database are NOT routed through the paid
    // Image Optimization pipeline (which bills against Network Transfer).
    //
    // NOTE: Your components currently use plain <img> tags, which already
    // bypass Next's optimizer. This config is a safety net for any future
    // <Image> usage and for any remote images you may add.
    unoptimized: true,
  // Allow serving images from common external hosts (Vercel Blob,
    // your Neon-hosted URLs, or any CDN). Add your actual image host here.
    remotePatterns: [
      // Vercel Blob image domain (where uploaded post images live)
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // Allow any other HTTPS host as a fallback
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.vercel-storage.com https://*.blob.vercel-storage.com; frame-ancestors 'none';" },
        ],
      },
    ];
  },
};

export default nextConfig;
