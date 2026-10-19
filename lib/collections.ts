import { normalizeCategoryName } from '@/lib/category-utils';
import { collectionCopy, collectionSlug, type CollectionCopy } from '@/lib/collection-copy';
import { prisma } from '@/lib/prisma';
import { getPublicProducts } from '@/lib/product-queries';
import type { Product } from '@/lib/shop';

export { collectionHref, collectionSlug } from '@/lib/collection-copy';

/**
 * Colecciones = páginas propias por categoría (/coleccion/anime, /coleccion/musica…).
 * Hay una página por cada categoría de la home (las tarjetas de "Categorías")
 * y por cada categoría que tenga remeras publicadas.
 * Una colección todavía sin remeras tiene su página igual, pero Google no la
 * indexa hasta que tenga al menos una (una página vacía le resta).
 */
export type Collection = {
  slug: string;
  category: string;
  href: string;
  count: number;
  copy: CollectionCopy;
};

async function getLandingCategoryTitles() {
  try {
    const rows = await prisma.landingCategory.findMany({
      where: { activo: true },
      select: { title: true },
      orderBy: { order: 'asc' },
    });
    return rows.map((row) => row.title);
  } catch {
    return [];
  }
}

async function loadCollections() {
  const [products, landingTitles] = await Promise.all([getPublicProducts(), getLandingCategoryTitles()]);
  const map = new Map<string, { category: string; products: Product[] }>();

  landingTitles.forEach((title) => {
    const slug = collectionSlug(title);
    if (slug && !map.has(slug)) map.set(slug, { category: normalizeCategoryName(title), products: [] });
  });

  products.forEach((product) => {
    // Categoría principal + las extra (una remera puede estar en varias colecciones).
    const categories = [product.categoria, ...(product.categoriasExtra ?? [])];
    const seen = new Set<string>();
    categories.forEach((category) => {
      const slug = collectionSlug(category);
      if (!slug || seen.has(slug)) return;
      seen.add(slug);
      const entry = map.get(slug) ?? { category: normalizeCategoryName(category), products: [] };
      entry.products.push(product);
      map.set(slug, entry);
    });
  });

  return map;
}

function toCollection(slug: string, category: string, count: number): Collection {
  return { slug, category, href: `/coleccion/${slug}`, count, copy: collectionCopy(category) };
}

/** Todas las colecciones: primero las que tienen más remeras. */
export async function getCollections(): Promise<Collection[]> {
  const map = await loadCollections();
  return [...map.entries()]
    .map(([slug, { category, products }]) => toCollection(slug, category, products.length))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, 'es'));
}

export async function getCollection(slug: string) {
  const map = await loadCollections();
  const entry = map.get(slug);
  if (!entry) return null;
  return { collection: toCollection(slug, entry.category, entry.products.length), products: entry.products };
}
