# AGENTS.md - Online Course Platform Development Guide

이 문서는 온라인 코스 플랫폼 프로젝트의 구조, 개발 가이드라인, 그리고 AI 코딩 에이전트가 프로젝트를 효과적으로 이해하고 작업할 수 있도록 필요한 정보를 제공합니다.

## 🚀 Quick Start for Agents

### Essential Commands
```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Testing & Quality
npm run type-check      # TypeScript check
npm run check-build     # Full build validation
npm run db:seed         # Seed database

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio       # Open Prisma Studio
```

### Running a Single Test
```bash
# This project uses manual testing via build/type checks
npm run type-check      # TypeScript validation
npm run check-build     # Build validation
npx prisma validate     # Schema validation
```

## 프로젝트 개요

이 프로젝트는 Next.js 14 기반의 멀티 플랫폼 생태계입니다. 여러 도메인으로 분리된 독립적인 플랫폼들이 서로 보완적인 관계를 유지하며, 사용자에게 통합된 경험을 제공합니다.

### 플랫폼 구성
- **tech.2twodragon.com** (✅ 운영 중): 기술 블로그 및 자격증 관리
- **edu.2twodragon.com** (⭐ 현재 프로젝트): 온라인 코스 플랫폼 - DevSecOps 및 클라우드 보안 강의
- **cooking.2twodragon.com** (🔮 예정): 요리 레시피 및 영상 공유
- **bit.2twodragon.com** (🔮 예정): 비트 거래 및 포트폴리오 관리

### 핵심 원칙
- **독립성**: 각 플랫폼은 독립적으로 운영 가능
- **연결성**: 플랫폼 간 데이터 및 사용자 정보 공유
- **비용 효율성**: 1인 비즈니스에 최적화된 아키텍처
- **보안성**: 플랫폼 간 통신 보안 보장

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
- **Bun**: oh-my-opencode 설치용 (선택사항)

### oh-my-opencode 설치

oh-my-opencode는 개발 도구로, Cursor IDE와 터미널에서 모두 사용할 수 있습니다.

#### 방법 1: npm 스크립트 사용 (권장)
```bash
npm run setup:oh-my-opencode
```

#### 방법 2: 직접 실행
```bash
./scripts/setup-oh-my-opencode.sh
```

#### 방법 3: 수동 실행
```bash
source ~/.zshrc && bunx oh-my-opencode install
```

**참고**: 
- Bun이 설치되어 있어야 합니다: `curl -fsSL https://bun.sh/install | bash`
- 설치 후 새 터미널을 열거나 `source ~/.zshrc`를 실행하세요
- Cursor IDE에서는 스크립트 실행 후 자동으로 적용됩니다

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

### Testing Commands
```bash
# Build validation (includes type checking)
npm run check-build

# TypeScript type checking only
npm run type-check

# Prisma schema validation
npx prisma validate

# Database seeding (for testing)
npm run db:seed
```

**Note**: This project uses build/type-check validation instead of traditional test suites. All changes must pass `npm run check-build` before deployment.

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

### TypeScript Configuration
- **Strict mode**: Enabled (`"strict": true` in tsconfig.json)
- **Path mapping**: `@/*` maps to `./*` for clean imports
- **Target**: ES5 with ESNext libraries
- **Module resolution**: Bundler (for Next.js App Router)

### Import/Export Patterns
```typescript
// Good: Group and sort imports
import { useState, useEffect } from 'react';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeInput } from '@/lib/security';
import { Button } from '@/components/ui/button';

// Bad: Mixed imports, no grouping
import { prisma } from '@/lib/prisma';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
```

### Component Structure & Patterns

#### ShadCN UI Components (MANDATORY)
- **All UI components must use ShadCN**: No custom styling for basic components
- **Installation**: `npx shadcn@latest add [component-name]`
- **Location**: `/components/ui/`
- **Variants**: Use `cva` (class-variance-authority) for variant props

