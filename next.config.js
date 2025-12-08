/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Habilitar output standalone para optimización en Docker
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

