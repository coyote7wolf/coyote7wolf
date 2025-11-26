/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,

  // Static export configuration for mock-data mode
  trailingSlash: process.env.MODE === 'mock-data',
  output: process.env.MODE === 'mock-data' ? 'export' : undefined,

  // Environment variables
  env: {
    MODE: process.env.MODE || 'development',
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle in production
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.framework = {
        chunks: 'all',
        name: 'framework',
        test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
        priority: 40,
        enforce: true,
      }
    }

    return config
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
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
