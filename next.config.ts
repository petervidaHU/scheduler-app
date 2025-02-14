import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    PORT: process.env.PORT || 3000,
    HOST: '0.0.0.0',
  },
};

export default nextConfig;
