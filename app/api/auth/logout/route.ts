import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, AUTH_REFRESH_COOKIE_NAME, getRefreshTokenFromCookies, hashRefreshToken } from '@/lib/auth';
import { jsonServerError } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookies();

    if (refreshToken) {
      await prisma.refreshToken
        .update({
          where: { tokenHash: hashRefreshToken(refreshToken) },
          data: { revokedAt: new Date() },
        })
        .catch(() => null);
    }

    const response = NextResponse.json({ ok: true });

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

    return response;
  } catch (error) {
    return jsonServerError('AUTH_LOGOUT_POST', 'No se pudo cerrar sesión', error);
  }
}
