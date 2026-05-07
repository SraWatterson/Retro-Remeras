import { normalizeCategoryName } from '@/lib/category-utils';
import { colorHexFromSlug, colorLabelFromSlug, normalizeColorSlug, ProductColorImage } from '@/lib/colors';
import { Product } from '@/lib/shop';

type ProductLike = {
  id: string;
  legacyId: number | null;
  slug: string;
  nombre: string;
  categoria: string;
  precio: number;
  imagen: string | null;
  imagenesPorColor: unknown;
  descripcion: string;
  disponible: boolean;
  destacado: boolean;
  activo: boolean;
  deletedAt?: Date | string | null;
  deletedById?: string | null;
};

export function normalizeImageMap(value: unknown): Record<string, ProductColorImage> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const normalized: Record<string, ProductColorImage> = {};

  Object.entries(value as Record<string, unknown>).forEach(([rawColor, rawData]) => {
    const fallbackSlug = normalizeColorSlug(rawColor);
    if (!fallbackSlug) return;

    if (typeof rawData === 'string') {
      const path = rawData.trim();
      if (!path) return;

      normalized[fallbackSlug] = {
        colorSlug: fallbackSlug,
        colorName: colorLabelFromSlug(fallbackSlug),
        colorHex: colorHexFromSlug(fallbackSlug),
        path,
      };
      return;
    }

    if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) return;

    const data = rawData as Record<string, unknown>;
    const colorSlug = normalizeColorSlug(String(data.colorSlug || data.slug || rawColor));
    const path = String(data.path || data.image || data.url || '').trim();
    if (!colorSlug || !path) return;

    normalized[colorSlug] = {
      colorSlug,
      colorName: String(data.colorName || data.name || colorLabelFromSlug(colorSlug)).trim() || colorLabelFromSlug(colorSlug),
      colorHex: String(data.colorHex || data.hex || colorHexFromSlug(colorSlug)).trim() || colorHexFromSlug(colorSlug),
      path,
    };
  });

  return normalized;
}

export function normalizeProductOutput(product: ProductLike): Product {
  return {
    id: product.id,
    legacyId: product.legacyId,
    slug: product.slug,
    nombre: product.nombre,
    categoria: normalizeCategoryName(product.categoria),
    precio: product.precio,
    imagen: product.imagen,
    imagenesPorColor: normalizeImageMap(product.imagenesPorColor),
    descripcion: product.descripcion,
    disponible: product.disponible,
    destacado: product.destacado,
    activo: product.activo,
    deletedAt: product.deletedAt ?? null,
    deletedById: product.deletedById ?? null,
  };
}
