# 모니터링 및 로깅 설정 가이드

이 문서는 Vercel과 GitHub를 활용한 무료 모니터링 및 로깅 도구 설정 방법을 설명합니다.

## 📊 설정된 모니터링 도구

### 1. Vercel Speed Insights
**목적**: 실시간 성능 메트릭 수집 (Core Web Vitals)

**설정 상태**: ✅ 완료
- 패키지: `@vercel/speed-insights`
- 위치: `app/layout.tsx`
- 자동 활성화: Vercel 배포 시 자동으로 활성화됨

**확인 방법**:
1. Vercel Dashboard → 프로젝트 선택
2. Analytics 탭 → Speed Insights
3. 실시간 성능 데이터 확인 가능

**수집되는 메트릭**:
- **LCP** (Largest Contentful Paint): 최대 콘텐츠 렌더링 시간
- **FID** (First Input Delay): 첫 입력 지연 시간
- **CLS** (Cumulative Layout Shift): 누적 레이아웃 이동
- **FCP** (First Contentful Paint): 첫 콘텐츠 렌더링 시간
- **TTFB** (Time to First Byte): 첫 바이트까지의 시간

### 2. Vercel Analytics
**목적**: 웹 바이탈 및 사용자 분석

**설정 상태**: ✅ 완료
- 패키지: `@vercel/analytics`
- 위치: `app/layout.tsx`
- 자동 활성화: Vercel 배포 시 자동으로 활성화됨

**확인 방법**:
1. Vercel Dashboard → 프로젝트 선택
2. Analytics 탭
3. 페이지뷰, 세션, 사용자 행동 분석 확인

**수집되는 데이터**:
- 페이지뷰 수
- 고유 방문자 수
- 평균 세션 시간
- 이탈률
- 인기 페이지

### 3. Vercel Logs
**목적**: 서버리스 함수 로그 및 에러 추적

**설정 상태**: ✅ 자동 활성화 (추가 설정 불필요)

**확인 방법**:
1. Vercel Dashboard → 프로젝트 선택
2. Logs 탭
3. 실시간 로그 스트림 확인

**로그 레벨**:
- `console.log()` → Info 레벨
- `console.error()` → Error 레벨
- `console.warn()` → Warning 레벨

