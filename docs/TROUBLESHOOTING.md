# 문제 해결 가이드

## 도메인 관련 문제

### edu.2twodragon.com에서 홈 화면 에러 발생

#### 1. Vercel 로그 확인

**웹 대시보드에서:**
1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. **Deployments** 탭 → 최근 배포 선택
4. **Functions** 또는 **Runtime Logs** 확인

**CLI에서:**
```bash
# Vercel CLI 설치 (없는 경우)
npm i -g vercel

# 로그인
vercel login

# 로그 확인
vercel logs [프로젝트명] --follow
```

#### 2. GitHub Actions 로그 확인

1. GitHub 저장소 접속: https://github.com/Twodragon0/online-course
2. **Actions** 탭 클릭
3. 최근 워크플로우 실행 선택
4. 빌드 및 배포 단계 확인
5. 에러 메시지 확인

#### 3. 환경 변수 확인

Vercel 대시보드에서 다음 환경 변수 확인:

**필수 환경 변수:**
- `NEXTAUTH_URL`: `https://edu.2twodragon.com` 또는 비워두기 (동적 처리)
- `NEXTAUTH_SECRET`: 설정되어 있어야 함
- `DATABASE_URL`: 올바른 형식인지 확인
- `GOOGLE_CLIENT_ID`: 설정되어 있어야 함
- `GOOGLE_CLIENT_SECRET`: 설정되어 있어야 함

**확인 방법:**
1. Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**
2. Production 환경의 변수 확인
3. 각 변수가 올바르게 설정되었는지 확인

#### 4. 도메인 설정 확인

**Vercel 도메인 설정:**
1. Vercel 대시보드 → 프로젝트 → **Settings** → **Domains**
2. `edu.2twodragon.com`이 추가되어 있는지 확인
3. DNS 설정이 올바른지 확인:
   - A 레코드 또는 CNAME 레코드가 Vercel을 가리키는지 확인

**DNS 확인 명령어:**
```bash
# DNS 레코드 확인
dig edu.2twodragon.com
nslookup edu.2twodragon.com
```

#### 5. Google OAuth 설정 확인

Google Cloud Console에서:
1. APIs & Services → Credentials
2. OAuth 2.0 Client ID 선택
3. **Authorized redirect URIs**에 다음이 포함되어 있는지 확인:
   - `https://edu.2twodragon.com/api/auth/callback/google`
   - `https://twodragon.vercel.app/api/auth/callback/google`

#### 6. 일반적인 해결 방법

**방법 1: 환경 변수 재설정**
1. Vercel 대시보드에서 `NEXTAUTH_URL` 확인/수정
2. **Redeploy** 클릭

**방법 2: 재배포**
1. Vercel 대시보드 → **Deployments**
2. 최근 배포의 **⋯** 메뉴 → **Redeploy**

**방법 3: 빌드 로그 확인**
1. 배포 로그에서 빌드 에러 확인
2. TypeScript/ESLint 에러가 있는지 확인
3. 환경 변수 누락 에러가 있는지 확인

#### 7. 브라우저 콘솔 확인

1. `edu.2twodragon.com` 접속
2. 브라우저 개발자 도구 열기 (F12)
3. **Console** 탭에서 에러 메시지 확인
4. **Network** 탭에서 실패한 요청 확인

#### 8. Next.js 빌드 로컬 테스트

```bash
# 환경 변수 설정
cp .env.example .env.local

# .env.local 파일 수정
NEXTAUTH_URL=https://edu.2twodragon.com
# ... 기타 환경 변수

# 빌드 테스트
npm run build

# 에러가 있으면 확인 및 수정
```

## 일반적인 에러 및 해결

### 1. NEXTAUTH_URL 관련 에러

**에러 메시지:**
- `NEXTAUTH_URL is required`
- `Invalid NEXTAUTH_URL`

**해결:**
- Vercel 환경 변수에서 `NEXTAUTH_URL` 설정
- 또는 환경 변수에서 제거하여 동적 처리 활성화

### 2. 데이터베이스 연결 에러

**에러 메시지:**
- `PrismaClientInitializationError`
- `Can't reach database server`

**해결:**
- `DATABASE_URL` 형식 확인
- 데이터베이스 서버 상태 확인
- 방화벽 설정 확인 (외부 DB 사용 시)

### 3. CORS 에러

**에러 메시지:**
- `CORS policy: No 'Access-Control-Allow-Origin' header`

**해결:**
- `middleware.ts`의 허용된 도메인 목록 확인
- 요청하는 도메인이 허용 목록에 있는지 확인

### 4. 빌드 실패

**에러 메시지:**
- TypeScript 에러
- ESLint 에러
- 의존성 에러

**해결:**
```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

## 로그 확인 명령어 요약

```bash
# Vercel 로그 (CLI)
vercel logs [프로젝트명]

# GitHub Actions 로그는 웹에서 확인
# https://github.com/Twodragon0/online-course/actions

# 로컬 빌드 테스트
npm run build

# 환경 변수 확인 (로컬)
cat .env.local
```

## 추가 도움말

- [Vercel 문서](https://vercel.com/docs)
- [NextAuth.js 문서](https://next-auth.js.org)
- [Next.js 문서](https://nextjs.org/docs)



