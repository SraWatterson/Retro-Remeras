import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Calidades permitidas para las fotos (más bajo = más liviano).
    qualities: [40, 75, 80, 85],
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
      {
        // Fotos de perfil y de reseñas de Google Maps (sección de reseñas).
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
