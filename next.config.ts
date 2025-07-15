import type { NextConfig } from "next";

const nextConfig: NextConfig & { allowedDevOrigins?: string[] } = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev','*.wiseyak.com'],

  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'https://demo.wiseyak.com/api/:path*',
  //     },
  //     {
  //       source: '/auth/:path*',
  //       destination: 'https://demo.wiseyak.com/auth/:path*',
  //     },
  //     {
  //       source: '/credits/:path*',
  //       destination: 'https://demo.wiseyak.com/credits/:path*',
  //     },
  //     {
  //       source: '/features/:path*',
  //       destination: 'https://demo.wiseyak.com/features/:path*',
  //     },
  //     {
  //       source: '/feature/:path*',
  //       destination: 'https://demo.wiseyak.com/feature/:path*',
  //     },
  //     {
  //       source: '/admin/:path*',
  //       destination: 'https://demo.wiseyak.com/admin/:path*',
  //     },
  //   ];
  // }, 
};

export default nextConfig;
