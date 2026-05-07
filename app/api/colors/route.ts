import { AuditAction, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit-log';
import { checkRateLimit, getClientIp, jsonServerError, rateLimitResponse } from '@/lib/api-helpers';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { DEFAULT_PRODUCT_COLORS, normalizeColorName, normalizeColorSlug, uniqueColorOptions } from '@/lib/colors';
import { prisma } from '@/lib/prisma';
import { colorInputSchema } from '@/lib/validators';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];
const COLOR_READ_LIMIT = { limit: 180, windowMs: 60 * 1000 };
const COLOR_WRITE_LIMIT = { limit: 30, windowMs: 60 * 1000 };

function isDefaultColor(slug: string) {
  return DEFAULT_PRODUCT_COLORS.some((color) => color.slug === normalizeColorSlug(slug));
}

function productUsesColor(product: { imagenesPorColor: unknown }, slug: string) {
  const imagesByColor = product.imagenesPorColor;

  if (!imagesByColor || typeof imagesByColor !== 'object' || Array.isArray(imagesByColor)) {
    return false;
  }

  return Object.entries(imagesByColor as Record<string, unknown>).some(([key, value]) => {
    if (normalizeColorSlug(key) === slug) return true;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const colorSlug = (value as { colorSlug?: unknown }).colorSlug;
      return typeof colorSlug === 'string' && normalizeColorSlug(colorSlug) === slug;
    }

    return false;
  });
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({ key: `colors:read:${ip}`, ...COLOR_READ_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const colors = await prisma.color.findMany({
      where: { activo: true },
      orderBy: [{ name: 'asc' }],
    });

    return NextResponse.json({ items: uniqueColorOptions(colors) });
  } catch (error) {
    return jsonServerError('COLORS_GET', 'No se pudieron cargar los colores', error);
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rateLimit = checkRateLimit({ key: `colors:create:${session.id}`, ...COLOR_WRITE_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const body = await request.json();
    const parsed = colorInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const name = normalizeColorName(parsed.data.name);
    const slug = normalizeColorSlug(name);

    if (!slug) {
      return NextResponse.json({ error: 'Nombre de color inválido.' }, { status: 400 });
    }

    const existingBase = DEFAULT_PRODUCT_COLORS.find((color) => color.slug === slug);
    if (existingBase) {
      return NextResponse.json({ error: `El color ${existingBase.name} ya existe.` }, { status: 409 });
    }

    const created = await prisma.color.create({
      data: {
        name,
        slug,
        hex: parsed.data.hex,
        activo: parsed.data.activo ?? true,
      },
    });

    await createAuditLog({
      action: AuditAction.COLOR_CREATED,
      entity: 'Color',
      entityId: created.id,
      actorId: session.id,
      metadata: {
        name: created.name,
        slug: created.slug,
        hex: created.hex,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un color con ese nombre.' }, { status: 409 });
    }

    return jsonServerError('COLORS_POST', 'No se pudo crear el color', error);
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rateLimit = checkRateLimit({ key: `colors:delete:${session.id}`, ...COLOR_WRITE_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = normalizeColorSlug(searchParams.get('slug') || '');

    if (!slug) {
      return NextResponse.json({ error: 'Color inválido.' }, { status: 400 });
    }

    if (isDefaultColor(slug)) {
      return NextResponse.json({ error: 'Los colores base no se pueden eliminar.' }, { status: 400 });
    }

    const color = await prisma.color.findUnique({ where: { slug } });

    if (!color) {
      return NextResponse.json({ error: 'El color no existe o ya fue eliminado.' }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        nombre: true,
        imagenesPorColor: true,
      },
    });

    const productsUsingColor = products.filter((product) => productUsesColor(product, slug));

    if (productsUsingColor.length) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar porque está usado en productos. Primero quitá ese color de esos productos.',
          products: productsUsingColor.map((product) => ({ id: product.id, nombre: product.nombre })),
        },
        { status: 409 }
      );
    }

    await prisma.color.delete({ where: { slug } });

    await createAuditLog({
      action: AuditAction.COLOR_DELETED,
      entity: 'Color',
      entityId: color.id,
      actorId: session.id,
      metadata: {
        name: color.name,
        slug: color.slug,
        hex: color.hex,
      },
    });

    return NextResponse.json({ ok: true, deleted: color });
  } catch (error) {
    return jsonServerError('COLORS_DELETE', 'No se pudo eliminar el color', error);
  }
}
