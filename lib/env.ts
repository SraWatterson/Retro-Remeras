import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),
  AUTH_JWT_SECRET: z.string().min(32, 'AUTH_JWT_SECRET debe tener al menos 32 caracteres'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Environment = z.infer<typeof envSchema>;

let validated: Environment | null = null;

export function getEnv(): Environment {
  if (validated) return validated;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Variables de entorno inválidas:');
    result.error.flatten().fieldErrors;
    Object.entries(result.error.flatten().fieldErrors).forEach(([key, errors]) => {
      if (errors) {
        console.error(`  - ${key}: ${errors.join(', ')}`);
      }
    });
    throw new Error('Variables de entorno no configuradas correctamente');
  }

  validated = result.data;
  return validated;
}
