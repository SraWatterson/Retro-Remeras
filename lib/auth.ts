import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'rr_auth';

type AuthPayload = JWTPayload & {
  sub: string;
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

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function signAuthToken(payload: { id: string; email: string; role: Role; name?: string | null }) {
  const secret = getJwtSecret();

  return new SignJWT({
    email: payload.email,
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub || !payload.email || !payload.role) {
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

  const payload = await verifyAuthToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.name || null,
  };
}

export function isRoleAllowed(currentRole: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(currentRole);
}
