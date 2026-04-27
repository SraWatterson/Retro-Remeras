import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { checkRateLimit, getClientIp, jsonServerError, rateLimitResponse } from '@/lib/api-helpers';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { getProductCategories } from '@/lib/category-queries';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];

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
