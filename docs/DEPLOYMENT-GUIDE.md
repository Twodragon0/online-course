# 배포 가이드

이 문서는 GitHub 및 Vercel 배포 시 필요한 설정과 문제 해결 방법을 안내합니다.

## 사전 준비사항

### 1. 필수 환경 변수 확인

배포 전에 다음 환경 변수들이 모두 설정되어 있는지 확인하세요:

#### 필수 환경 변수
- `DATABASE_URL` - PostgreSQL 데이터베이스 연결 URL
- `NEXTAUTH_SECRET` - NextAuth 시크릿 키 (최소 32자)
- `NEXTAUTH_URL` - NextAuth URL (프로덕션 도메인)
- `GOOGLE_CLIENT_ID` - Google OAuth 클라이언트 ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth 클라이언트 시크릿
- `DEEPSEEK_API_KEY` - DeepSeek AI API 키 (채팅 기능 필수)

#### 선택적 환경 변수
- `OPENAI_API_KEY` - OpenAI API 키 (Pro 플랜용)
- `STRIPE_SECRET_KEY` - Stripe 시크릿 키
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe 공개 키
- `PAYPAL_CLIENT_ID` - PayPal 클라이언트 ID
- `PAYPAL_CLIENT_SECRET` - PayPal 클라이언트 시크릿
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google Service Account 이메일
- `GOOGLE_CREDENTIALS` - Google Service Account JSON
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage 토큰
- `REDIS_URL` - Redis 연결 URL

## GitHub 배포

### 1. 코드 푸시

```bash
git add .
git commit -m "feat: DeepSeek API 통합 및 채팅 기능 개선"
git push origin main
```

### 2. GitHub Actions 확인

1. GitHub 저장소 → **Actions** 탭 이동
2. 최신 워크플로우 실행 상태 확인
3. 빌드가 성공적으로 완료되었는지 확인

**참고**: GitHub Actions는 빌드만 확인하며, 환경 변수는 Vercel에서 설정해야 합니다.

## Vercel 배포

### 1. 환경 변수 설정

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 이동
4. 다음 환경 변수들을 추가:

```bash
# 필수 환경 변수
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
```

5. 각 환경 변수에 대해 **Environment** 선택:
   - Production: 프로덕션 환경
   - Preview: 프리뷰 환경
   - Development: 개발 환경

6. **Save** 클릭

### 2. DEEPSEEK_API_KEY 설정

**중요**: 채팅 기능이 작동하려면 `DEEPSEEK_API_KEY`가 반드시 설정되어야 합니다.

1. https://platform.deepseek.com 에서 API 키 발급
2. API 키는 `sk-`로 시작하는 형식입니다
3. Vercel 환경 변수에 추가:
   ```
   Key: DEEPSEEK_API_KEY
   Value: sk-46c21...93cd (전체 API 키)
   Environment: Production, Preview, Development (모두 선택 권장)
   ```

### 3. 배포 트리거

환경 변수를 추가한 후:

1. **Deployments** 탭으로 이동
2. 최신 배포 옆의 **⋯** 메뉴 클릭
3. **Redeploy** 선택
4. 배포 완료 대기

또는 새로운 커밋을 푸시하면 자동으로 재배포됩니다.

## 배포 후 확인사항

### 1. 빌드 로그 확인

1. Vercel 대시보드 → **Deployments** → 최신 배포 클릭
2. **Build Logs** 확인
3. 에러가 있는지 확인

### 2. 런타임 로그 확인

1. Vercel 대시보드 → **Deployments** → 최신 배포 클릭
2. **Runtime Logs** 확인
3. 애플리케이션이 정상적으로 시작되었는지 확인

### 3. 기능 테스트

#### 채팅 기능 테스트
1. 배포된 사이트 접속
2. 채팅 봇 열기
3. 질문 입력
4. 응답이 정상적으로 오는지 확인

**에러 발생 시**:
- `서비스가 일시적으로 사용할 수 없습니다` → `DEEPSEEK_API_KEY` 확인
- `API 키 설정에 문제가 있습니다` → API 키 형식 확인 (`sk-`로 시작해야 함)

#### 인증 기능 테스트
1. 로그인 버튼 클릭
2. Google 로그인 시도
3. 정상적으로 로그인되는지 확인

#### 데이터베이스 연결 테스트
1. 대시보드 접속
2. 데이터가 정상적으로 로드되는지 확인

## 문제 해결

### DEEPSEEK_API_KEY 관련 오류

#### 오류: `서비스가 일시적으로 사용할 수 없습니다`
**원인**: `DEEPSEEK_API_KEY`가 설정되지 않았거나 비어있음

**해결**:
1. Vercel 대시보드 → Settings → Environment Variables
2. `DEEPSEEK_API_KEY` 확인
3. 값이 올바르게 설정되어 있는지 확인
4. **Redeploy** 실행

#### 오류: `API 키 설정에 문제가 있습니다`
**원인**: API 키 형식이 올바르지 않음

**해결**:
1. API 키가 `sk-`로 시작하는지 확인
2. 전체 API 키가 복사되었는지 확인 (일부만 복사되지 않았는지)
3. 공백이나 특수문자가 포함되지 않았는지 확인

#### 오류: `API 인증에 실패했습니다`
**원인**: API 키가 만료되었거나 잘못된 키

**해결**:
1. https://platform.deepseek.com 에서 API 키 상태 확인
2. 새로운 API 키 발급
3. Vercel 환경 변수 업데이트
4. **Redeploy** 실행

### 빌드 오류

#### 오류: `Prisma Client not generated`
**해결**:
```bash
# 로컬에서 확인
npx prisma generate
npm run build
```

#### 오류: `DATABASE_URL must start with postgresql://`
**해결**:
1. `DATABASE_URL` 형식 확인
2. `postgresql://` 또는 `postgres://`로 시작해야 함
3. Vercel Postgres 사용 시: Storage → Postgres → Connect에서 URL 복사

### 런타임 오류

#### 오류: `PrismaClientInitializationError`
**해결**:
1. `DATABASE_URL` 확인
2. 데이터베이스가 실행 중인지 확인
3. 방화벽 설정 확인 (외부 DB 사용 시)

## 환경 변수 체크리스트

배포 전 확인:

- [ ] `DATABASE_URL` 설정됨
- [ ] `NEXTAUTH_SECRET` 설정됨 (32자 이상)
- [ ] `NEXTAUTH_URL` 설정됨 (프로덕션 도메인)
- [ ] `GOOGLE_CLIENT_ID` 설정됨
- [ ] `GOOGLE_CLIENT_SECRET` 설정됨
- [ ] `DEEPSEEK_API_KEY` 설정됨 (`sk-`로 시작)
- [ ] 모든 환경 변수가 올바른 Environment에 설정됨
- [ ] 환경 변수 설정 후 Redeploy 실행됨

## 추가 리소스

- [Vercel 환경 변수 설정 가이드](./VERCEL-ENV-SETUP.md)
- [API 문서](./docs/API.md)
- [문제 해결 가이드](./docs/TROUBLESHOOTING.md)

## 지원

문제가 지속되면:
1. Vercel 로그 확인
2. GitHub Issues에 문제 보고
3. 프로젝트 관리자에게 문의




