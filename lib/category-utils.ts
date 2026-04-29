export const FALLBACK_CATEGORY = 'Variados';

const CATEGORY_ALIASES: Record<string, string> = {
  'cine peliculas': 'Cine',
  'cine pelicula': 'Cine',
  'cine y peliculas': 'Cine',
  'peliculas': 'Cine',
};

const CATEGORY_REVERSE_ALIASES: Record<string, string[]> = {
  cine: ['Cine', 'Cine / Películas', 'Cine / Peliculas'],
};

export function normalizeCategoryKey(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function normalizeCategoryName(value: string) {
  const cleanValue = String(value || '').trim().replace(/\s+/g, ' ');
  if (!cleanValue) return '';

  return CATEGORY_ALIASES[normalizeCategoryKey(cleanValue)] || cleanValue;
}

export function getCategoryAliases(category: string) {
  const normalized = normalizeCategoryName(category);
  const key = normalizeCategoryKey(normalized);
  const aliases = CATEGORY_REVERSE_ALIASES[key] || [normalized];
  const unique = new Map<string, string>();

  [...aliases, normalized].forEach((item) => {
    const value = String(item || '').trim();
    if (!value) return;
    unique.set(normalizeCategoryKey(value), value);
  });

  return Array.from(unique.values());
}
