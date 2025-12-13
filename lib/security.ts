/**
 * 보안 유틸리티 함수들
 */

import { redis } from '@/lib/redis';

// Rate limiting을 위한 간단한 메모리 기반 저장소 (fallback)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Redis 기반 Rate limiting 체크
 * @param identifier 요청 식별자 (IP 주소 또는 사용자 ID)
 * @param maxRequests 최대 요청 수
 * @param windowMs 시간 윈도우 (밀리초)
 * @returns rate limit 초과 여부
 */
async function checkRateLimitRedis(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1분
): Promise<{ allowed: boolean; remaining: number; resetTime: number } | null> {
  try {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowSeconds = Math.ceil(windowMs / 1000);

    // 카운트 증가 (키가 없으면 생성)
    const count = await redis.incr(key);
    
    // 키가 새로 생성된 경우 (count === 1) TTL 설정
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    // TTL 가져오기
    const ttl = await redis.ttl(key);
    const resetTime = now + (ttl > 0 ? ttl * 1000 : windowMs);

    if (count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - count,
      resetTime,
    };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    return null; // Redis 실패 시 null 반환하여 fallback 사용
  }
}

/**
 * 메모리 기반 Rate limiting 체크 (fallback)
 * @param identifier 요청 식별자 (IP 주소 또는 사용자 ID)
 * @param maxRequests 최대 요청 수
 * @param windowMs 시간 윈도우 (밀리초)
 * @returns rate limit 초과 여부
 */
function checkRateLimitMemory(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1분
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // 레코드가 없거나 시간 윈도우가 지난 경우
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // 요청 수가 초과한 경우
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // 요청 수 증가
  record.count++;
  rateLimitStore.set(identifier, record);

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Rate limiting 체크 (Redis 우선, 실패 시 메모리 fallback)
 * @param identifier 요청 식별자 (IP 주소 또는 사용자 ID)
 * @param maxRequests 최대 요청 수
 * @param windowMs 시간 윈도우 (밀리초)
 * @returns rate limit 초과 여부
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1분
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  // Redis 시도
  const redisResult = await checkRateLimitRedis(identifier, maxRequests, windowMs);
  if (redisResult !== null) {
    return redisResult;
  }

  // Redis 실패 시 메모리 기반 fallback
  return checkRateLimitMemory(identifier, maxRequests, windowMs);
}

/**
 * 오래된 rate limit 레코드 정리 (메모리 누수 방지)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    rateLimitStore.delete(key);
  });
}

// 주기적으로 정리 (5분마다)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * 이메일 형식 검증
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  // 기본적인 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  // 길이 제한
  if (email.length > 254) {
    return false;
  }
  return true;
}

/**
 * 비밀번호 강도 검증
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['비밀번호가 필요합니다.'] };
  }

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }

  if (password.length > 128) {
    errors.push('비밀번호는 128자를 초과할 수 없습니다.');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('비밀번호에 소문자가 포함되어야 합니다.');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('비밀번호에 대문자가 포함되어야 합니다.');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호에 숫자가 포함되어야 합니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 입력 문자열 sanitization (XSS 방지)
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // HTML 태그 제거
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * 파일 ID 검증 (Google Drive ID 형식)
 */
export function isValidFileId(fileId: string): boolean {
  if (!fileId || typeof fileId !== 'string') {
    return false;
  }
  // Google Drive ID는 보통 28-33자 알파벳/숫자
  return /^[a-zA-Z0-9_-]{28,33}$/.test(fileId);
}

/**
 * 세션 ID 검증
 */
export function isValidSessionId(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  // 세션 ID는 알파벳, 숫자, 하이픈, 언더스코어만 허용
  return /^[a-zA-Z0-9_-]{1,100}$/.test(sessionId);
}

/**
 * 카테고리 검증
 */
export function isValidCategory(category: string): boolean {
  if (!category || typeof category !== 'string') {
    return false;
  }
  // 허용된 카테고리만
  const allowedCategories = ['general', 'devsecops', 'aiSns', 'cloud'];
  return allowedCategories.includes(category.toLowerCase());
}

/**
 * 메시지 길이 및 내용 검증
 */
export function isValidMessage(message: string, maxLength: number = 5000): {
  valid: boolean;
  error?: string;
} {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: '메시지가 필요합니다.' };
  }

  if (message.trim().length === 0) {
    return { valid: false, error: '메시지는 비어있을 수 없습니다.' };
  }

  if (message.length > maxLength) {
    return {
      valid: false,
      error: `메시지는 ${maxLength}자를 초과할 수 없습니다.`,
    };
  }

  return { valid: true };
}

/**
 * IP 주소 추출 (프록시 환경 고려)
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * 환경 변수 검증
 */
export function validateEnvVar(key: string, value: string | undefined): boolean {
  if (!value || value.trim().length === 0) {
    return false;
  }
  return true;
}

/**
 * Stripe Price ID 검증
 */
export function isValidStripePriceId(priceId: string): boolean {
  if (!priceId || typeof priceId !== 'string') {
    return false;
  }
  // Stripe price ID 형식: price_xxxxx
  return /^price_[a-zA-Z0-9]{24,}$/.test(priceId);
}

/**
 * Redis 캐시 헬퍼 함수
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300 // 기본 5분
): Promise<T> {
  try {
    // 캐시에서 가져오기 시도
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    // 캐시 미스 - 데이터 가져오기
    const data = await fetcher();
    
    // 캐시에 저장 (set과 expire를 별도로 호출)
    await redis.set(key, JSON.stringify(data));
    await redis.expire(key, ttlSeconds);
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // 캐시 실패 시 직접 데이터 가져오기
    return await fetcher();
  }
}

/**
 * Redis 캐시 무효화
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => redis.del(key)));
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

