# Vercel 환경 변수 설정 가이드

## 필수 환경 변수

Vercel 대시보드에서 다음 환경 변수들을 설정해야 합니다:

### 1. 데이터베이스 연결
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

**중요**: 
- URL은 반드시 `postgresql://` 또는 `postgres://`로 시작해야 합니다
- Vercel Postgres를 사용하는 경우: Vercel 대시보드 → Storage → Postgres → Connect에서 자동 생성된 URL 사용
- 외부 PostgreSQL을 사용하는 경우: `postgresql://` 형식으로 입력

### 2. NextAuth 설정
```
NEXTAUTH_URL=https://edu.2twodragon.com
NEXTAUTH_SECRET=your-secret-key-here
```

**NEXTAUTH_SECRET 생성 방법**:
```bash
openssl rand -base64 32
```

### 3. Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. AI API 키 (선택사항)
```
DEEPSEEK_API_KEY=your-deepseek-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 5. Stripe (결제 기능 사용 시)
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Vercel에서 환경 변수 설정 방법

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 이동
4. 각 환경 변수 추가:
   - **Key**: 변수 이름 (예: `DATABASE_URL`)
   - **Value**: 변수 값
   - **Environment**: Production, Preview, Development (필요에 따라 선택)
5. **Save** 클릭
6. **Redeploy** 클릭하여 변경사항 적용

## 문제 해결

### DATABASE_URL 오류
- 오류: `the URL must start with the protocol postgresql:// or postgres://`
- 해결: DATABASE_URL이 올바른 형식인지 확인
- Vercel Postgres 사용 시: Storage 탭에서 연결 문자열 복사

### Google 로그인 오류
- 오류: `OAUTH_CALLBACK_HANDLER_ERROR`
- 확인사항:
  1. `GOOGLE_CLIENT_ID`와 `GOOGLE_CLIENT_SECRET`이 올바르게 설정되었는지
  2. Google Cloud Console에서 승인된 리디렉션 URI에 `https://edu.2twodragon.com/api/auth/callback/google` 추가
  3. `NEXTAUTH_URL`이 올바른 도메인으로 설정되었는지

### Prisma 연결 오류
- 오류: `PrismaClientInitializationError`
- 해결:
  1. DATABASE_URL 확인
  2. 데이터베이스가 실행 중인지 확인
  3. 방화벽 설정 확인 (외부 DB 사용 시)

## 환경 변수 확인 명령어

로컬에서 환경 변수 확인:
```bash
# .env 파일 확인
cat .env

# 특정 변수 확인
echo $DATABASE_URL
```

## 보안 주의사항

- 환경 변수는 절대 코드에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다
- Production 환경 변수는 Vercel 대시보드에서만 관리하세요


