import { AuditAction, Prisma, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit-log';
import { checkRateLimit, getClientIp, jsonServerError, rateLimitResponse } from '@/lib/api-helpers';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { FALLBACK_CATEGORY, getCategoryAliases, normalizeCategoryKey, normalizeCategoryName } from '@/lib/category-utils';
import { getProductCategories } from '@/lib/category-queries';
import { prisma } from '@/lib/prisma';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];
const ADMIN_ROLES: Role[] = [Role.ADMIN];
const CATEGORY_WRITE_LIMIT = { limit: 30, windowMs: 60 * 1000 };

function categoryWhere(category: string): Prisma.ProductWhereInput {
  const aliases = getCategoryAliases(category);

  return {
    OR: aliases.map((alias) => ({ categoria: { equals: alias, mode: 'insensitive' } })),
  };
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({ key: `categories:read:${ip}`, limit: 180, windowMs: 60 * 1000 });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const { searchParams } = new URL(request.url);
    const wantsInactive = searchParams.get('includeInactive') === 'true';
    const session = wantsInactive ? await getCurrentSession() : null;
    const includeInactive = Boolean(session && isRoleAllowed(session.role, MANAGER_ROLES));
    const categories = await getProductCategories({ includeInactive });

    return NextResponse.json({ items: categories });
  } catch (error) {
    return jsonServerError('CATEGORIES_GET', 'No se pudieron cargar las categorías', error);
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, ADMIN_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rateLimit = checkRateLimit({ key: `categories:update:${session.id}`, ...CATEGORY_WRITE_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const body = await request.json();
    const from = normalizeCategoryName(String(body?.from || ''));
    const to = normalizeCategoryName(String(body?.to || ''));

    if (from.length < 2 || to.length < 2) {
      return NextResponse.json({ error: 'Categoría inválida' }, { status: 400 });
    }

    if (to.length > 60) {
      return NextResponse.json({ error: 'La categoría no puede superar los 60 caracteres.' }, { status: 400 });
    }

    if (normalizeCategoryKey(from) === normalizeCategoryKey(to)) {
      return NextResponse.json({ ok: true, updated: 0, category: to });
    }

    const result = await prisma.product.updateMany({
      where: {
        AND: [categoryWhere(from), { deletedAt: null }],
      },
      data: {
        categoria: to,
        updatedById: session.id,
      },
    });

    await createAuditLog({
      action: AuditAction.PRODUCT_UPDATED,
      entity: 'Category',
      actorId: session.id,
      metadata: {
        from,
        to,
        updatedProducts: result.count,
      },
    });

    return NextResponse.json({ ok: true, updated: result.count, category: to });
  } catch (error) {
    return jsonServerError('CATEGORIES_PATCH', 'No se pudo editar la categoría', error);
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, ADMIN_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rateLimit = checkRateLimit({ key: `categories:delete:${session.id}`, ...CATEGORY_WRITE_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const body = await request.json();
    const category = normalizeCategoryName(String(body?.category || ''));

    if (category.length < 2) {
      return NextResponse.json({ error: 'Categoría inválida' }, { status: 400 });
    }

    if (normalizeCategoryKey(category) === normalizeCategoryKey(FALLBACK_CATEGORY)) {
      return NextResponse.json(
        { error: `No se puede eliminar "${FALLBACK_CATEGORY}" porque se usa como categoría de respaldo.` },
        { status: 400 }
      );
    }

    const result = await prisma.product.updateMany({
      where: {
        AND: [categoryWhere(category), { deletedAt: null }],
      },
      data: {
        categoria: FALLBACK_CATEGORY,
        updatedById: session.id,
      },
    });

    await createAuditLog({
      action: AuditAction.PRODUCT_UPDATED,
      entity: 'Category',
      actorId: session.id,
      metadata: {
        deletedCategory: category,
        movedTo: FALLBACK_CATEGORY,
        updatedProducts: result.count,
      },
    });

    return NextResponse.json({ ok: true, updated: result.count, movedTo: FALLBACK_CATEGORY });
  } catch (error) {
    return jsonServerError('CATEGORIES_DELETE', 'No se pudo eliminar la categoría', error);
  }
}
