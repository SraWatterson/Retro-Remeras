import type { MetadataRoute } from 'next';
import { getCollections } from '@/lib/collections';
import { getPublicProducts } from '@/lib/product-queries';
import { normalizeImageUrl, productHref } from '@/lib/shop';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

// Se regenera cada hora, así los productos nuevos aparecen sin volver a publicar la web.
export const revalidate = 3600;

function absolute(url: string) {
  return url.startsWith('http') ? url : `${BASE}${url}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([getPublicProducts(), getCollections()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/productos`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/personalizados`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/mayorista`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => {
    const images = new Set<string>();
    if (product.imagen) images.add(absolute(normalizeImageUrl(product.imagen)));
    Object.values(product.imagenesPorColor || {}).forEach((color) => {
      if (color?.path) images.add(absolute(normalizeImageUrl(color.path)));
    });

    return {
      url: `${BASE}${productHref(product)}`,
      changeFrequency: 'monthly',
      priority: 0.6,
      images: [...images],
    };
  });

  // Solo las colecciones con remeras: las vacías no se indexan todavía.
  const collectionRoutes: MetadataRoute.Sitemap = collections.filter((collection) => collection.count > 0).map((collection) => ({
    url: `${BASE}${collection.href}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
