import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production-optimized configuration for Vercel deployment
  compress: true,
  poweredByHeader: false,
  
  // Image optimization for production
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
    serverComponentsExternalPackages: ['z-ai-web-dev-sdk'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:; frame-src 'none'; object-src 'none';",
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // SEO redirects
  async redirects() {
    return [
      {
        source: '/books',
        destination: '/',
        permanent: true,
      },
      {
        source: '/search',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Environment-specific optimizations
  output: process.env.VERCEL_ENV === 'production' ? 'export' : 'standalone',
  
  // Build optimizations
  swcMinify: true,
  
  // Production build settings
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  reactStrictMode: true,
  
  // Bundle analyzer for production builds
  ...(process.env.ANALYZE === 'true' && {
    bundles: true,
  }),
};

export default nextConfig;