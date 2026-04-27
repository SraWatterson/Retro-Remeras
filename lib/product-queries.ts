import { prisma } from '@/lib/prisma';
import { Product } from '@/lib/shop';
import { normalizeProductOutput } from '@/lib/product-output';

export async function getPublicProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { activo: true, disponible: true, deletedAt: null },
    orderBy: [{ destacado: 'desc' }, { nombre: 'asc' }],
  });

  return products.map(normalizeProductOutput);
}

export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { activo: true, disponible: true, destacado: true, deletedAt: null },
    orderBy: [{ nombre: 'asc' }],
    take: limit,
  });

  return products.map(normalizeProductOutput);
}

export async function getPublicProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: { id, activo: true, disponible: true, deletedAt: null },
  });

  return product ? normalizeProductOutput(product) : null;
}
