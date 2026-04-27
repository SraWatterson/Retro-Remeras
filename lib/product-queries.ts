import { prisma } from '@/lib/prisma';
import { Product } from '@/lib/shop';

function normalizeProductOutput(product: {
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
}): Product {
  return {
    id: product.id,
    legacyId: product.legacyId,
    slug: product.slug,
    nombre: product.nombre,
    categoria: product.categoria,
    precio: product.precio,
    imagen: product.imagen,
    imagenesPorColor:
      product.imagenesPorColor && typeof product.imagenesPorColor === 'object'
        ? (product.imagenesPorColor as Record<string, string>)
        : {},
    descripcion: product.descripcion,
    disponible: product.disponible,
    destacado: product.destacado,
    activo: product.activo,
  };
}

export async function getPublicProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { activo: true, disponible: true },
    orderBy: [{ destacado: 'desc' }, { nombre: 'asc' }],
  });

  return products.map(normalizeProductOutput);
}

export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { activo: true, disponible: true, destacado: true },
    orderBy: [{ nombre: 'asc' }],
    take: limit,
  });

  return products.map(normalizeProductOutput);
}

export async function getPublicProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: { id, activo: true, disponible: true },
  });

  return product ? normalizeProductOutput(product) : null;
}
