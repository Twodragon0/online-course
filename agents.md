# Agents

이 문서는 온라인 코스 플랫폼 프로젝트의 구조, 개발 가이드라인, 그리고 AI 코딩 에이전트가 프로젝트를 효과적으로 이해하고 작업할 수 있도록 필요한 정보를 제공합니다.

## 프로젝트 개요

이 프로젝트는 Next.js 14 기반의 현대적인 온라인 코스 플랫폼입니다. DevSecOps 및 클라우드 보안 강의를 제공하며, AI 기반 채팅 어시스턴트, 비디오 재생, 구독 및 결제 기능을 포함합니다.

### 주요 기능

- 📺 **비디오 재생**: YouTube 및 Google Drive 비디오 지원
- 💬 **AI 채팅**: DeepSeek AI를 활용한 실시간 학습 어시스턴트
- 🎯 **코스 관리**: 코스 및 비디오 콘텐츠 관리
- 💳 **결제 시스템**: Stripe 및 PayPal 통합
- 🔐 **인증 및 권한**: NextAuth.js 기반 사용자 인증
- 📊 **구독 관리**: 사용자 구독 상태 추적
- 🔍 **비디오 요약**: AI 기반 비디오 요약 생성

## 기술 스택

### 프론트엔드
- **Next.js 14**: App Router 사용
- **TypeScript**: 타입 안정성 보장
- **Tailwind CSS**: 스타일링
- **shadcn/ui**: UI 컴포넌트 라이브러리
- **Lucide React**: 아이콘 라이브러리
- **Framer Motion**: 애니메이션

### 백엔드
- **Next.js API Routes**: 서버 사이드 API
- **Prisma**: ORM 및 데이터베이스 관리
- **PostgreSQL**: 메인 데이터베이스
- **Redis**: Rate limiting 및 캐싱
- **NextAuth.js**: 인증 시스템

### 외부 서비스
- **DeepSeek AI**: AI 채팅 및 요약 기능
- **OpenAI**: GPT-4 지원 (Pro 플랜)
- **Google OAuth**: 소셜 로그인
- **Stripe**: 결제 처리
- **PayPal**: 결제 처리
- **Google Drive API**: 비디오 스토리지
- **Vercel Blob**: 파일 업로드

## 개발 환경

### 필수 요구사항
- **Node.js**: >=18.17.0 <23.0.0
- **npm**: 패키지 관리자
- **PostgreSQL**: 데이터베이스
- **Redis**: Rate limiting (선택사항)

### 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정해야 합니다:

```bash
# 데이터베이스
DATABASE_URL="postgresql://user:password@localhost:5432/online-course"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI 서비스
DEEPSEEK_API_KEY="your-deepseek-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# PayPal
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"

# Google Drive
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account-email"
GOOGLE_SERVICE_ACCOUNT_KEY="your-service-account-key"

# Vercel Blob (선택사항)
BLOB_READ_WRITE_TOKEN="your-blob-token"

# Redis (선택사항)
REDIS_URL="redis://localhost:6379"
```

## 빌드 및 실행

### 개발 서버 실행
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm run start
```

### Vercel 배포용 빌드
```bash
npm run vercel-build
```

### 타입 체크
```bash
npm run type-check
```

## 데이터베이스 관리

### Prisma 스키마
데이터베이스 스키마는 `prisma/schema.prisma`에 정의되어 있습니다.

주요 모델:
- **User**: 사용자 정보 및 구독 상태
- **Course**: 코스 정보
- **Video**: 비디오 콘텐츠
- **Chat**: AI 채팅 기록
- **Subscription**: 구독 정보
- **ChatLog**: 채팅 로그

### 마이그레이션
```bash
# 마이그레이션 생성
npx prisma migrate dev --name migration-name

