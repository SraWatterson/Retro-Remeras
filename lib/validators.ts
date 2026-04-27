import { z } from 'zod';

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
      value.startsWith('/assets/') ||
      value.startsWith('https://') ||
      value.startsWith('http://'),
    'La imagen debe ser una ruta pública válida o una URL'
  );

const imageByColorSchema = z.record(z.string().trim().min(1), relativeOrAbsoluteImagePath).default({});

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
  descripcion: z.string().trim().min(3),
  disponible: z.boolean().optional(),
  destacado: z.boolean().optional(),
  activo: z.boolean().optional(),
});

export const productUpdateSchema = productInputSchema.partial();
