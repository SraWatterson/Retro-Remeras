import { normalizeCategoryName } from '@/lib/category-utils';
import { colorHexFromSlug, colorLabelFromSlug, normalizeColorSlug, ProductColorImage } from '@/lib/colors';
import { Product, ProductSizeGuide, SizeGuideTable } from '@/lib/shop';

type ProductLike = {
  id: string;
  legacyId: number | null;
  slug: string;
  nombre: string;
  categoria: string;
  precio: number;
  imagen: string | null;
  imagenesPorColor: unknown;
  sizeGuide: unknown;
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

function normalizeFlexibleSizeGuideTable(value: unknown): SizeGuideTable | undefined {
  if (!value || typeof value !== 'object') return undefined;

  if (Array.isArray(value)) {
    const legacyRows = value
      .map((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
        const data = row as Record<string, unknown>;
        const size = String(data.size || '').trim();
        if (!size) return null;

        return [
          size,
          String(data.width || '').trim(),
          String(data.length || '').trim(),
          String(data.sleeve || '').trim(),
        ];
      })
      .filter((row): row is string[] => Boolean(row));

    if (!legacyRows.length) return undefined;

    const hasSleeve = legacyRows.some((row) => row[3]);
    return {
      columns: hasSleeve ? ['Talle', 'Ancho', 'Largo', 'Manga'] : ['Talle', 'Ancho', 'Largo'],
      rows: legacyRows.map((row) => (hasSleeve ? row : row.slice(0, 3))),
    };
  }

  const raw = value as Record<string, unknown>;
  const columns = Array.isArray(raw.columns)
    ? raw.columns.map((column) => String(column || '').trim()).filter(Boolean).slice(0, 8)
    : [];

  if (!columns.length) return undefined;

  const rows = Array.isArray(raw.rows)
    ? raw.rows
        .filter((row): row is unknown[] => Array.isArray(row))
        .map((row) => {
          const normalized = row.slice(0, columns.length).map((cell) => String(cell || '').trim());
          while (normalized.length < columns.length) normalized.push('');
          return normalized;
        })
        .filter((row) => row.some(Boolean))
        .slice(0, 24)
    : [];

  return { columns, rows };
}

export function normalizeSizeGuide(value: unknown): ProductSizeGuide {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const raw = value as Record<string, unknown>;

  return {
    regular: normalizeFlexibleSizeGuideTable(raw.regular),
    oversize: normalizeFlexibleSizeGuideTable(raw.oversize),
  };
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
    sizeGuide: normalizeSizeGuide(product.sizeGuide),
    descripcion: product.descripcion,
    disponible: product.disponible,
    destacado: product.destacado,
    activo: product.activo,
    deletedAt: product.deletedAt ?? null,
    deletedById: product.deletedById ?? null,
  };
}
