import { PRODUCT_CATEGORIES } from '@/lib/categories';
import { prisma } from '@/lib/prisma';

function normalizeCategoryList(values: Array<string | null | undefined>) {
  const seen = new Set<string>();

  return values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.localeCompare(b, 'es'));
}

export async function getProductCategories(options?: { includeInactive?: boolean }) {
  const products = await prisma.product.findMany({
    where: options?.includeInactive ? {} : { activo: true, disponible: true, deletedAt: null },
    select: { categoria: true },
    distinct: ['categoria'],
    orderBy: { categoria: 'asc' },
  });

  return normalizeCategoryList([...PRODUCT_CATEGORIES, ...products.map((product) => product.categoria)]);
}
