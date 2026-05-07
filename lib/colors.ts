export type ProductColorOption = {
  id?: string;
  name: string;
  slug: string;
  hex: string;
  activo?: boolean;
  isDefault?: boolean;
  canDelete?: boolean;
};

export type ProductColorImage = {
  colorSlug: string;
  colorName: string;
  colorHex: string;
  path: string;
};

export const DEFAULT_PRODUCT_COLORS: ProductColorOption[] = [
  { name: 'Negro', slug: 'negro', hex: '#111111', activo: true, isDefault: true, canDelete: false },
  { name: 'Blanco', slug: 'blanco', hex: '#f2f2f2', activo: true, isDefault: true, canDelete: false },
];

const DEFAULT_BY_SLUG = new Map(DEFAULT_PRODUCT_COLORS.map((color) => [color.slug, color]));

export function normalizeColorName(value: string) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function normalizeColorSlug(value: string) {
  return normalizeColorName(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function normalizeHexColor(value: string) {
  const raw = String(value || '').trim();
  const normalized = raw.startsWith('#') ? raw : `#${raw}`;
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized.toUpperCase() : '';
}

export function colorFromSlug(slug: string): ProductColorOption | null {
  return DEFAULT_BY_SLUG.get(normalizeColorSlug(slug)) || null;
}

export function colorLabelFromSlug(slug: string) {
  const defaultColor = colorFromSlug(slug);
  if (defaultColor) return defaultColor.name;

  return normalizeColorSlug(slug)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Color';
}

export function colorHexFromSlug(slug: string) {
  return colorFromSlug(slug)?.hex || '#d8c7a7';
}

export function uniqueColorOptions(colors: ProductColorOption[]) {
  const bySlug = new Map<string, ProductColorOption>();

  [...DEFAULT_PRODUCT_COLORS, ...colors].forEach((color) => {
    const slug = normalizeColorSlug(color.slug || color.name);
    const name = normalizeColorName(color.name);
    const hex = normalizeHexColor(color.hex) || colorHexFromSlug(slug);

    if (!slug || !name || bySlug.has(slug)) return;

    const isDefault = color.isDefault ?? DEFAULT_BY_SLUG.has(slug);
    bySlug.set(slug, {
      ...color,
      name,
      slug,
      hex,
      activo: color.activo ?? true,
      isDefault,
      canDelete: !isDefault && Boolean(color.id),
    });
  });

  return Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
