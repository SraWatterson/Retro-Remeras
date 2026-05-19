import '../css/producto.css';
import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PromoBar } from '@/components/layout/PromoBar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { ProductView } from '@/components/product/ProductView';
import { getPublicProductById } from '@/lib/product-queries';
import { getSiteContent } from '@/lib/site-content';
import { formatPrice, normalizeImageUrl } from '@/lib/shop';

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

const getProductCached = cache(async (id: string) => getPublicProductById(id));

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  if (!params.id) return {};

  const product = await getProductCached(params.id);
  if (!product) return {};

  const rawImage = normalizeImageUrl(product.imagen);
  const imageUrl = rawImage.startsWith('http')
    ? rawImage
    : `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${rawImage}`;

  const description = product.descripcion
    ? `${product.descripcion} — ${formatPrice(product.precio)}`
    : `Remera ${product.nombre} · ${formatPrice(product.precio)} · Estampado DTF`;

  return {
    title: `${product.nombre} | Retro Remeras`,
    description,
    openGraph: {
      title: `${product.nombre} | Retro Remeras`,
      description,
      images: [{ url: imageUrl, width: 1400, height: 1400, alt: product.nombre }],
      type: 'website',
    },
  };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const productId = params.id;

  if (!productId) {
    notFound();
  }

  const [product, siteContent] = await Promise.all([getProductCached(productId), getSiteContent()]);

  if (!product) {
    notFound();
  }

  const rawImage = normalizeImageUrl(product.imagen);
  const imageUrl = rawImage.startsWith('http')
    ? rawImage
    : `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${rawImage}`;

  const ldProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nombre,
    description: product.descripcion ?? undefined,
    image: imageUrl,
    category: product.categoria,
    offers: {
      '@type': 'Offer',
      price: product.precio,
      priceCurrency: 'ARS',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Retro Remeras' },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldProduct) }}
      />
      <PromoBar content={siteContent} />
      <SiteHeader active="catalogo" />
      <ProductView product={product} />
      <SiteFooter />
    </>
  );
}
