import { normalizeCategoryKey, normalizeCategoryName } from '@/lib/category-utils';
import { prisma } from '@/lib/prisma';

function normalizeCategoryList(values: Array<string | null | undefined>) {
  const seen = new Set<string>();

  return values
    .map((value) => normalizeCategoryName(String(value || '')))
    .filter(Boolean)
    .filter((value) => {
      const key = normalizeCategoryKey(value);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.localeCompare(b, 'es'));
}

export async function getProductCategories(options?: { includeInactive?: boolean }) {
  const products = await prisma.product.findMany({
    where: options?.includeInactive ? { deletedAt: null } : { activo: true, disponible: true, deletedAt: null },
    select: { categoria: true },
    distinct: ['categoria'],
    orderBy: { categoria: 'asc' },
  });

  return normalizeCategoryList(products.map((product) => product.categoria));
}
