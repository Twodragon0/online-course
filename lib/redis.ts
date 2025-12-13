/**
 * Redis 클라이언트 초기화 및 관리
 * 무료 버전 지원: 로컬 Redis 또는 Upstash Redis
 */

import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnecting = false;

const globalForRedis = global as unknown as { redis: RedisClientType | null };

/**
 * Redis URL 검증
 */
function validateRedisUrl(): boolean {
  const redisUrl = process.env.REDIS_URL;
  // REDIS_URL이 없어도 동작하도록 (선택적)
  if (!redisUrl) {
    return false;
  }
  // Redis URL 형식 검증
  return redisUrl.startsWith('redis://') || 
         redisUrl.startsWith('rediss://') ||
         redisUrl.startsWith('redis://default:') ||
         redisUrl.includes('upstash.io');
}

/**
 * Redis 클라이언트 생성 (lazy initialization)
 */
async function getRedisClient(): Promise<RedisClientType | null> {
  // 빌드 시점에는 Redis를 생성하지 않음
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  // 이미 연결되어 있으면 반환
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  // 연결 중이면 대기
  if (isConnecting) {
    // 최대 5초 대기
    const maxWait = 5000;
    const startTime = Date.now();
    while (isConnecting && Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }
  }

  // REDIS_URL이 없으면 null 반환 (선택적 사용)
  if (!validateRedisUrl()) {
    return null;
  }

  try {
    isConnecting = true;

    // Redis 클라이언트 생성
    const client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          // 지수 백오프: 50ms, 100ms, 200ms, ...
          return Math.min(retries * 50, 1000);
        },
      },
    });

    // 에러 핸들링
    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // 연결 성공
    client.on('connect', () => {
      console.log('Redis Client Connected');
    });

    // 연결 해제
    client.on('end', () => {
      console.log('Redis Client Disconnected');
    });

    // 연결
    await client.connect();

    redisClient = client;

    // 개발 환경에서는 전역에 저장 (핫 리로드 대응)
    if (process.env.NODE_ENV !== 'production') {
      globalForRedis.redis = redisClient;
    }

    isConnecting = false;
    return redisClient;
  } catch (error) {
    isConnecting = false;
    console.error('Failed to create Redis client:', error);
    // Redis 연결 실패해도 애플리케이션은 계속 동작
    return null;
  }
}

/**
 * Redis 클라이언트를 Proxy로 래핑하여 lazy initialization 구현
 */
export const redis = new Proxy({} as any, {
  get(_target, prop) {
    // Promise를 반환하는 메서드 처리
    if (typeof prop === 'string' && ['get', 'set', 'del', 'exists', 'expire', 'ttl', 'incr', 'keys'].includes(prop)) {
      return async (...args: any[]) => {
        const client = await getRedisClient();
        if (!client) {
          // Redis가 없으면 기본값 반환 (선택적 사용)
          if (prop === 'get') return null;
          if (prop === 'exists') return 0;
          if (prop === 'incr') return 0;
          if (prop === 'ttl') return -1;
          if (prop === 'keys') return [];
          return;
        }
        try {
          return await (client as any)[prop](...args);
        } catch (error) {
          console.error(`Redis ${prop} error:`, error);
          // 에러 발생 시 기본값 반환
          if (prop === 'get') return null;
          if (prop === 'exists') return 0;
          if (prop === 'incr') return 0;
          if (prop === 'ttl') return -1;
          if (prop === 'keys') return [];
          return;
        }
      };
    }
    
    // 직접 접근이 필요한 경우
    return async (...args: any[]) => {
      const client = await getRedisClient();
      if (!client) {
        throw new Error('Redis Client is not initialized. REDIS_URL is required.');
      }
      return (client as any)[prop](...args);
    };
  },
});

/**
 * Redis 연결 종료 (graceful shutdown)
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      redisClient = null;
    } catch (error) {
      console.error('Error disconnecting Redis:', error);
    }
  }
}

/**
 * Redis 연결 상태 확인
 */
export async function isRedisConnected(): Promise<boolean> {
  try {
    const client = await getRedisClient();
    return client !== null && client.isOpen;
  } catch {
    return false;
  }
}

