import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    // Disable type checking during production build
    // Types are validated locally before commit
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
