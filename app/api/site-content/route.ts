import { AuditAction, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, jsonServerError, rateLimitResponse } from '@/lib/api-helpers';
import { createAuditLog } from '@/lib/audit-log';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { getSiteContent } from '@/lib/site-content';
import { prisma } from '@/lib/prisma';
import { siteContentInputSchema } from '@/lib/validators';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];
const SITE_CONTENT_READ_LIMIT = { limit: 120, windowMs: 60 * 1000 };
const SITE_CONTENT_WRITE_LIMIT = { limit: 30, windowMs: 60 * 1000 };

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({ key: `site-content:read:${ip}`, ...SITE_CONTENT_READ_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const content = await getSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    return jsonServerError('SITE_CONTENT_GET', 'No se pudo cargar el contenido visual', error);
  }
}

export async function PUT(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rateLimit = checkRateLimit({ key: `site-content:update:${session.id}`, ...SITE_CONTENT_WRITE_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const body = await request.json();
    const parsed = siteContentInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.siteContent.upsert({
      where: { id: 'home' },
      update: parsed.data,
      create: { id: 'home', ...parsed.data },
    });

    await createAuditLog({
      action: AuditAction.SITE_CONTENT_UPDATED,
      entity: 'SiteContent',
      entityId: updated.id,
      actorId: session.id,
      metadata: {
        promoEnabled: updated.promoEnabled,
        promoText: updated.promoText,
        heroTitle: `${updated.heroTitlePrefix} ${updated.heroTitleAccent} ${updated.heroTitleSuffix}`.trim(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return jsonServerError('SITE_CONTENT_PUT', 'No se pudo guardar el contenido visual', error);
  }
}
