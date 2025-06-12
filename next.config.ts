import type { NextConfig } from "next";

const nextConfig: NextConfig & { allowedDevOrigins?: string[] } = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev','*.wiseyak.com'],
};

export default nextConfig;
