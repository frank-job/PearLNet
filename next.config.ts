import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Post media, avatars and seeded content are served from third-party hosts
    // (Cloudinary, Vercel Blob, Unsplash). Opting out of the optimizer keeps
    // those URLs untouched and avoids routing external images through the
    // usage-billed Image Optimization pipeline.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;