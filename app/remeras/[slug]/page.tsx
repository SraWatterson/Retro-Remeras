import { collectionHref } from '@/lib/collections';
import '../../css/producto.css';
import '../../css/producto-zoom.css';
import '../../css/producto-ficha.css';
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
import { absoluteUrl, SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

/**
 * Las fichas se arman de antemano (al publicar) y se actualizan solas cada
 * 60 s: abren al instante. Una remera nueva se arma en su primera visita y
 * desde ahí también queda lista.
 */
// No se arman todas en la publicación (con muchas remeras la base de datos se
// saturaba y Vercel cancelaba el build). Cada página se arma la primera vez que
// alguien la visita y queda guardada (se renueva cada 60 s), así que sigue
// abriendo rápido.
export async function generateStaticParams() {
  return [];
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

const getProductCached = cache(async (slug: string) => getPublicProductBySlug(decodeURIComponent(slug)));

function absoluteImageUrl(imagen?: string | null) {
  return absoluteUrl(normalizeImageUrl(imagen));
}

/**
 * Descripción para Google (≈155 caracteres). Usa el segundo párrafo de la
 * descripción si existe (el que nombra la referencia exacta: personaje, banda,
 * serie), si no el primero, y le suma el precio.
 */
function metaDescription(nombre: string, descripcion: string | null | undefined, precio: string) {
  const paragraphs = (descripcion || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const base = paragraphs[1] || paragraphs[0] || `${/^remeras?\b/i.test(nombre.trim()) ? nombre : `Remera ${nombre}`} con estampado DTF`;
  const max = 150 - precio.length;
  let text = base.replace(/\s+/g, ' ');
  if (text.length > max) {
    const cut = text.slice(0, max);
    text = `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:\s]+$/, '')}…`;
  }
  return `${text} · ${precio}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductCached(slug);
  if (!product) return {};

  const imageUrl = absoluteImageUrl(product.imagen);
  const description = metaDescription(product.nombre, product.descripcion, formatPrice(product.precio));

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

  const BASE = SITE_URL;
  const url = `${BASE}${productHref(product)}`;

  // Todas las fotos (una por color) y los colores, para Google.
  const colorEntries = Object.values(product.imagenesPorColor ?? {}).filter((c) => c?.path);
  const allImages = [...new Set([product.imagen, ...colorEntries.map((c) => c.path)].filter(Boolean).map((p) => absoluteImageUrl(p)))];
  const nextYear = `${new Date().getFullYear() + 1}-12-31`;

  const ldProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nombre,
    description: product.descripcion ?? undefined,
    image: allImages.length ? allImages : absoluteImageUrl(product.imagen),
    sku: product.slug,
    category: product.categoria,
    ...(colorEntries.length ? { color: colorEntries.map((c) => c.colorName).join(', ') } : {}),
    url,
    brand: { '@type': 'Brand', name: 'Retro Remeras' },
    offers: {
      '@type': 'Offer',
      url,
      price: product.precio,
      priceCurrency: 'ARS',
      priceValidUntil: nextYear,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Retro Remeras' },
    },
  };

  const ldBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Remeras', item: `${BASE}/productos` },
      { '@type': 'ListItem', position: 3, name: product.categoria, item: `${BASE}${collectionHref(product.categoria)}` },
      { '@type': 'ListItem', position: 4, name: product.nombre, item: url },
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
