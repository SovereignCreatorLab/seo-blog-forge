import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // turn off css optimizer that sometimes causes cache/network issues in CI
    optimizeCss: false,
  },
  eslint: {
    // do not fail the build because of lint errors
    ignoreDuringBuilds: true,
  },
  // optional: keep CI green even if you have type errors during the transition
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
