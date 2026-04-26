import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Email inválido').trim().toLowerCase(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const imageByColorSchema = z.record(z.string(), z.string().min(1)).default({});

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
  imagen: z.string().trim().min(1).optional().nullable(),
  imagenesPorColor: imageByColorSchema.optional(),
  descripcion: z.string().trim().min(3),
  disponible: z.boolean().optional(),
  destacado: z.boolean().optional(),
  activo: z.boolean().optional(),
});

export const productUpdateSchema = productInputSchema.partial();
