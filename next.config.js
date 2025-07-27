/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force Pages Router
  experimental: {
    appDir: false
  }
}

module.exports = nextConfig