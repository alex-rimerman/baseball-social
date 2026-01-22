/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  // PWA Configuration
  // Note: For full PWA features, consider using next-pwa package
  // This basic setup makes it installable on mobile devices
}

module.exports = nextConfig