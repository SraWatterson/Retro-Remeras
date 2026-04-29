import { AuditAction, Prisma, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { checkRateLimit, getClientIp, jsonServerError, parsePositiveInt, rateLimitResponse } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

const ADMIN_ROLES: Role[] = [Role.ADMIN];
const AUDIT_READ_LIMIT = { limit: 90, windowMs: 60 * 1000 };

function getDateFrom(range: string | null) {
  const now = new Date();

  if (range === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (range === '7d') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  if (range === '30d') {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return null;
}

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, ADMIN_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({ key: `audit:read:${session.id}:${ip}`, ...AUDIT_READ_LIMIT });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = parsePositiveInt(searchParams.get('limit'), 10, 50);
    const action = (searchParams.get('action') || '').trim();
    const range = (searchParams.get('range') || '').trim();
    const search = (searchParams.get('search') || '').trim().slice(0, 80);
    const dateFrom = getDateFrom(range);

    const filters: Prisma.AuditLogWhereInput[] = [];
    const validActions = Object.values(AuditAction) as string[];

    if (action && action !== 'all' && validActions.includes(action)) {
      filters.push({ action: action as AuditAction });
    }

    if (dateFrom) {
      filters.push({ createdAt: { gte: dateFrom } });
    }

    if (search) {
      filters.push({
        OR: [
          { entity: { contains: search, mode: 'insensitive' } },
          { entityId: { contains: search, mode: 'insensitive' } },
          { actorId: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.AuditLogWhereInput = filters.length ? { AND: filters } : {};

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          actorId: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    return jsonServerError('AUDIT_GET', 'No se pudo cargar la auditoría', error);
  }
}
