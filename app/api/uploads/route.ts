import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getCurrentSession, isRoleAllowed } from '@/lib/auth';

const MANAGER_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

function sanitizeFileName(name: string) {
  const parsed = path.parse(name);
  const base = parsed.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);

  const extension = parsed.ext.toLowerCase();
  return `${base || 'image'}-${randomUUID().slice(0, 8)}${extension}`;
}

function isSafeUploadPath(filePath: string) {
  return filePath.startsWith('/uploads/products/');
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo inválido' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Solo se permiten imágenes' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'La imagen supera el límite de 5MB' }, { status: 400 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const fileName = sanitizeFileName(file.name || 'image.png');
    const absolutePath = path.join(UPLOAD_DIR, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absolutePath, buffer);

    const publicPath = `/uploads/products/${fileName}`;

    return NextResponse.json({ path: publicPath }, { status: 201 });
  } catch (error) {
    console.error('uploads POST error', error);
    return NextResponse.json({ error: 'No se pudo subir la imagen' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getCurrentSession();

  if (!session || !isRoleAllowed(session.role, MANAGER_ROLES)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const imagePath = String(body?.path || '');

    if (!isSafeUploadPath(imagePath)) {
      return NextResponse.json({ error: 'Ruta inválida para borrar archivo' }, { status: 400 });
    }

    const absolutePath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));

    await fs.unlink(absolutePath).catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('uploads DELETE error', error);
    return NextResponse.json({ error: 'No se pudo eliminar la imagen' }, { status: 500 });
  }
}
