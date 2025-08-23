import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable serverless deployment
  output: 'standalone',

  // React strict mode for better development
  reactStrictMode: true,

  // Webpack configuration for serverless
  webpack: (config, { dev }) => {
    if (dev) {
      // Development-specific webpack config
      config.watchOptions = {
        ignored: ['**/*'], // Ignore file changes (handled by nodemon)
      };
    }

    // Optimize for serverless
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };

    return config;
  },

  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },

  // Enable external packages for server components
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // Image optimization for serverless
  images: {
    unoptimized: true, // Disable Next.js image optimization for static export
  },

  // Environment variables
  env: {
    CUSTOM_KEY: 'my-value',
  },
};

export default nextConfig;
