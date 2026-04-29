import { AuditAction, Prisma, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit-log';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { getCategoryAliases, normalizeCategoryName } from '@/lib/category-utils';
import { checkRateLimit, getClientIp, jsonServerError, parsePositiveInt, rateLimitResponse } from '@/lib/api-helpers';
import { normalizeProductOutput } from '@/lib/product-output';
import { prisma } from '@/lib/prisma';
import { productInputSchema } from '@/lib/validators';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];
const PRODUCT_WRITE_LIMIT = { limit: 40, windowMs: 60 * 1000 };
const PRODUCT_READ_LIMIT = { limit: 180, windowMs: 60 * 1000 };

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({ key: `products:read:${ip}`, ...PRODUCT_READ_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = parsePositiveInt(searchParams.get('limit'), 20, 100);
    const search = (searchParams.get('search') || '').trim().slice(0, 80);
    const category = (searchParams.get('category') || '').trim().slice(0, 60);
    const status = (searchParams.get('status') || 'public').trim();
    const sort = (searchParams.get('sort') || 'featured').trim();
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const session = includeInactive ? await getCurrentSession() : null;
    const canSeeInactive = Boolean(session && isRoleAllowed(session.role, MANAGER_ROLES));

    const filters: Prisma.ProductWhereInput[] = [];

    if (canSeeInactive) {
      if (status === 'inactive') {
        filters.push({ OR: [{ activo: false }, { deletedAt: { not: null } }] });
      } else if (status === 'unavailable') {
        filters.push({ activo: true, disponible: false, deletedAt: null });
      } else if (status === 'active') {
        filters.push({ activo: true, deletedAt: null });
      }
    } else {
      filters.push({ activo: true, disponible: true, deletedAt: null });
    }

    if (category) {
      filters.push({ OR: getCategoryAliases(category).map((alias) => ({ categoria: { equals: alias, mode: 'insensitive' } })) });
    }

    if (search) {
      filters.push({
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { categoria: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.ProductWhereInput = filters.length ? { AND: filters } : {};

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      sort === 'price-asc'
        ? [{ precio: 'asc' }, { nombre: 'asc' }]
        : sort === 'price-desc'
          ? [{ precio: 'desc' }, { nombre: 'asc' }]
          : sort === 'newest'
            ? [{ createdAt: 'desc' }]
            : sort === 'name'
              ? [{ nombre: 'asc' }]
              : [{ destacado: 'desc' }, { nombre: 'asc' }];

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      items: products.map(normalizeProductOutput),
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    return jsonServerError('PRODUCTS_GET', 'No se pudieron cargar los productos', error);
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rateLimit = checkRateLimit({ key: `products:create:${session.id}`, ...PRODUCT_WRITE_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
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
        categoria: normalizeCategoryName(parsed.data.categoria),
        imagenesPorColor: parsed.data.imagenesPorColor || {},
        createdById: session.id,
        updatedById: session.id,
      },
    });

    await createAuditLog({
      action: AuditAction.PRODUCT_CREATED,
      entity: 'Product',
      entityId: created.id,
      actorId: session.id,
      metadata: {
        slug: created.slug,
        nombre: created.nombre,
        categoria: created.categoria,
      },
    });

    return NextResponse.json(normalizeProductOutput(created), { status: 201 });
  } catch (error) {
    return jsonServerError('PRODUCTS_POST', 'No se pudo crear el producto', error);
  }
}
