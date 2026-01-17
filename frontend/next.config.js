/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'autoupload-assets.s3.amazonaws.com',
      'autoupload-assets.s3.us-east-1.amazonaws.com',
      'res.cloudinary.com'
    ]
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001'
  }
};

module.exports = nextConfig;
