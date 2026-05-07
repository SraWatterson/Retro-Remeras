import '../css/producto.css';
import { notFound } from 'next/navigation';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ProductView } from '@/components/product/ProductView';
import { getPublicProductById } from '@/lib/product-queries';
import { getSiteContent } from '@/lib/site-content';

export const revalidate = 60;
type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const productId = params.id;

  if (!productId) {
    notFound();
  }

  const [product, siteContent] = await Promise.all([getPublicProductById(productId), getSiteContent()]);

  if (!product) {
    notFound();
  }

  return (
    <>
      <PromoBar content={siteContent} />
      <SiteHeader active="catalogo" />
      <ProductView product={product} />
      <SiteFooter />
    </>
  );
}
