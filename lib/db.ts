import { PrismaClient } from "@prisma/client";

// Log the DATABASE_URL for debugging (only in development)
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

  account = {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    upsert: async () => ({})
  };
  
  session = {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
    count: async () => 0,
    upsert: async () => ({})
  };
  
  verificationToken = {
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
  
  $connect = async (): Promise<void> => {
    console.log('Mock Prisma client connected');
  };
  
  $disconnect = async (): Promise<void> => {
    console.log('Mock Prisma client disconnected');
  };
}

// 안전한 Prisma 클라이언트 생성
let prismaClient;

// Check if we're in a Vercel production environment
const isVercelProduction = process.env.VERCEL === '1' && process.env.NODE_ENV === 'production';

// Vercel environment에서 데이터베이스 URL이 설정되지 않은 경우 Mock 사용
if (isVercelProduction && !process.env.DATABASE_URL) {
  console.log('Warning: DATABASE_URL not set in Vercel environment, using Mock client');
  prismaClient = new PrismaMock() as unknown as PrismaClient;
} else {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('Initializing production Prisma client');
    }
    prismaClient = globalForPrisma.prisma ?? 
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });

    // Test connection
    prismaClient.$connect().then(() => {
      console.log('Prisma client connected successfully');
    }).catch((error) => {
      console.error('Prisma client connection error:', error);
      // Fall back to mock if connection fails
      prismaClient = new PrismaMock() as unknown as PrismaClient;
    });
      
  } catch (error) {
    console.warn("Prisma 클라이언트 초기화 실패:", error);
    prismaClient = new PrismaMock() as unknown as PrismaClient;
  }
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;