import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

// DATABASE_URL 검증 함수
function validateDatabaseUrl(): boolean {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return false;
  }
  // PostgreSQL URL 형식 검증
  const isValid = dbUrl.startsWith('postgresql://') || 
                  dbUrl.startsWith('postgres://') || 
                  dbUrl.startsWith('postgresql+pooler://');
  return isValid;
}

// Prisma 클라이언트 생성 함수 (lazy initialization)
function createPrismaClient(): PrismaClient | null {
  if (!validateDatabaseUrl()) {
    return null;
  }

  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return null;
  }
}

// Prisma 클라이언트 인스턴스 (lazy initialization)
let prismaInstance: PrismaClient | null = null;

// Prisma 클라이언트 getter (필요할 때만 생성)
function getPrisma(): PrismaClient | null {
  // 빌드 시점에는 Prisma를 생성하지 않음
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  if (!prismaInstance) {
    prismaInstance = globalForPrisma.prisma || createPrismaClient();
    if (prismaInstance && process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }
  }

  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) {
      throw new Error('Prisma Client is not initialized. DATABASE_URL is required.');
    }
    return (client as any)[prop];
  },
}); 