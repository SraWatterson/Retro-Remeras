# Retro Remeras — Next.js Fullstack

Proyecto migrado a Next.js App Router con frontend por componentes React y backend integrado en `app/api`.

## Stack

- Next.js 16
- React + TypeScript
- Prisma ORM
- PostgreSQL
- JWT en cookie HTTP-only para autenticación
- Roles: `ADMIN`, `EDITOR`, `VIEWER`

## 1) Instalación

```bash
npm install
```

## 2) Variables de entorno

Copiá el ejemplo y completá valores reales:

```bash
cp .env.example .env
```

Variables clave:

- `DATABASE_URL`: conexión PostgreSQL en formato `postgresql://USUARIO_ADMIN:CLAVE_ADMIN@HOST:PUERTO/BASE?schema=public`
- `AUTH_JWT_SECRET`: clave de firma JWT
- `ADMIN_EMAIL`: usuario administrador inicial
- `ADMIN_PASSWORD`: contraseña administrador inicial

## 3) Base de datos (Prisma)

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Esto crea el esquema y carga:

- Usuario admin inicial
- Productos desde `public/data/products.json`

## 4) Ejecutar app

```bash
npm run dev
```

Abrí `http://localhost:3000`.

## Frontend (rutas)

- `/`
- `/catalogo`
- `/producto?id=<id>`
- `/carrito`

## Backend API

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Productos

- `GET /api/products` (público)
- `POST /api/products` (`ADMIN` o `EDITOR`)
- `GET /api/products/:id` (público)
- `PATCH /api/products/:id` (`ADMIN` o `EDITOR`)
- `DELETE /api/products/:id` (`ADMIN`, borrado lógico)

## Estructura relevante

- `components/`: UI modular por dominio (`layout`, `catalog`, `product`, `cart`, `home`)
- `app/api/`: backend en Next
- `lib/auth.ts`: JWT, sesión y helpers de roles
- `lib/prisma.ts`: cliente Prisma singleton
- `lib/shop.ts`: tipos y utilidades de catálogo/carrito
- `prisma/schema.prisma`: modelos `User` y `Product`
- `prisma/seed.mjs`: seed de admin y productos

## Notas

- El antiguo flujo de scripts legacy en `public/js` quedó preservado como referencia, pero las páginas principales ya funcionan con componentes React y datos desde API + PostgreSQL.
- Si querés panel admin, podés construirlo encima de los endpoints protegidos ya creados.
