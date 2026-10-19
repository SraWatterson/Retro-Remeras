import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    qualities: [40, 75, 90, 92, 94],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Fotos de las tarjetas de categorías (Unsplash, licencia gratuita).
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/photo-*',
      },
    ],
  },
};

export default nextConfig;
