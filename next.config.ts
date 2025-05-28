import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "web-worker": false,
    };
    return config;
  },
  experimental: {
    reactCompiler: true,
    turbo: {
      resolveAlias: {
        "web-worker": "./lib/empty-module.ts",
      },
    },
  },
};

export default nextConfig;
