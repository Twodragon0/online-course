import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// DATABASE_URL 검증 함수
function validateDatabaseUrl(): boolean {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return false;
  }
  // PostgreSQL URL 형식 검증
  return dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql+pooler://');
}

// Prisma 클라이언트 생성 (DATABASE_URL이 유효한 경우에만)
let prismaInstance: PrismaClient | null = null;

if (validateDatabaseUrl()) {
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} else {
  console.warn('DATABASE_URL is not set or invalid. Prisma operations will fail.');
}

export const prisma = prismaInstance as PrismaClient; 