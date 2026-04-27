export const PRODUCT_CATEGORIES = [
  'Fútbol',
  'Anime',
  'Cine / Películas',
  'Videojuegos',
  'Variados',
  'Vintage',
] as const;

export const CATEGORY_FILTERS = ['Todos', ...PRODUCT_CATEGORIES] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
