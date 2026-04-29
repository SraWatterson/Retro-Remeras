import { AuditAction, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit-log';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { normalizeCategoryName } from '@/lib/category-utils';
import { checkRateLimit, getClientIp, jsonServerError, rateLimitResponse } from '@/lib/api-helpers';
import { normalizeProductOutput } from '@/lib/product-output';
import { prisma } from '@/lib/prisma';
import { productUpdateSchema } from '@/lib/validators';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];
const PRODUCT_WRITE_LIMIT = { limit: 40, windowMs: 60 * 1000 };
const PRODUCT_READ_LIMIT = { limit: 180, windowMs: 60 * 1000 };

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: Context) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({ key: `products:item:read:${ip}`, ...PRODUCT_READ_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || !product.activo || product.deletedAt) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(normalizeProductOutput(product));
  } catch (error) {
    return jsonServerError('PRODUCT_GET', 'No se pudo cargar el producto', error);
  }
}

export async function PATCH(request: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rateLimit = checkRateLimit({ key: `products:update:${session.id}`, ...PRODUCT_WRITE_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
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

    const current = await prisma.product.findUnique({ where: { id } });

    if (!current) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.categoria ? { categoria: normalizeCategoryName(parsed.data.categoria) } : {}),
        ...(parsed.data.activo === true ? { deletedAt: null, deletedById: null } : {}),
        updatedById: session.id,
      },
    });

    await createAuditLog({
      action: current.deletedAt && updated.activo ? AuditAction.PRODUCT_REACTIVATED : AuditAction.PRODUCT_UPDATED,
      entity: 'Product',
      entityId: updated.id,
      actorId: session.id,
      metadata: {
        slug: updated.slug,
        changedFields: Object.keys(parsed.data),
      },
    });

    return NextResponse.json(normalizeProductOutput(updated));
  } catch (error) {
    return jsonServerError('PRODUCT_PATCH', 'No se pudo actualizar el producto', error);
  }
}

export async function DELETE(request: Request, context: Context) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, [Role.ADMIN])) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rateLimit = checkRateLimit({ key: `products:delete:${session.id}`, limit: 20, windowMs: 60 * 1000 });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const { id } = await context.params;
    const hardDelete = new URL(request.url).searchParams.get('hard') === 'true';
    const current = await prisma.product.findUnique({ where: { id } });

    if (!current) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    if (hardDelete) {
      await prisma.product.delete({ where: { id } });

      await createAuditLog({
        action: AuditAction.PRODUCT_DEACTIVATED,
        entity: 'Product',
        entityId: current.id,
        actorId: session.id,
        metadata: {
          slug: current.slug,
          nombre: current.nombre,
          hardDelete: true,
        },
      });

      return NextResponse.json({ ok: true, hardDeleted: true });
    }

    const deleted = await prisma.product.update({
      where: { id },
      data: {
        activo: false,
        deletedAt: new Date(),
        deletedById: session.id,
        updatedById: session.id,
      },
    });

    await createAuditLog({
      action: AuditAction.PRODUCT_DEACTIVATED,
      entity: 'Product',
      entityId: deleted.id,
      actorId: session.id,
      metadata: {
        slug: deleted.slug,
        nombre: deleted.nombre,
        hardDelete: false,
      },
    });

    return NextResponse.json({ ok: true, hardDeleted: false });
  } catch (error) {
    return jsonServerError('PRODUCT_DELETE', 'No se pudo eliminar el producto', error);
  }
}
