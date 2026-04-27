import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'node:crypto';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'rr_auth';
export const AUTH_REFRESH_COOKIE_NAME = 'rr_refresh';
export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 2;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type TokenType = 'access' | 'refresh';

type AuthPayload = JWTPayload & {
  sub: string;
  email: string;
  role: Role;
  name?: string | null;
  tokenType?: TokenType;
  jti?: string;
};

export type CurrentSession = {
  id: string;
  email: string;
  role: Role;
  name: string | null;
};

export type TokenUserPayload = {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
};

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret) {
    throw new Error('AUTH_JWT_SECRET no está configurado.');
  }

  return new TextEncoder().encode(secret);
}

function toSession(payload: AuthPayload): CurrentSession | null {
  if (!payload.sub || !payload.email || !payload.role) return null;

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.name || null,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

function getRefreshExpiresAt() {
  return new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_SECONDS * 1000);
}

export function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function signToken(
  payload: TokenUserPayload,
  tokenType: TokenType,
  expirationTime: string,
  jwtId?: string
) {
  const secret = getJwtSecret();
  const jti = jwtId || randomUUID();

  return new SignJWT({
    email: payload.email,
    role: payload.role,
    name: payload.name,
    tokenType,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.id)
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret);
}

export async function signAuthToken(payload: TokenUserPayload) {
  return signToken(payload, 'access', '2h');
}

export async function signRefreshToken(payload: TokenUserPayload, jwtId = randomUUID()) {
  const token = await signToken(payload, 'refresh', '7d', jwtId);

  return {
    token,
    jti: jwtId,
    tokenHash: hashRefreshToken(token),
    expiresAt: getRefreshExpiresAt(),
  };
}

export async function verifyAuthToken(token: string, expectedType: TokenType = 'access'): Promise<AuthPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }

    if (payload.tokenType && payload.tokenType !== expectedType) {
      return null;
    }

    return payload as AuthPayload;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyAuthToken(token, 'access');
  return payload ? toSession(payload) : null;
}

export async function getRefreshSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_REFRESH_COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = await verifyAuthToken(token, 'refresh');
  return payload ? toSession(payload) : null;
}

export async function getRefreshTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_REFRESH_COOKIE_NAME)?.value || null;
}

export function isRoleAllowed(currentRole: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(currentRole);
}
