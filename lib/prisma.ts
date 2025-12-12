// Prisma 클라이언트를 동적으로 로드하여 빌드 시점 검증 방지
let PrismaClient: any;
let prismaInstance: any = null;

const globalForPrisma = global as unknown as { prisma: any };

// DATABASE_URL 검증 함수
function validateDatabaseUrl(): boolean {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return false;
  }
  // PostgreSQL URL 형식 검증
  return dbUrl.startsWith('postgresql://') || 
         dbUrl.startsWith('postgres://') || 
         dbUrl.startsWith('postgresql+pooler://');
}

// Prisma 클라이언트 생성 (lazy initialization)
function getPrisma() {
  // 빌드 시점에는 Prisma를 생성하지 않음
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  if (!prismaInstance) {
    if (!validateDatabaseUrl()) {
      return null;
    }

    try {
      // 동적 import로 PrismaClient 로드
      if (!PrismaClient) {
        PrismaClient = require('@prisma/client').PrismaClient;
      }

      prismaInstance = globalForPrisma.prisma || new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prismaInstance;
      }
    } catch (error) {
      console.error('Failed to create Prisma client:', error);
      return null;
    }
  }

  return prismaInstance;
}

// Prisma 클라이언트를 Proxy로 래핑하여 lazy initialization 구현
export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) {
      // 빌드 시점이나 DATABASE_URL이 없을 때는 더미 객체 반환
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        return () => Promise.resolve([]);
      }
      throw new Error('Prisma Client is not initialized. DATABASE_URL is required.');
    }
    return client[prop];
  },
}); 