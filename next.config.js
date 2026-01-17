/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'autoupload-assets.s3.amazonaws.com',
      'autoupload-assets.s3.us-east-1.amazonaws.com',
      'res.cloudinary.com'
    ],
    unoptimized: true
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001'
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

module.exports = nextConfig;
