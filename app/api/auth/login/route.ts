import { AuditAction } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit-log';
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  signAuthToken,
  signRefreshToken,
  verifyPassword,
} from '@/lib/auth';
import { checkRateLimit, getClientIp, jsonServerError, rateLimitResponse } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validators';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({ key: `auth:login:${ip}`, limit: 10, windowMs: 60 * 1000 });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      await createAuditLog({
        action: AuditAction.LOGIN_FAILED,
        entity: 'User',
        metadata: { email: parsed.data.email, reason: 'user_not_found' },
      });
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);

    if (!isValidPassword) {
      await createAuditLog({
        action: AuditAction.LOGIN_FAILED,
        entity: 'User',
        entityId: user.id,
        metadata: { email: user.email, reason: 'invalid_password' },
      });
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const [accessToken, refreshTokenData] = await Promise.all([
      signAuthToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    await prisma.$transaction([
      prisma.refreshToken.deleteMany({
        where: {
          userId: user.id,
          OR: [
            { expiresAt: { lt: new Date() } },
            { revokedAt: { not: null } },
          ],
        },
      }),
      prisma.refreshToken.create({
        data: {
          jti: refreshTokenData.jti,
          tokenHash: refreshTokenData.tokenHash,
          userId: user.id,
          expiresAt: refreshTokenData.expiresAt,
        },
      }),
    ]);

    const response = NextResponse.json({
      ok: true,
      user: tokenPayload,
      expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });

    response.cookies.set({
      name: AUTH_REFRESH_COOKIE_NAME,
      value: refreshTokenData.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    await createAuditLog({
      action: AuditAction.LOGIN_SUCCESS,
      entity: 'User',
      entityId: user.id,
      actorId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    return response;
  } catch (error) {
    return jsonServerError('AUTH_LOGIN_POST', 'No se pudo iniciar sesión', error);
  }
}
