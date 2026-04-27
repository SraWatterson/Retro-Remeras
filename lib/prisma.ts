import { PrismaClient } from '@prisma/client';
import { getEnv } from './env';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const env = getEnv();

export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}
