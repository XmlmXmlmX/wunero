import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    // Disable type checking during production build
    // Types are validated locally before commit
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
