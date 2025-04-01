module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = 'source-map'; // Ensures source maps are generated in development
    }
    return config;
  },
};
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['static.wixstatic.com'],
  },
}

module.exports = nextConfig
