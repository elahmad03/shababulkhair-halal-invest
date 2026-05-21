import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ⚠️ Dangerous: allows production builds with TS errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;