import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ProductView } from '@/components/product/ProductView';

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <>
      <PromoBar />
      <SiteHeader active="catalogo" />
      <ProductView productId={params.id} />
      <SiteFooter />
    </>
  );
}
