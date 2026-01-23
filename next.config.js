/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  // PWA Configuration
  // Note: For full PWA features, consider using next-pwa package
  // This basic setup makes it installable on mobile devices
  // Body size limits are handled by the server runtime in App Router
}

module.exports = nextConfig