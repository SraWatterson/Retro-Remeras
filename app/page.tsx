import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { HeroSection } from '@/components/home/HeroSection';
import { LocationSection } from '@/components/home/LocationSection';
import { StepsSection } from '@/components/home/StepsSection';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getFeaturedProducts } from '@/lib/product-queries';
import { getSiteContent } from '@/lib/site-content';

export const revalidate = 60;
export default async function Page() {
  const [featuredProducts, siteContent] = await Promise.all([getFeaturedProducts(), getSiteContent()]);

  return (
    <>
      <PromoBar content={siteContent} />
      <SiteHeader active="inicio" />

      <main className="home-page">
        <HeroSection content={siteContent} />
        <CategoriesSection />
        <StepsSection />
        <FeaturedProducts initialProducts={featuredProducts} />
        <LocationSection />
      </main>

      <SiteFooter />
    </>
  );
}