# 마이그레이션 적용
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate
```

### 시드 데이터
```bash
npm run db:seed
# 또는
ts-node prisma/seed.ts
```

## 코드 스타일 및 가이드라인

### 컴포넌트 구조
- 모든 UI 컴포넌트는 `/components/ui`에 위치
- 페이지 컴포넌트는 `/app` 디렉토리에 위치
- 재사용 가능한 컴포넌트는 `/components`에 위치

### ShadCN 컴포넌트 사용
- 모든 UI 컴포넌트는 ShadCN을 사용해야 합니다
- 컴포넌트 설치: `npx shadcn@latest add [component-name]`
- 컴포넌트 경로: `/components/ui`

### 아이콘 사용
- 모든 아이콘은 Lucide React를 사용해야 합니다
- Import 형식: `import { IconName } from "lucide-react"`

### TypeScript
- TypeScript strict mode 활성화
- 모든 컴포넌트와 함수에 타입 정의 필요
- `any` 타입 사용 지양

### 파일 명명 규칙
- 컴포넌트: PascalCase (예: `VideoPlayer.tsx`)
- 유틸리티: camelCase (예: `video-utils.ts`)
- API 라우트: kebab-case (예: `video-summary/route.ts`)

## API 엔드포인트

### 인증 API
- `GET/POST /api/auth/[...nextauth]`: NextAuth 인증 엔드포인트
- `POST /api/register`: 사용자 등록

### 코스 및 비디오 API
- `GET /api/videos`: 비디오 목록 조회
- `GET /api/drive/videos`: Google Drive 비디오 조회
- `POST /api/video-summary`: 비디오 요약 생성
- `POST /api/related-questions`: 관련 질문 생성

### 채팅 API
- `POST /api/chat`: AI 채팅 메시지 전송
  - Rate limit: 20회/분
  - 입력 검증 및 XSS 방지 적용

### 구독 및 결제 API
- `GET /api/subscription`: 구독 정보 조회
- `POST /api/subscription`: 구독 생성/업데이트
- `POST /api/create-payment-session`: Stripe 결제 세션 생성
- `GET /api/stripe`: Stripe 고객 정보 조회

### 웹훅
- `POST /api/webhooks/stripe`: Stripe 웹훅 처리
- `POST /api/webhooks/paypal`: PayPal 웹훅 처리

### 파일 업로드
- `POST /api/upload`: 파일 업로드
- `DELETE /api/upload/delete`: 파일 삭제

## 보안 고려사항

### 인증 및 권한
- NextAuth.js를 통한 세션 관리
- Google OAuth 인증 지원
- 비밀번호는 bcrypt로 해시화
- 모든 API 엔드포인트는 인증 및 권한 검증 필요

### Rate Limiting
- Redis 기반 rate limiting 구현
- API별 제한:
  - 채팅: 20회/분
  - 비디오 요약: 10회/분
  - 등록: 5회/분

### 입력 검증 및 Sanitization
- 모든 사용자 입력 검증 필수
- XSS 방지를 위한 입력 sanitization
- SQL Injection 방지를 위한 Prisma 파라미터화 쿼리 사용
- 파일 ID 및 URL 검증

### 보안 헤더
- Content Security Policy (CSP) 설정
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- SSRF 방지를 위한 리다이렉트 URL 검증

### 환경 변수 보안
- `.env` 파일은 버전 관리에서 제외
- 프로덕션 환경에서는 HTTPS 필수
- 민감한 정보는 환경 변수로 관리

## 아키텍처

### 디렉토리 구조
```
online-course/
├── app/                    # Next.js App Router 페이지 및 API
│   ├── api/               # API 라우트
│   ├── courses/           # 코스 페이지
│   ├── dashboard/        # 대시보드
│   └── ...
├── components/            # React 컴포넌트
│   ├── ui/               # ShadCN UI 컴포넌트
│   └── ...
├── lib/                   # 유틸리티 및 라이브러리
│   ├── auth.ts           # 인증 설정
│   ├── prisma.ts         # Prisma 클라이언트
│   ├── security.ts       # 보안 유틸리티
│   └── ...
├── prisma/                # Prisma 스키마 및 마이그레이션
├── types/                 # TypeScript 타입 정의
└── public/                # 정적 파일
```

### 데이터베이스 관계
- User ↔ Account (1:N)
- User ↔ Session (1:N)
- User ↔ Chat (1:N)
- User ↔ Subscription (1:1)
- Course ↔ Video (1:N)
- Video ↔ Chat (1:N)

## 배포

### Vercel 배포
1. Vercel 프로젝트 연결
2. 환경 변수 설정
3. 빌드 명령어: `npm run vercel-build`
4. 배포 자동화 (Git push 시 자동 배포)

### 환경 변수 설정 (Vercel)
- 모든 환경 변수를 Vercel 대시보드에 설정
- `NODE_ENV=production` 자동 설정
- `NEXTAUTH_URL`을 프로덕션 도메인으로 설정

### 데이터베이스 마이그레이션
배포 전 마이그레이션 적용:
```bash
npx prisma migrate deploy
```

## 테스트 및 품질 관리

### 빌드 검증
```bash
npm run check-build
```

### 타입 체크
```bash
npm run type-check
```

## 주요 라이브러리 및 의존성

### 핵심 의존성
- `next`: 14.2.35
- `react`: ^18
- `@prisma/client`: ^6.19.1
- `next-auth`: ^4.24.13
- `openai`: ^4.104.0
- `stripe`: ^17.7.0
- `googleapis`: ^169.0.0

### UI 라이브러리
- `@radix-ui/*`: UI 컴포넌트 프리미티브
- `tailwindcss`: CSS 프레임워크
- `lucide-react`: 아이콘
- `framer-motion`: 애니메이션

## 개발 워크플로우

### 새 기능 추가 시
1. 기능 브랜치 생성
2. 필요한 컴포넌트 및 API 라우트 작성
3. 타입 정의 추가 (`types/` 디렉토리)
4. 보안 검증 및 rate limiting 적용
5. 타입 체크 및 빌드 검증
6. Pull Request 생성

### API 라우트 작성 시
1. 입력 검증 함수 사용 (`lib/security.ts`)
2. Rate limiting 적용
3. 에러 처리 및 적절한 HTTP 상태 코드 반환
4. 로깅 추가 (민감한 정보 제외)

### 컴포넌트 작성 시
1. ShadCN 컴포넌트 우선 사용
2. TypeScript 타입 정의
3. 반응형 디자인 고려
4. 접근성 고려 (ARIA 속성 등)

## 문제 해결

### 일반적인 문제

**Prisma Client 오류**
```bash
npx prisma generate
```

**빌드 오류**
- 환경 변수 확인
- `SKIP_ENV_VALIDATION=true` 사용 (빌드 시)

**인증 오류**
- `NEXTAUTH_SECRET` 길이 확인 (최소 32자)
- `NEXTAUTH_URL` 설정 확인

**데이터베이스 연결 오류**
- `DATABASE_URL` 형식 확인
- PostgreSQL 서버 실행 상태 확인

## 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [ShadCN UI 문서](https://ui.shadcn.com)
- [NextAuth.js 문서](https://next-auth.js.org)
- [Stripe 문서](https://stripe.com/docs)

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

