import '../../css/producto.css';
import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ProductView } from '@/components/product/ProductView';
import { getPublicProductBySlug } from '@/lib/product-queries';
import { getSiteContent } from '@/lib/site-content';
import { formatPrice, normalizeImageUrl, productHref } from '@/lib/shop';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

const getProductCached = cache(async (slug: string) => getPublicProductBySlug(decodeURIComponent(slug)));

function absoluteImageUrl(imagen?: string | null) {
  const rawImage = normalizeImageUrl(imagen);
  return rawImage.startsWith('http') ? rawImage : `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${rawImage}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductCached(slug);
  if (!product) return {};

  const imageUrl = absoluteImageUrl(product.imagen);
  const description = product.descripcion
    ? `${product.descripcion} — ${formatPrice(product.precio)}`
    : `${/^remeras?\b/i.test(product.nombre.trim()) ? product.nombre : `Remera ${product.nombre}`} · ${formatPrice(product.precio)} · Estampado DTF`;

  return {
    title: `${product.nombre} | Retro Remeras`,
    description,
    alternates: { canonical: productHref(product) },
    openGraph: {
      title: `${product.nombre} | Retro Remeras`,
      description,
      url: productHref(product),
      images: [{ url: imageUrl, width: 1400, height: 1400, alt: product.imagenAlt?.trim() || product.nombre }],
      type: 'website',
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const [product, siteContent] = await Promise.all([getProductCached(slug), getSiteContent()]);

  if (!product) {
    notFound();
  }

  const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  const url = `${BASE}${productHref(product)}`;

  const ldProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nombre,
    description: product.descripcion ?? undefined,
    image: absoluteImageUrl(product.imagen),
    category: product.categoria,
    url,
    brand: { '@type': 'Brand', name: 'Retro Remeras' },
    offers: {
      '@type': 'Offer',
      url,
      price: product.precio,
      priceCurrency: 'ARS',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Retro Remeras' },
    },
  };

  const ldBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Productos', item: `${BASE}/productos` },
      { '@type': 'ListItem', position: 3, name: product.nombre, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldProduct) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }} />
      <PromoBar content={siteContent} />
      <SiteHeader active="catalogo" />
      <ProductView key={product.id} product={product} />
      <SiteFooter />
    </>
  );
}
