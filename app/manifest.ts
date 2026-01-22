import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Baseball Social',
    short_name: 'Baseball Social',
    description: 'A social media platform for baseball fans',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff8dc',
    theme_color: '#dc2626',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['social', 'sports'],
  }
}