import '../css/catalogo.css';
import { CatalogView } from '@/components/catalog/CatalogView';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getPublicProducts } from '@/lib/product-queries';

type PageProps = {
  searchParams: Promise<{ categoria?: string; buscar?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const products = await getPublicProducts();

  return (
    <>
      <PromoBar />
      <SiteHeader active="catalogo" />
      <CatalogView initialCategory={params.categoria} initialSearch={params.buscar} initialProducts={products} />
      <SiteFooter />
    </>
  );
}
