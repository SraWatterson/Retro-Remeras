import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const prisma = new PrismaClient();

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@retroremeras.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin#Retro2026!';

  const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
  if (!strongPasswordPattern.test(adminPassword)) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 10 caracteres, mayúscula, minúscula, número y símbolo.');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      name: 'Administrador',
    },
  });

  const productsPath = path.join(process.cwd(), 'public', 'data', 'products.json');
  const rawProducts = await fs.readFile(productsPath, 'utf-8');
  const products = JSON.parse(rawProducts);

  for (const product of products) {
    const slug = product.slug ? String(product.slug) : `${toSlug(product.nombre)}-${product.id}`;

    await prisma.product.upsert({
      where: { slug },
      update: {
        legacyId: Number(product.id) || null,
        nombre: String(product.nombre || ''),
        categoria: String(product.categoria || 'Variados'),
        precio: Number(product.precio) || 0,
        imagen: product.imagen ? `/${String(product.imagen).replace(/^\/+/, '')}` : null,
        imagenesPorColor: product.imagenesPorColor || {},
        descripcion: String(product.descripcion || ''),
        disponible: Boolean(product.disponible),
        destacado: Boolean(product.destacado),
        activo: true,
        updatedById: admin.id,
      },
      create: {
        legacyId: Number(product.id) || null,
        slug,
        nombre: String(product.nombre || ''),
        categoria: String(product.categoria || 'Variados'),
        precio: Number(product.precio) || 0,
        imagen: product.imagen ? `/${String(product.imagen).replace(/^\/+/, '')}` : null,
        imagenesPorColor: product.imagenesPorColor || {},
        descripcion: String(product.descripcion || ''),
        disponible: Boolean(product.disponible),
        destacado: Boolean(product.destacado),
        activo: true,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }

  console.info(`Seed completado. Admin: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
