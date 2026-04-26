import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { HeroSection } from '@/components/home/HeroSection';
import { StepsSection } from '@/components/home/StepsSection';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export default function Page() {
  return (
    <>
      <PromoBar />
      <SiteHeader active="inicio" />

      <main className="home-page">
        <HeroSection />
        <CategoriesSection />
        <StepsSection />
        <FeaturedProducts />
      </main>

      <SiteFooter />
    </>
  );
}
