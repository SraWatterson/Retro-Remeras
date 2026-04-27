import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip')?.trim();
  return forwardedFor || realIp || 'unknown';
}

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(limit - 1, 0), resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return { allowed: true, remaining: Math.max(limit - current.count, 0), resetAt: current.resetAt };
}

export function rateLimitResponse(resetAt: number) {
  const retryAfterSeconds = Math.max(Math.ceil((resetAt - Date.now()) / 1000), 1);

  return NextResponse.json(
    { error: 'Demasiadas solicitudes. Intentá nuevamente en unos segundos.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    }
  );
}

export function logApiError(scope: string, error: unknown) {
  const errorId = randomUUID();
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${scope}] ${errorId}: ${message}`, error);
  return errorId;
}

export function jsonServerError(scope: string, publicMessage: string, error: unknown) {
  const errorId = logApiError(scope, error);
  return NextResponse.json({ error: publicMessage, errorId }, { status: 500 });
}

export function parsePositiveInt(value: string | null, fallback: number, max?: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return typeof max === 'number' ? Math.min(parsed, max) : parsed;
}
