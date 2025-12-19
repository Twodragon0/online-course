// Prisma 클라이언트를 동적으로 로드하여 빌드 시점 검증 방지
import type { PrismaClient as PrismaClientType } from '@prisma/client';

let PrismaClient: typeof PrismaClientType | null = null;
let prismaInstance: PrismaClientType | null = null;

const globalForPrisma = global as unknown as { prisma: PrismaClientType | null };

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
        PrismaClient = require('@prisma/client').PrismaClient as typeof PrismaClientType;
      }

      if (!PrismaClient) {
        throw new Error('Failed to load PrismaClient');
      }

      // Prisma 7에서는 prisma.config.ts가 마이그레이션용이고,
      // 런타임에서는 환경 변수 DATABASE_URL을 자동으로 읽음
      // PrismaClient는 환경 변수에서 자동으로 연결 URL을 읽으므로 별도 옵션 불필요
      const clientOptions: {
        log?: ('query' | 'error' | 'warn')[];
      } = {
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      };

      prismaInstance = globalForPrisma.prisma || new PrismaClient(clientOptions);

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

// Prisma 클라이언트가 사용 가능한지 확인하는 헬퍼 함수
export function isPrismaAvailable(): boolean {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return false;
  }
  return validateDatabaseUrl() && getPrisma() !== null;
}

// Prisma 클라이언트를 Proxy로 래핑하여 lazy initialization 구현
export const prisma = new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) {
      // 빌드 시점이나 DATABASE_URL이 없을 때는 더미 객체 반환
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        return () => Promise.resolve([]);
      }
      // 프로덕션 환경에서는 에러를 throw하지 않고 null을 반환하는 함수 제공
      if (process.env.NODE_ENV === 'production') {
        // 더미 함수 반환 (에러 방지)
        return () => Promise.resolve([]);
      }
      throw new Error('Prisma Client is not initialized. DATABASE_URL is required.');
    }
    return (client as PrismaClientType)[prop as keyof PrismaClientType];
  },
}) as PrismaClientType; 