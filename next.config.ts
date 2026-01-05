import nextBundleAnalyzer from '@next/bundle-analyzer';
import type { Configuration } from "webpack"
 // 1. Import Webpack's Configuration type

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your other Next.js config options here

  // 👇 2. Add the types to the function parameters
  webpack: (
    config: Configuration,
    { dev }: { dev: boolean } // 3. Type the destructured 'dev' property
  ) => {
    // We only want to change this for development
    if (dev) {
      config.devtool = 'eval-cheap-module-source-map';
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);