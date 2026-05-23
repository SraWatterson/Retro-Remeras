import type { Metadata } from 'next';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { HeroSection } from '@/components/home/HeroSection';
import { ContactSection } from '@/components/home/ContactSection';
import { LocationSection } from '@/components/home/LocationSection';
import { StepsSection } from '@/components/home/StepsSection';
import { PersonalizadosMayoristaSection } from '@/components/home/PersonalizadosMayoristaSection';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getFeaturedProducts } from '@/lib/product-queries';
import { getSiteContent } from '@/lib/site-content';
import { getProductCategories } from '@/lib/category-queries';

export const metadata: Metadata = {
  title: 'Retro Remeras — Diseños de anime, gaming, cine y más',
  description: 'Remeras con estilo, nostalgia y personalidad. Diseños temáticos, estampado DTF de alta definición, sin mínimo de compra. Envíos a todo el país.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Retro Remeras — Diseños de anime, gaming, cine y más',
    description: 'Remeras con estilo, nostalgia y personalidad. Diseños temáticos, estampado DTF de alta definición, sin mínimo de compra. Envíos a todo el país.',
    images: [{ url: '/assets/img/ejemplo-vintage.jpg', width: 1100, height: 1320, alt: 'Retro Remeras' }],
  },
};

export const revalidate = 60;

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');

const LD_LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Retro Remeras',
  description: 'Remeras con estilo, nostalgia y personalidad. Diseños temáticos, atención cercana y pedidos simples por WhatsApp.',
  url: BASE || undefined,
  image: BASE ? `${BASE}/assets/img/ejemplo-vintage.jpg` : undefined,
  priceRange: '$',
  address: { '@type': 'PostalAddress', addressLocality: 'Buenos Aires', addressCountry: 'AR' },
  geo: { '@type': 'GeoCoordinates', latitude: -34.6928604, longitude: -58.6065624 },
  telephone: `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5491123620076'}`,
  sameAs: ['https://www.instagram.com/retro.remeras/'],
};

export default async function Page() {
  const [featuredProducts, siteContent, categories] = await Promise.all([
    getFeaturedProducts(),
    getSiteContent(),
    getProductCategories(),
  ]);

  return (
    <>
      <PromoBar content={siteContent} />
      <SiteHeader active="inicio" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD_LOCAL_BUSINESS) }} />
      <main className="home-page">
        <HeroSection content={siteContent} />
        <div className="hero-stats-wrap" aria-label="Puntos clave">
          <div className="hero-stats container">
            <div className="hero-stat">
              <span className="hero-stat__num">{categories.length}</span>
              <span className="hero-stat__label">estilos</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat__num">x1</span>
              <span className="hero-stat__label">unidad mínima</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat__num">DTF</span>
              <span className="hero-stat__label">alta definición</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat__num">CABA</span>
              <span className="hero-stat__label">y envíos al país</span>
            </div>
          </div>
        </div>
        <CategoriesSection />
        <PersonalizadosMayoristaSection />
        <StepsSection />
        <FeaturedProducts initialProducts={featuredProducts} />
        <LocationSection />
        <ContactSection />
      </main>

      <SiteFooter />
    </>
  );
}
