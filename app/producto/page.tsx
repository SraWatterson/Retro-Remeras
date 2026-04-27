import '../css/producto.css';
import { notFound } from 'next/navigation';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ProductView } from '@/components/product/ProductView';
import { getPublicProductById } from '@/lib/product-queries';

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const productId = params.id;

  if (!productId) {
    notFound();
  }

  const product = await getPublicProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <>
      <PromoBar />
      <SiteHeader active="catalogo" />
      <ProductView product={product} />
      <SiteFooter />
    </>
  );
}
