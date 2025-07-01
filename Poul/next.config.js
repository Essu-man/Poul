/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add case sensitive paths plugin
    config.resolve.plugins = [...(config.resolve.plugins || [])];

    // Disable case sensitive paths
    config.resolve.symlinks = false;

    // Force case sensitive paths
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': config.resolve.alias['@'] || config.resolve.alias['.'] || config.context,
    };

    return config;
  },
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
