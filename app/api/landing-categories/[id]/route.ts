import { AuditAction, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { checkRateLimit, jsonServerError, rateLimitResponse } from '@/lib/api-helpers';
import { createAuditLog } from '@/lib/audit-log';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { landingCategoryUpdateSchema } from '@/lib/validators';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];
const ADMIN_ROLES: Role[] = [Role.ADMIN];
const WRITE_LIMIT = { limit: 30, windowMs: 60 * 1000 };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rl = checkRateLimit({ key: `landing-cats:write:${session.id}`, ...WRITE_LIMIT });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = landingCategoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.flatten() }, { status: 400 });
    }

    const category = await prisma.landingCategory.update({
      where: { id },
      data: parsed.data,
    });

    await createAuditLog({
      action: AuditAction.LANDING_CATEGORY_UPDATED,
      entity: 'LandingCategory',
      entityId: category.id,
      actorId: session.id,
      metadata: { title: category.title, slug: category.slug },
    });

    return NextResponse.json(category);
  } catch (error) {
    return jsonServerError('LANDING_CATS_PATCH', 'No se pudo actualizar la categoría', error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || !isRoleAllowed(session.role, ADMIN_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rl = checkRateLimit({ key: `landing-cats:write:${session.id}`, ...WRITE_LIMIT });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const { id } = await params;
    const category = await prisma.landingCategory.delete({ where: { id } });

    await createAuditLog({
      action: AuditAction.LANDING_CATEGORY_DELETED,
      entity: 'LandingCategory',
      entityId: id,
      actorId: session.id,
      metadata: { title: category.title, slug: category.slug },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonServerError('LANDING_CATS_DELETE', 'No se pudo eliminar la categoría', error);
  }
}
