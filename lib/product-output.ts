import { normalizeCategoryName } from '@/lib/category-utils';
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

export function normalizeImageMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([color, path]) => color.trim().length > 0 && typeof path === 'string' && path.trim().length > 0
    ) as Array<[string, string]>
  );
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
