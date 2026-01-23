/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Increase body size limit for file uploads
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: false,
  },
  // PWA Configuration
  // Note: For full PWA features, consider using next-pwa package
  // This basic setup makes it installable on mobile devices
}

module.exports = nextConfig