import { z } from 'zod';
import { normalizeColorSlug, normalizeHexColor } from '@/lib/colors';

export const strongPasswordSchema = z
  .string()
  .min(10, 'La contraseña debe tener al menos 10 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula')
  .regex(/[a-z]/, 'La contraseña debe incluir al menos una minúscula')
  .regex(/[0-9]/, 'La contraseña debe incluir al menos un número')
  .regex(/[^A-Za-z0-9]/, 'La contraseña debe incluir al menos un carácter especial');

export const loginSchema = z.object({
  email: z.email('Email inválido').trim().toLowerCase(),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

const relativeOrAbsoluteImagePath = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) =>
      value.startsWith('/uploads/products/') ||
      value.startsWith('/uploads/home/') ||
      value.startsWith('/assets/') ||
      value.startsWith('https://') ||
      value.startsWith('http://'),
    'La imagen debe ser una ruta pública válida o una URL'
  );

const colorImageValueSchema = z.union([
  relativeOrAbsoluteImagePath,
  z.object({
    colorSlug: z.string().trim().min(1).transform((value) => normalizeColorSlug(value)),
    colorName: z.string().trim().min(1),
    colorHex: z.string().trim().min(1).transform((value) => normalizeHexColor(value)).refine(Boolean, 'Color hexadecimal inválido'),
    path: relativeOrAbsoluteImagePath,
  }),
]);

const imageByColorSchema = z.record(z.string().trim().min(1), colorImageValueSchema).default({});

const sizeGuideCellSchema = z.string().trim().max(60, 'Máximo 60 caracteres');

const sizeGuideTableSchema = z.object({
  columns: z.array(z.string().trim().min(1, 'Nombre de columna requerido').max(30, 'Máximo 30 caracteres')).min(1).max(8),
  rows: z.array(z.array(sizeGuideCellSchema).max(8)).max(24).default([]),
});

const sizeGuideSchema = z
  .object({
    regular: sizeGuideTableSchema.optional(),
    oversize: sizeGuideTableSchema.optional(),
  })
  .optional();


export const colorInputSchema = z.object({
  name: z.string().trim().min(2, 'Nombre requerido').max(40, 'Máximo 40 caracteres'),
  hex: z.string().trim().min(1).transform((value) => normalizeHexColor(value)).refine(Boolean, 'Color hexadecimal inválido'),
  activo: z.boolean().optional(),
});

export const productInputSchema = z.object({
  legacyId: z.number().int().positive().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener minúsculas, números y guiones'),
  nombre: z.string().trim().min(2),
  categoria: z.string().trim().min(2),
  precio: z.number().int().nonnegative(),
  imagen: relativeOrAbsoluteImagePath.optional().nullable(),
  imagenesPorColor: imageByColorSchema.optional(),
  sizeGuide: sizeGuideSchema,
  descripcion: z.string().trim().min(3),
  disponible: z.boolean().optional(),
  destacado: z.boolean().optional(),
  activo: z.boolean().optional(),
});

export const productUpdateSchema = productInputSchema.partial();


const publicHrefSchema = z
  .string()
  .trim()
  .max(180)
  .refine(
    (value) => !value || value.startsWith('/') || value.startsWith('https://') || value.startsWith('http://') || value.startsWith('#'),
    'El link debe ser relativo, ancla o URL válida'
  );

export const siteContentInputSchema = z.object({
  promoEnabled: z.boolean(),
  promoText: z.string().trim().min(3, 'Texto requerido').max(140, 'Máximo 140 caracteres'),
  promoHref: publicHrefSchema.optional().nullable().transform((value) => value || null),
  heroEyebrow: z.string().trim().min(2).max(80),
  heroTitlePrefix: z.string().trim().min(1).max(60),
  heroTitleAccent: z.string().trim().min(1).max(40),
  heroTitleSuffix: z.string().trim().min(1).max(80),
  heroText: z.string().trim().min(10).max(360),
  heroPrimaryButtonText: z.string().trim().min(2).max(40),
  heroPrimaryButtonHref: publicHrefSchema,
  heroSecondaryButtonText: z.string().trim().min(2).max(40),
  heroSecondaryButtonHref: publicHrefSchema,
  heroMainImage: relativeOrAbsoluteImagePath,
  heroMainImageAlt: z.string().trim().min(2).max(100),
  heroBadgeText: z.string().trim().min(2).max(80),
  heroSideImageOne: relativeOrAbsoluteImagePath,
  heroSideImageOneAlt: z.string().trim().min(2).max(100),
  heroSideImageTwo: relativeOrAbsoluteImagePath,
  heroSideImageTwoAlt: z.string().trim().min(2).max(100),
});
