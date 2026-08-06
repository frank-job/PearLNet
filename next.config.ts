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
    // <Image> usage and for remote images you may add.
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
};

export default nextConfig;
