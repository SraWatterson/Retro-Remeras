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

export const revalidate = 60;

const LD_LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Retro Remeras',
  description: 'Remeras con estilo, nostalgia y personalidad. Diseños temáticos, atención cercana y pedidos simples por WhatsApp.',
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
