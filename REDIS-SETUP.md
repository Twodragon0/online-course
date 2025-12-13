# Redis 설정 가이드

이 프로젝트는 Redis를 사용하여 rate limiting과 캐싱을 구현합니다. Redis는 선택적이며, 설정하지 않아도 애플리케이션이 정상적으로 동작합니다 (메모리 기반 fallback 사용).

## 무료 Redis 옵션

### 1. Upstash Redis (권장 - 무료 티어 제공)

1. [Upstash](https://upstash.com/)에 가입
2. Redis 데이터베이스 생성
3. Redis URL 복사 (예: `redis://default:xxxxx@xxxxx.upstash.io:6379`)
4. 환경 변수에 추가:
   ```bash
   REDIS_URL=redis://default:xxxxx@xxxxx.upstash.io:6379
   ```

### 2. 로컬 Redis (개발용)

#### macOS
```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
```

#### Docker
```bash
docker run -d -p 6379:6379 redis:alpine
```

로컬 Redis 사용 시:
```bash
REDIS_URL=redis://localhost:6379
```

### 3. Vercel KV (Vercel 배포 시)

Vercel에서 배포하는 경우, Vercel KV를 사용할 수 있습니다:
1. Vercel 대시보드에서 KV 스토어 생성
2. 자동으로 `KV_REST_API_URL` 환경 변수가 설정됨
3. `REDIS_URL` 대신 KV URL 사용 가능

## 환경 변수 설정

### 로컬 개발
`.env.local` 파일에 추가:
```bash
REDIS_URL=redis://localhost:6379
# 또는
REDIS_URL=redis://default:xxxxx@xxxxx.upstash.io:6379
```

### Vercel 배포
1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. `REDIS_URL` 추가

## 기능

### 1. Rate Limiting
- Redis를 사용하여 분산 환경에서도 정확한 rate limiting 제공
- Redis가 없으면 메모리 기반 fallback 사용
- 모든 API 엔드포인트에 적용

### 2. 캐싱
- Videos API 응답 캐싱 (5분 TTL)
- 데이터베이스 쿼리 부하 감소
- 빠른 응답 시간 제공

## 사용 예시

### Rate Limiting
```typescript
import { checkRateLimit, getClientIp } from '@/lib/security';

const clientIp = getClientIp(request);
const rateLimit = await checkRateLimit(`api:${clientIp}`, 10, 60000);
if (!rateLimit.allowed) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

### 캐싱
```typescript
import { getCached } from '@/lib/security';

const data = await getCached(
  'cache-key',
  async () => {
    // 데이터 가져오기
    return await fetchData();
  },
  300 // 5분 TTL
);
```

## 보안 고려사항

1. **환경 변수 보호**: `REDIS_URL`에는 인증 정보가 포함될 수 있으므로 절대 공개 저장소에 커밋하지 마세요.

2. **TLS 연결**: 프로덕션 환경에서는 `rediss://` (TLS)를 사용하는 것을 권장합니다.

3. **비밀번호**: Redis 서버에 비밀번호가 설정된 경우 URL에 포함:
   ```
   redis://:password@host:port
   ```

## 문제 해결

### Redis 연결 실패
- Redis 서버가 실행 중인지 확인
- `REDIS_URL`이 올바른지 확인
- 방화벽 설정 확인

### Rate limiting이 작동하지 않음
- Redis 연결 상태 확인
- 로그에서 에러 메시지 확인
- 메모리 기반 fallback이 작동하는지 확인

## 참고 자료

- [node-redis 문서](https://github.com/redis/node-redis)
- [Upstash 문서](https://docs.upstash.com/)
- [Redis 명령어 참조](https://redis.io/commands)

