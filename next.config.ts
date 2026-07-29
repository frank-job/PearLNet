import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Fix workspace root detection for monorepo setup */
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
