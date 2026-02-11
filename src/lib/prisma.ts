import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL ?? '';
const urlWithTimeout = dbUrl.includes('sqlite') && !dbUrl.includes('timeout=')
  ? (dbUrl.includes('?') ? `${dbUrl}&timeout=20000` : `${dbUrl}?timeout=20000`)
  : undefined;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    ...(urlWithTimeout && { datasources: { db: { url: urlWithTimeout } } }),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