```typescript
// Example: components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // ... other variants
      },
      size: {
        default: "h-10 px-4 py-2",
        // ... other sizes
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
```

#### Icons (MANDATORY)
- **Library**: Lucide React only
- **Import pattern**: `import { IconName } from "lucide-react"`
- **Size**: Controlled via `[&_svg]:size-4` in component styles

#### Utility Functions
- **Location**: `/lib/utils.ts`
- **cn function**: Required for merging Tailwind classes
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### API Route Patterns

#### Security-First Approach (MANDATORY)
```typescript
// Standard API route structure
export async function POST(request: Request) {
  try {
    // 1. Rate limiting FIRST
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`api:${clientIp}`, 10, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Input validation & sanitization
    const { data } = await request.json();
    const safeData = sanitizeInput(data);

    // 4. Business logic
    // ...

    // 5. Proper response
    return NextResponse.json({ success: true });

  } catch (error) {
    // Comprehensive error handling
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Error Handling Patterns
- **Never expose internal errors** to clients
- **Log errors** with appropriate levels
- **Use proper HTTP status codes**
- **Include rate limit headers** in responses

### Database & Prisma Patterns

#### Schema Design
- **Parameterized queries**: Always use Prisma's built-in protection
- **Relations**: Proper foreign key relationships
- **Indexes**: Add for frequently queried fields
- **Constraints**: Use database-level validation

#### Query Patterns
```typescript
// Good: Parameterized, with error handling
const user = await prisma.user.findUnique({
  where: { email: sanitizedEmail },
  include: { subscription: true }
});

