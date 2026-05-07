import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { AuditAction, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit-log';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';
import { checkRateLimit, jsonServerError, rateLimitResponse } from '@/lib/api-helpers';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];
const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

function sanitizeFileName(name: string, mimeType: string) {
  const parsed = path.parse(name);
  const base = parsed.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);

  const extension = MIME_TO_EXTENSION[mimeType] || '.jpg';
  return `${base || 'image'}-${randomUUID().slice(0, 8)}${extension}`;
}

function getUploadContext(value: FormDataEntryValue | null) {
  return value === 'home' ? 'home' : 'products';
}

function isSafeUploadPath(filePath: string) {
  return (filePath.startsWith('/uploads/products/') || filePath.startsWith('/uploads/home/')) && !filePath.includes('..');
}

function hasValidImageSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === 'image/jpeg') {
    return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimeType === 'image/webp') {
    return buffer.length > 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }

  return false;
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rateLimit = checkRateLimit({ key: `uploads:create:${session.id}`, limit: 25, windowMs: 60 * 1000 });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo inválido' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Formato inválido. Usá JPG, PNG o WebP.' }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: 'El archivo está vacío' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'La imagen supera el límite de 5MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!hasValidImageSignature(buffer, file.type)) {
      return NextResponse.json({ error: 'El contenido del archivo no coincide con una imagen válida' }, { status: 400 });
    }

    const context = getUploadContext(formData.get('context'));
    const uploadDir = path.join(UPLOAD_ROOT, context);

    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = sanitizeFileName(file.name || 'image', file.type);
    const absolutePath = path.join(uploadDir, fileName);

    await fs.writeFile(absolutePath, buffer);

    const publicPath = `/uploads/${context}/${fileName}`;

    await createAuditLog({
      action: AuditAction.IMAGE_UPLOADED,
      entity: 'Upload',
      entityId: publicPath,
      actorId: session.id,
      metadata: {
        fileName,
        size: file.size,
        mimeType: file.type,
        context,
      },
    });

    return NextResponse.json({ path: publicPath }, { status: 201 });
  } catch (error) {
    return jsonServerError('UPLOADS_POST', 'No se pudo subir la imagen', error);
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const rateLimit = checkRateLimit({ key: `uploads:delete:${session.id}`, limit: 40, windowMs: 60 * 1000 });

  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetAt);
  }

  try {
    const body = await request.json();
    const imagePath = String(body?.path || '');

    if (!isSafeUploadPath(imagePath)) {
      return NextResponse.json({ error: 'Ruta inválida para borrar archivo' }, { status: 400 });
    }

    const absolutePath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));

    await fs.unlink(absolutePath).catch(() => null);

    await createAuditLog({
      action: AuditAction.IMAGE_DELETED,
      entity: 'Upload',
      entityId: imagePath,
      actorId: session.id,
      metadata: { path: imagePath },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonServerError('UPLOADS_DELETE', 'No se pudo eliminar la imagen', error);
  }
}
