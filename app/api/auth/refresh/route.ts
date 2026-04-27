import { NextResponse } from 'next/server';
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  getRefreshSession,
  getRefreshTokenFromCookies,
  hashRefreshToken,
  signAuthToken,
  signRefreshToken,
} from '@/lib/auth';
import { checkRateLimit, getClientIp, jsonServerError, rateLimitResponse } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

function clearAuthCookies(response: NextResponse) {
  [AUTH_COOKIE_NAME, AUTH_REFRESH_COOKIE_NAME].forEach((name) => {
    response.cookies.set({
      name,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({ key: `auth:refresh:${ip}`, limit: 30, windowMs: 60 * 1000 });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const refreshToken = await getRefreshTokenFromCookies();
    const refreshSession = await getRefreshSession();

    if (!refreshToken || !refreshSession) {
      const response = NextResponse.json({ error: 'Sesión expirada' }, { status: 401 });
      clearAuthCookies(response);
      return response;
    }

    const storedRefreshToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(refreshToken) },
    });

    if (!storedRefreshToken || storedRefreshToken.expiresAt <= new Date()) {
      const response = NextResponse.json({ error: 'Sesión expirada' }, { status: 401 });
      clearAuthCookies(response);
      return response;
    }

    if (storedRefreshToken.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedRefreshToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      const response = NextResponse.json({ error: 'Sesión expirada' }, { status: 401 });
      clearAuthCookies(response);
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { id: refreshSession.id },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user || user.id !== storedRefreshToken.userId) {
      await prisma.refreshToken.update({
        where: { id: storedRefreshToken.id },
        data: { revokedAt: new Date() },
      });

      const response = NextResponse.json({ error: 'Sesión expirada' }, { status: 401 });
      clearAuthCookies(response);
      return response;
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const [accessToken, newRefreshTokenData] = await Promise.all([
      signAuthToken(tokenPayload),
      signRefreshToken(tokenPayload),
    ]);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedRefreshToken.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          jti: newRefreshTokenData.jti,
          tokenHash: newRefreshTokenData.tokenHash,
          userId: user.id,
          expiresAt: newRefreshTokenData.expiresAt,
        },
      }),
    ]);

    const response = NextResponse.json({ ok: true, user: tokenPayload, expiresIn: ACCESS_TOKEN_MAX_AGE_SECONDS });

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
      value: newRefreshTokenData.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    return jsonServerError('AUTH_REFRESH_POST', 'No se pudo renovar la sesión', error);
  }
}
