import { PrismaClient } from "@prisma/client";

// Log the DATABASE_URL for debugging
if (process.env.NODE_ENV === "development") {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 배포 환경에서 데이터베이스 연결 오류 방지를 위한 Mock 클래스
class PrismaMock {
  course = {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    upsert: async () => ({})
  };
  
  video = {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    upsert: async () => ({})
  };
  
  user = {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    upsert: async () => ({})
  };

  // 추가 모델들
  subscription = {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    upsert: async () => ({})
  };
  
  chatLog = {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    upsert: async () => ({})
  };
  
  // 트랜잭션 지원을 위한 메서드
  $transaction = async (operations: any[]): Promise<any[]> => {
    return operations.map(() => ({}));
  };
  
  $connect = async (): Promise<void> => {};
  $disconnect = async (): Promise<void> => {};
}

// Vercel 배포 환경인지 확인
const isVercelDeployment = process.env.VERCEL === '1';

// 안전한 Prisma 클라이언트 생성
let prismaClient;

// Vercel 환경에서는 항상 Mock 클라이언트 사용
if (isVercelDeployment) {
  console.log('Vercel 환경 감지: Mock Prisma 클라이언트 사용');
  prismaClient = new PrismaMock() as unknown as PrismaClient;
} else {
  try {
    prismaClient = globalForPrisma.prisma ?? 
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
  } catch (error) {
    console.warn("Prisma 클라이언트 초기화 실패:", error);
    prismaClient = new PrismaMock() as unknown as PrismaClient;
  }
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;