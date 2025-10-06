/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build optimization
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  
  // API configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://bengalurutenants-api.onrender.com/api/:path*',
      },
    ];
  },

  // Image optimization
  images: {
    domains: ['openreviews.r2.cloudflarestorage.com'],
    minimumCacheTTL: 60,
  },
  
  // Environment configuration
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  },
  
  // Output optimization
  output: 'standalone',
};

module.exports = nextConfig;
