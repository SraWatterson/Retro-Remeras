import { AuditAction, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, jsonServerError, rateLimitResponse } from '@/lib/api-helpers';
import { createAuditLog } from '@/lib/audit-log';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { landingCategoryInputSchema } from '@/lib/validators';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];
const READ_LIMIT = { limit: 120, windowMs: 60 * 1000 };
const WRITE_LIMIT = { limit: 30, windowMs: 60 * 1000 };

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit({ key: `landing-cats:read:${ip}`, ...READ_LIMIT });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const categories = await prisma.landingCategory.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return jsonServerError('LANDING_CATS_GET', 'No se pudieron cargar las categorías', error);
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rl = checkRateLimit({ key: `landing-cats:write:${session.id}`, ...WRITE_LIMIT });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await request.json();
    const parsed = landingCategoryInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.flatten() }, { status: 400 });
    }

    const category = await prisma.landingCategory.create({ data: parsed.data });

    await createAuditLog({
      action: AuditAction.LANDING_CATEGORY_CREATED,
      entity: 'LandingCategory',
      entityId: category.id,
      actorId: session.id,
      metadata: { title: category.title, slug: category.slug },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return jsonServerError('LANDING_CATS_POST', 'No se pudo crear la categoría', error);
  }
}
