import type { Metadata } from 'next';
import { FloatingBackButton } from '@/components/layout/FloatingBackButton';
import { CartSidebar } from '@/components/cart/CartSidebar';
import './css/style.css';
import './css/personalizados-mayorista.css';

export const metadata: Metadata = {
  title: 'Retro Remeras',
  description: 'Remeras con estilo, nostalgia y personalidad.',
  icons: { icon: '/assets/icons/favicon.ico' },
  openGraph: {
    siteName: 'Retro Remeras',
    locale: 'es_AR',
    type: 'website',
    images: [{ url: '/assets/img/ejemplo-vintage.jpg', width: 1100, height: 1320, alt: 'Retro Remeras' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-link">Ir al contenido</a>
        {children}
        <FloatingBackButton />
        <CartSidebar />
      </body>
    </html>
  );
}
