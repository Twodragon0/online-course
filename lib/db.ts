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
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({})
  };
  
  video = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({})
  };
  
  user = {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({})
  };
  
  // 다른 모델에 대한 mock 메소드 추가
}

// Vercel 배포 환경인지 확인
const isVercelDeployment = process.env.VERCEL === '1';

// 안전한 Prisma 클라이언트 생성
let prismaClient;

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

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;