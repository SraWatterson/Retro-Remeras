import type { Metadata } from 'next';
import { Archivo, Archivo_Black, Shrikhand } from 'next/font/google';
import { FloatingBackButton } from '@/components/layout/FloatingBackButton';
import { CartSidebar } from '@/components/cart/CartSidebar';
import './css/style.css';
import './css/personalizados-mayorista.css';
import './css/typography.css';
import './css/home-hero.css';
import './css/categories-marquee.css';
import './css/home-personalizados.css';
import './css/home-steps.css';
import './css/home-featured.css';
import './css/home-contact.css';

// Tipografías: Shrikhand para títulos, Archivo Black para etiquetas cortas
// (menú, botones, precios) y Archivo para párrafos. next/font las sirve desde
// el propio dominio, sin pedirlas a Google en cada visita.
const fontTitle = Shrikhand({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-title' });
const fontLabel = Archivo_Black({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-label' });
const fontText = Archivo({ subsets: ['latin'], display: 'swap', variable: '--font-text' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Retro Remeras',
  description: 'Remeras con estilo, nostalgia y personalidad.',
  icons: { icon: '/assets/icons/favicon.ico' },
  openGraph: {
    siteName: 'Retro Remeras',
    locale: 'es_AR',
    type: 'website',
    images: [{ url: '/assets/img/ejemplo-vintage.jpg', width: 1100, height: 1320, alt: 'Retro Remeras' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${fontTitle.variable} ${fontLabel.variable} ${fontText.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Ir al contenido</a>
        <span id="main-content" tabIndex={-1} />
        {children}
        <FloatingBackButton />
        <CartSidebar />
      </body>
    </html>
  );
}