**사용 예시**:
```typescript
// API 라우트에서 로깅
export async function GET(request: Request) {
  console.log('[API] GET request received', { url: request.url });
  
  try {
    // 로직 실행
    return Response.json({ success: true });
  } catch (error) {
    console.error('[API] Error occurred', { error, url: request.url });
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### 4. GitHub Actions CI/CD
**목적**: 자동화된 빌드, 테스트, 보안 스캔

**설정 상태**: ✅ 완료
- 위치: `.github/workflows/`

**워크플로우**:
1. **CI/CD Pipeline** (`.github/workflows/ci.yml`)
   - 빌드 검증
   - TypeScript 타입 체크
   - ESLint 검사
   - 보안 스캔

2. **Code Quality** (`.github/workflows/code-quality.yml`)
   - 코드 품질 검사
   - 빌드 크기 분석

3. **Dependabot Auto-merge** (`.github/workflows/dependabot-auto-merge.yml`)
   - 보안 업데이트 자동 머지

**확인 방법**:
1. GitHub 저장소 → Actions 탭
2. 각 워크플로우 실행 상태 확인
3. 실패 시 알림 받기 (GitHub 설정에서 활성화)

### 5. GitHub Dependabot
**목적**: 의존성 보안 취약점 자동 감지 및 업데이트

**설정 상태**: ✅ 완료
- 위치: `.github/dependabot.yml`

**기능**:
- 주간 보안 스캔 (매주 월요일 09:00)
- 취약점 발견 시 자동 PR 생성
- 프로덕션/개발 의존성 그룹화

**확인 방법**:
1. GitHub 저장소 → Security 탭
2. Dependabot alerts 확인
3. 자동 생성된 PR 확인

## 🔍 로그 확인 방법

### Vercel Dashboard
1. **실시간 로그**:
   - Vercel Dashboard → 프로젝트 → Logs
   - 실시간 스트림 확인
   - 필터링: 환경(Production/Preview), 함수, 로그 레벨

2. **배포 로그**:
   - Vercel Dashboard → 프로젝트 → Deployments
   - 각 배포의 빌드 로그 확인

3. **함수 로그**:
   - Vercel Dashboard → 프로젝트 → Functions
   - 각 함수별 실행 로그 및 메트릭 확인

### GitHub Actions
1. **워크플로우 실행 로그**:
   - GitHub 저장소 → Actions 탭
   - 각 워크플로우 실행 클릭
   - 단계별 로그 확인

2. **보안 알림**:
   - GitHub 저장소 → Security → Dependabot alerts
   - 취약점 상세 정보 확인

## 📈 성능 모니터링

### Core Web Vitals 확인
1. Vercel Dashboard → Analytics → Speed Insights
2. 다음 메트릭 확인:
   - **LCP**: < 2.5초 (Good)
   - **FID**: < 100ms (Good)
   - **CLS**: < 0.1 (Good)

### 사용자 분석
1. Vercel Dashboard → Analytics
2. 다음 데이터 확인:
   - 페이지뷰 트렌드
   - 인기 페이지
   - 사용자 경로
   - 디바이스/브라우저 분포

## 🚨 알림 설정

### GitHub 알림
1. GitHub 저장소 → Settings → Notifications
2. 다음 알림 활성화:
   - Security alerts
   - Dependabot alerts
   - Actions workflow runs

### Vercel 알림
1. Vercel Dashboard → Settings → Notifications
2. 다음 알림 활성화:
   - Deployment failures
   - Function errors
   - Performance degradation

## 🔒 보안 모니터링

### 자동 보안 스캔
- **Dependabot**: 주간 자동 스캔
- **GitHub Actions**: PR마다 보안 스캔 실행
- **npm audit**: 빌드 시 자동 실행

### 수동 보안 검사
```bash
# 의존성 취약점 검사
npm audit

# 심각한 취약점만 확인
npm audit --audit-level=high

# 자동 수정 가능한 취약점 수정
npm audit fix
```

## 📝 로깅 모범 사례

### 1. 구조화된 로깅
```typescript
// 좋은 예
console.log('[API] User login', { 
  userId: user.id, 
  timestamp: new Date().toISOString() 
});

// 나쁜 예
console.log('User logged in');
```

### 2. 에러 로깅
```typescript
try {
  // 로직
} catch (error) {
  console.error('[API] Error in user login', {
    error: error.message,
    stack: error.stack,
    userId: user?.id,
    timestamp: new Date().toISOString()
  });
  throw error;
}
```

### 3. 성능 로깅
```typescript
const startTime = Date.now();
// 작업 수행
const duration = Date.now() - startTime;
console.log('[Performance] Database query', { 
  duration, 
  query: 'getUser' 
});
```

## 🛠️ 추가 도구 (선택사항)

### Sentry (에러 추적)
무료 티어 제공 (5,000 events/월)
```bash
npm install @sentry/nextjs
```

### Logtail (구조화된 로깅)
무료 티어 제공 (1GB/월)
- Vercel과 통합 가능
- 구조화된 로그 쿼리

### Better Stack (모니터링)
무료 티어 제공
- Uptime 모니터링
- 로그 집계
- 알림

## 📚 참고 자료

- [Vercel Analytics 문서](https://vercel.com/docs/analytics)
- [Vercel Speed Insights 문서](https://vercel.com/docs/speed-insights)
- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Dependabot 문서](https://docs.github.com/en/code-security/dependabot)

## 🔄 정기 점검 사항

### 주간
- [ ] Dependabot 알림 확인
- [ ] 성능 메트릭 리뷰
- [ ] 에러 로그 확인

### 월간
- [ ] 보안 취약점 리뷰
- [ ] 성능 트렌드 분석
- [ ] 사용자 분석 리뷰
- [ ] 로그 보관 정책 확인

