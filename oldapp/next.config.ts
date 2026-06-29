import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    PORT: process.env.PORT || 3000,
    HOST: '0.0.0.0',
  },
  serverExternalPackages: ['oracledb'],
};

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts', );
export default withNextIntl(nextConfig);