// Bad: SQL injection risk (never do this)
const user = await prisma.$queryRaw`SELECT * FROM User WHERE email = ${email}`;
```

### File Naming Conventions
- **Components**: PascalCase (`VideoPlayer.tsx`, `ChatBot.tsx`)
- **Utilities**: camelCase (`video-utils.ts`, `auth-helpers.ts`)
- **API Routes**: kebab-case (`video-summary/route.ts`, `create-payment-session/route.ts`)
- **Types**: PascalCase with `Type` suffix (`UserType.ts`, `ApiResponse.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_TIMEOUT`, `MAX_RETRIES`)

### Security Guidelines (MANDATORY)

#### Input Validation & Sanitization
- **Always validate** user input on server-side
- **Use `sanitizeInput()`** from `@/lib/security` for all user data
- **Validate file uploads** and URLs
- **Check content types** and sizes

#### Rate Limiting
- **Redis-based** rate limiting preferred
- **Memory fallback** for Redis unavailability
- **Different limits** for authenticated vs anonymous users
- **Proper headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

#### Authentication & Authorization
- **NextAuth.js v4** for session management
- **Google OAuth** primary provider
- **bcrypt** for password hashing (12 rounds minimum)
- **Session validation** on every protected route

#### XSS Prevention
- **Escape HTML** before using `dangerouslySetInnerHTML`
- **Sanitize AI responses** before displaying
- **CSP headers** configured in `next.config.js`

### CSS & Styling Patterns

#### Tailwind CSS (MANDATORY)
- **Design system**: ShadCN color tokens
- **Dark mode**: Class-based (`dark:` prefixes)
- **Responsive**: Mobile-first approach
- **Custom utilities**: Add to `tailwind.config.ts`

#### CSS Variables (ShadCN Pattern)
```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}
```

### Performance Patterns

#### Image Optimization
- **Next.js Image component** for all images
- **Remote patterns** configured in `next.config.js`
- **Security headers** on image routes

#### Bundle Optimization
- **Dynamic imports** for heavy components
- **Tree shaking** enabled by default
- **Standalone output** for Docker deployment

### Environment Variables
- **Validation**: Required env vars checked at build time
- **Security**: Never commit `.env*` files
- **Naming**: `NEXT_PUBLIC_` prefix for client-side vars
- **Types**: Define in `env.d.ts` or similar

### Testing Approach
- **Build validation**: Primary testing method
- **Type checking**: `npm run type-check`
- **Schema validation**: `npx prisma validate`
- **Manual testing**: Through UI and API endpoints

### Deployment Patterns
- **Vercel**: Primary deployment platform
- **Environment separation**: Production, Preview, Development
- **Build optimization**: Standalone output for containers
- **Security headers**: Comprehensive CSP and other headers

### Error Boundaries & Monitoring
- **Client-side**: Use React Error Boundaries
- **Server-side**: Try-catch in API routes
- **Logging**: Structured logging with context
- **Monitoring**: Response times, error rates, rate limit hits

## Cursor Rules Integration

This project includes comprehensive Cursor rules (`.cursorrules`) that MUST be followed:

### OWASP Top 10 (2025) Compliance
- **A01: Broken Access Control**: Session validation, RBAC implementation
- **A02: Cryptographic Failures**: bcrypt (12 rounds), HTTPS enforcement
- **A03: Injection**: Prisma parameterized queries, input sanitization
- **A04: Insecure Design**: Rate limiting, input validation
- **A05: Security Misconfiguration**: Security headers, environment validation
- **A06: Vulnerable Components**: Regular dependency updates
- **A07: Identification and Authentication**: NextAuth.js, Google OAuth
- **A08: Software and Data Integrity**: Webhook signature verification
- **A09: Security Logging and Monitoring**: Comprehensive error logging
- **A10: Server-Side Request Forgery**: URL whitelisting, SSRF protection

### Security Implementation Requirements
- **Rate Limiting**: Redis-based with memory fallback
- **XSS Prevention**: `sanitizeInput()` for all user data
- **Input Validation**: Server-side validation mandatory
- **API Security**: Authentication + authorization on all endpoints
- **Environment Security**: No hardcoded secrets, `.env*` exclusion from git

### Forbidden Practices
- ❌ API keys hardcoded in source code
- ❌ `.env` files committed to repository
- ❌ `eval()`, `new Function()` usage
- ❌ SQL string concatenation
- ❌ HTTP usage in production
- ❌ Sensitive data in logs
- ❌ `any` type overuse
- ❌ `dangerouslySetInnerHTML` without escaping

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

## 멀티 플랫폼 아키텍처

### 플랫폼 간 통신
- 공유 데이터베이스 (PostgreSQL)를 통한 사용자 정보 공유
- API Gateway 패턴을 통한 플랫폼 간 싱크
- 싱크 클라이언트 라이브러리를 통한 통합 관리

### 비용 효율성
- **Phase 1 (초기)**: $1/월 - 무료 티어 활용
- **Phase 2 (성장기)**: $36-41/월 - 기본 Pro 플랜
- **Phase 3 (확장기)**: $107-137/월 - 고급 기능
- **Phase 4 (성숙기)**: $222-302/월 - 전체 최적화

### 비즈니스 모델
- **online-course**: 구독 모델 (Free/Pro $29/월/Enterprise $99/월)
- **tech-blog**: 광고 수익 (AdSense, 제휴)
- **cooking**: 제휴 마케팅, YouTube 수익화
- **bit-dragon**: 거래 수수료, 프리미엄 구독

자세한 내용은 [멀티 플랫폼 아키텍처 문서](./docs/MULTI-PLATFORM-ARCHITECTURE.md)를 참조하세요.

## 추가 리소스

### 프로젝트 문서
- [멀티 플랫폼 아키텍처](./docs/MULTI-PLATFORM-ARCHITECTURE.md)
- [싱크 구현 가이드](./docs/SYNC-IMPLEMENTATION-GUIDE.md)
- [빠른 참조 가이드](./docs/MULTI-PLATFORM-QUICK-REFERENCE.md)

### 외부 문서
- [Next.js 문서](https://nextjs.org/docs)
- [Prisma 문서](https://www.prisma.io/docs)
- [ShadCN UI 문서](https://ui.shadcn.com)
- [NextAuth.js 문서](https://next-auth.js.org)
- [Stripe 문서](https://stripe.com/docs)

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
