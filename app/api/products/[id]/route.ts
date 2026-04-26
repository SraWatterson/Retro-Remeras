import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productUpdateSchema } from '@/lib/validators';

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

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || !product.activo) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(normalizeProductOutput(product));
  } catch (error) {
    console.error('product GET error', error);
    return NextResponse.json({ error: 'No se pudo cargar el producto' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedById: session.id,
      },
    });

    return NextResponse.json(normalizeProductOutput(updated));
  } catch (error) {
    console.error('product PATCH error', error);
    return NextResponse.json({ error: 'No se pudo actualizar el producto' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, [Role.ADMIN])) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await context.params;

    await prisma.product.update({
      where: { id },
      data: {
        activo: false,
        updatedById: session.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('product DELETE error', error);
    return NextResponse.json({ error: 'No se pudo eliminar el producto' }, { status: 500 });
  }
}
