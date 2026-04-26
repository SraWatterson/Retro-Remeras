import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productInputSchema } from '@/lib/validators';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];

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
}) {
  return {
    ...product,
    imagenesPorColor: product.imagenesPorColor ?? {},
  };
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { activo: true, disponible: true },
      orderBy: [{ destacado: 'desc' }, { nombre: 'asc' }],
    });

    return NextResponse.json(products.map(normalizeProductOutput));
  } catch (error) {
    console.error('products GET error', error);
    return NextResponse.json({ error: 'No se pudieron cargar los productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = productInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const created = await prisma.product.create({
      data: {
        ...parsed.data,
        imagenesPorColor: parsed.data.imagenesPorColor || {},
        createdById: session.id,
        updatedById: session.id,
      },
    });

    return NextResponse.json(normalizeProductOutput(created), { status: 201 });
  } catch (error) {
    console.error('products POST error', error);
    return NextResponse.json({ error: 'No se pudo crear el producto' }, { status: 500 });
  }
}
