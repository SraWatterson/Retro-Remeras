import type { Metadata } from 'next';
import '../css/catalogo.css';
import { CatalogView } from '@/components/catalog/CatalogView';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getProductCategories } from '@/lib/category-queries';
import { getPublicProducts } from '@/lib/product-queries';
import { getSiteContent } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Productos | Retro Remeras',
  description: 'Diseños de anime, gaming, cine y más. Remeras con estampado DTF de alta definición — envíos a todo el país.',
  alternates: { canonical: '/productos' },
  openGraph: {
    title: 'Productos | Retro Remeras',
    description: 'Diseños de anime, gaming, cine y más. Remeras con estampado DTF de alta definición — envíos a todo el país.',
    images: [{ url: '/assets/img/remera-goku.jpg', width: 1100, height: 1320, alt: 'Productos Retro Remeras' }],
  },
};

export const revalidate = 60;

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
const LD_BREADCRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
    { '@type': 'ListItem', position: 2, name: 'Productos', item: `${BASE}/productos` },
  ],
};

type PageProps = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const [products, categories, siteContent] = await Promise.all([
    getPublicProducts(),
    getProductCategories(),
    getSiteContent(),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD_BREADCRUMB) }} />
      <PromoBar content={siteContent} />
      <SiteHeader active="catalogo" />
      <CatalogView initialCategory={params.categoria} initialProducts={products} categories={categories} />
      <SiteFooter />
    </>
  );
}
