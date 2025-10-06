/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable optimizations for debugging
  swcMinify: false,
  poweredByHeader: false,

  // Disable TypeScript and ESLint checks during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable image optimization temporarily
  images: {
    unoptimized: true,
    domains: ['openreviews.r2.cloudflarestorage.com'],
  },

  // Increase memory limit for build
  experimental: {
    largePageDataBytes: 128 * 100000, // Increase page data size limit
  },

  // Environment configuration with mock values
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'mock_key',
  },

  // API configuration with mock response option
  async rewrites() {
    if (process.env.USE_MOCK_API === 'true') {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/:path*` : 'http://localhost:8000/:path*',
      },
    ];
  },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
