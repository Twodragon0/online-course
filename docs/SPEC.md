# Online Course Platform Specification

## 프로젝트 개요

**Twodragon's Online Course**는 Next.js 14 기반의 온라인 교육 플랫폼입니다.

| 항목 | 내용 |
|------|------|
| **URL** | https://edu.2twodragon.com |
| **GitHub** | https://github.com/Twodragon0/online-course |
| **주요 콘텐츠** | DevSecOps, 클라우드 보안, AI/SNS 동영상 강의, 자격증 교육 |
| **언어** | 한국어 (코드 주석 제외) |
| **연계 사이트** | https://tech.2twodragon.com (Tech Blog) |

### 플랫폼 목적

tech.2twodragon.com에서 작성된 포스팅 중 **영상 제작이 완료된 콘텐츠**를 동영상 강의 형태로 제공합니다.

| 콘텐츠 유형 | 설명 |
|------------|------|
| **DevSecOps 강의** | 보안 DevOps 실무 교육 |
| **클라우드 보안** | AWS, GCP, Azure 보안 구성 |
| **AI/SNS 활용** | AI 도구 및 SNS 마케팅 |
| **자격증 준비** | 보안 관련 자격증 대비 |

---

## 시스템 아키텍처

### 1. 기술 스택

| 계층 | 기술 | 용도 |
|------|------|------|
| **Frontend** | Next.js 14 (App Router), React 18 | SSR/SSG, 동적 라우팅 |
| **Styling** | Tailwind CSS, ShadCN UI | 반응형 디자인, UI 컴포넌트 |
| **Backend** | Next.js API Routes | REST API 엔드포인트 |
| **Database** | PostgreSQL + Prisma ORM | 사용자, 코스, 구독 데이터 |
| **Authentication** | NextAuth v4 | Google OAuth, 이메일 인증 |
| **AI Services** | DeepSeek (Primary), Gemini (Fallback), OpenAI (Pro) | AI 챗봇, 영상 요약 |
| **Payments** | Stripe, PayPal | 구독 결제 처리 |
| **Caching** | Redis (Upstash) | Rate Limiting, 세션 캐시 |
| **Hosting** | Vercel | CDN, SSL, Serverless Functions |
| **Video Storage** | Google Drive | 동영상 호스팅 |

### 2. 시스템 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                        Client                                │
│  (Browser - Next.js Frontend)                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Middleware  │  │ API Routes  │  │   Static    │         │
│  │ (Security)  │  │ (Serverless)│  │   Assets    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│ PostgreSQL│  │   Redis   │  │  Google   │
│ (Vercel)  │  │ (Upstash) │  │   Drive   │
└───────────┘  └───────────┘  └───────────┘
        │
        ▼
┌───────────────────────────────────────┐
│          External Services            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │DeepSeek │ │ Stripe  │ │ PayPal  │ │
│  │ Gemini  │ │         │ │         │ │
│  │ OpenAI  │ │         │ │         │ │
│  └─────────┘ └─────────┘ └─────────┘ │
└───────────────────────────────────────┘
```

### 3. 배포 파이프라인

```
Git Push → Vercel Build → Prisma Generate → Next.js Build → Deploy
                                    ↓
                          Database Migration (if needed)
```

---

## 데이터 모델

### ERD (Entity Relationship Diagram)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Course    │       │    Video    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ name        │       │ title       │       │ title       │
│ email       │───┐   │ description │   ┌───│ description │
│ password    │   │   │ price       │   │   │ url         │
│ image       │   │   │ imageUrl    │───┘   │ courseId    │
│ subscription│   │   │ createdAt   │       │ position    │
│ status      │   │   │ updatedAt   │       │ createdAt   │
└─────────────┘   │   └─────────────┘       └─────────────┘
       │          │                                │
       │          │   ┌─────────────┐              │
       │          └───│    Chat     │──────────────┘
       │              ├─────────────┤
       │              │ id          │
       └──────────────│ message     │
                      │ response    │
                      │ userId      │
                      │ videoId     │
                      │ createdAt   │
                      └─────────────┘

┌─────────────┐       ┌─────────────┐
│Subscription │       │   ChatLog   │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ userId      │       │ sessionId   │
│ stripeId    │       │ message     │
│ status      │       │ response    │
│ periodEnd   │       │ category    │
└─────────────┘       │ timestamp   │
                      └─────────────┘
```

### 주요 모델 설명

| 모델 | 설명 | 주요 필드 |
|------|------|----------|
| **User** | 사용자 정보 | email, subscriptionStatus, stripeCustomerId |
| **Course** | 강의 코스 | title, description, price, videos[] |
| **Video** | 개별 동영상 | title, url (Google Drive), position |
| **Chat** | AI 채팅 기록 | message, response, videoId |
| **Subscription** | 결제 구독 정보 | stripeSubscriptionId, status, periodEnd |

---

## API 엔드포인트

### 1. 인증 API

| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/auth/[...nextauth]` | ALL | NextAuth 핸들러 | - |
| `/api/register` | POST | 회원가입 | - |
| `/api/auth/refresh-session` | POST | 세션 갱신 | Required |

### 2. 코스 API

| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/courses` | GET | 코스 목록 조회 | - |
| `/api/courses` | POST | 코스 생성 | Admin |
| `/api/courses/seed` | POST | 코스 시드 데이터 | Admin |
| `/api/courses/sync-devsecops` | POST | DevSecOps 동기화 | Admin |

### 3. 동영상 API

| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/videos` | GET | 동영상 목록 | Required |
| `/api/video-summary` | POST | AI 동영상 요약 | Required |
| `/api/drive/videos` | GET | Google Drive 연동 | Admin |
| `/api/drive/analyze` | POST | 영상 분석 | Admin |

### 4. AI 챗봇 API

| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/chat` | POST | AI 채팅 | Required |
| `/api/related-questions` | POST | 관련 질문 생성 | Required |

### 5. 결제 API

| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/stripe` | POST | Stripe 세션 생성 | Required |
| `/api/create-payment-session` | POST | 결제 세션 | Required |
| `/api/subscription` | GET | 구독 상태 조회 | Required |
| `/api/webhooks/stripe` | POST | Stripe 웹훅 | Webhook |
| `/api/webhooks/paypal` | POST | PayPal 웹훅 | Webhook |

### 6. 관리자 API

| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/admin/upgrade-pro` | POST | Pro 업그레이드 | Admin |
| `/api/upload` | POST | 파일 업로드 | Admin |
| `/api/upload/delete` | DELETE | 파일 삭제 | Admin |

---

## 구독 플랜

### 플랜 비교

| 기능 | Basic (무료) | Pro ($9.99/월) |
|------|-------------|----------------|
| **동영상 시청** | 미리보기만 | 전체 액세스 |
| **AI 챗봇** | 10회/일 | 100회/일 |
| **AI 모델** | DeepSeek | DeepSeek + GPT-4 |
| **동영상 요약** | 제한적 | 무제한 |
| **관련 질문** | 3개 | 10개 |
| **자격증 문제** | - | 무제한 |
| **다운로드** | - | PDF 자료 |

### 결제 흐름

```
사용자 → 플랜 선택 → Stripe/PayPal 결제 → Webhook 수신 → DB 업데이트 → 권한 활성화
```

---

## 보안 구현

### 1. OWASP Top 10 대응

| 취약점 | 대응 방법 | 구현 위치 |
|--------|----------|----------|
| **A01: Broken Access Control** | NextAuth 세션 검증, RBAC | `middleware.ts`, API Routes |
| **A02: Cryptographic Failures** | bcrypt (salt 12), HTTPS | `lib/security.ts` |
| **A03: Injection** | Prisma ORM, sanitizeInput | `lib/security.ts` |
| **A04: Insecure Design** | Rate Limiting, Input Validation | `lib/security.ts` |
| **A05: Security Misconfiguration** | 환경변수, CSP Headers | `middleware.ts` |
| **A06: Vulnerable Components** | npm audit, Dependabot | GitHub Actions |
| **A07: Auth Failures** | Strong Password Policy | `lib/security.ts` |
| **A08: Integrity Failures** | Webhook Signature 검증 | Stripe/PayPal handlers |
| **A09: Logging Failures** | 민감정보 필터링 | All API Routes |
| **A10: SSRF** | URL Whitelist, IP Block | `middleware.ts` |

### 2. 보안 미들웨어 (`middleware.ts`)

| 기능 | 설명 |
|------|------|
| **CORS 보호** | 허용된 Origin만 허용 |
| **CSP 헤더** | XSS 방지 Content Security Policy |
| **SSRF 방지** | 내부 네트워크 IP 차단 |
| **Rate Limiting** | Redis 기반 요청 제한 |
| **세션 검증** | NextAuth 토큰 검증 |

### 3. 보안 유틸리티 (`lib/security.ts`)

| 함수 | 용도 |
|------|------|
| `sanitizeInput()` | 입력값 정제 (XSS 방지) |
| `isValidEmail()` | 이메일 형식 검증 |
| `isValidPassword()` | 비밀번호 강도 검증 |
| `checkRateLimit()` | Rate Limiting 체크 |
| `getClientIp()` | 클라이언트 IP 추출 |

### 4. XSS 방지

```typescript
// 모든 dangerouslySetInnerHTML 사용 시 필수
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

---

## AI 서비스 통합

### 1. AI 챗봇

| 항목 | Basic Plan | Pro Plan |
|------|-----------|----------|
| **Primary API** | DeepSeek | DeepSeek |
| **Fallback API** | Gemini | Gemini + OpenAI |
| **Rate Limit** | 10회/일 | 100회/일 |
| **Max Tokens** | 1000 | 2000 |
| **Timeout** | 25초 | 30초 |

### 2. 동영상 요약 생성

| 기능 | 설명 |
|------|------|
| **자동 요약** | AI 기반 영상 내용 요약 |
| **핵심 포인트** | 주요 학습 포인트 추출 |
| **관련 질문** | 학습 확인 질문 생성 |

### 3. API 우선순위

```
1. DeepSeek (Primary) - 비용 효율적
   ↓ (실패 시)
2. Gemini (Fallback) - 무료 할당량
   ↓ (Pro Plan + 실패 시)
3. OpenAI GPT-4 - 고품질
```

---

## 프론트엔드 구조

### 1. 페이지 구조

| 경로 | 파일 | 설명 | 인증 |
|------|------|------|------|
| `/` | `app/page.tsx` | 랜딩 페이지 | - |
| `/login` | `app/login/page.tsx` | 로그인 | - |
| `/register` | `app/register/page.tsx` | 회원가입 | - |
| `/courses` | `app/courses/page.tsx` | 코스 목록 | - |
| `/courses/[id]/videos/[id]` | 동적 라우트 | 동영상 시청 | Required |
| `/dashboard` | `app/dashboard/page.tsx` | 대시보드 | Required |
| `/pricing` | `app/pricing/page.tsx` | 요금제 | - |
| `/about` | `app/about/page.tsx` | 소개 | - |
| `/features` | `app/features/page.tsx` | 기능 소개 | - |

### 2. 주요 컴포넌트

| 컴포넌트 | 파일 | 용도 |
|---------|------|------|
| **ChatBot** | `components/chat-bot.tsx` | AI 채팅 인터페이스 |
| **VideoSummary** | `components/video-summary.tsx` | 영상 요약 카드 |
| **VideoPlayer** | `components/video-player.tsx` | 동영상 플레이어 |
| **PricingCard** | `components/pricing-card.tsx` | 요금제 카드 |
| **Navigation** | `components/navigation.tsx` | 네비게이션 바 |
| **ThemeToggle** | `components/theme-toggle.tsx` | 다크/라이트 모드 |

### 3. UI 컴포넌트 (ShadCN)

```
components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── input.tsx
├── label.tsx
├── tabs.tsx
├── toast.tsx
└── ...
```

---

## 디렉토리 구조

```
online-course/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API 엔드포인트
│   │   ├── auth/                 # 인증 API
│   │   ├── chat/                 # AI 챗봇 API
│   │   ├── courses/              # 코스 API
│   │   ├── webhooks/             # 결제 웹훅
│   │   └── ...
│   ├── courses/                  # 코스 페이지
│   ├── dashboard/                # 대시보드
│   ├── login/                    # 로그인
│   ├── register/                 # 회원가입
│   ├── pricing/                  # 요금제
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 랜딩 페이지
├── components/                   # React 컴포넌트
│   ├── ui/                       # ShadCN UI 컴포넌트
│   ├── chat-bot.tsx              # AI 챗봇
│   ├── video-summary.tsx         # 영상 요약
│   └── ...
├── lib/                          # 핵심 유틸리티
│   ├── auth.ts                   # NextAuth 설정
│   ├── security.ts               # 보안 유틸리티
│   ├── prisma.ts                 # Prisma 클라이언트
│   ├── redis.ts                  # Redis 클라이언트
│   └── utils.ts                  # 공통 유틸리티
├── prisma/                       # 데이터베이스
│   ├── schema.prisma             # DB 스키마
│   └── migrations/               # 마이그레이션
├── types/                        # TypeScript 타입
├── public/                       # 정적 파일
├── middleware.ts                 # 보안 미들웨어
├── .cursorrules                  # Cursor IDE 규칙
├── SPEC.md                       # 이 파일
├── SECURITY.md                   # 보안 정책
└── env.example                   # 환경변수 예시
```

---

## 환경 변수

### 필수 환경 변수

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="min-32-characters-secret-key"
NEXTAUTH_URL="https://edu.2twodragon.com"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# AI Services
DEEPSEEK_API_KEY="sk-xxx"          # Primary
GEMINI_API_KEY="xxx"               # Fallback
OPENAI_API_KEY="sk-xxx"            # Pro plan only

# Payments
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
STRIPE_PRO_PRICE_ID="price_xxx"
PAYPAL_CLIENT_ID="xxx"
PAYPAL_CLIENT_SECRET="xxx"

# Redis (Rate Limiting)
REDIS_URL="redis://default:xxx@xxx.upstash.io:6379"

# Optional
NEXT_PUBLIC_FACEBOOK_APP_ID="xxx"
```

### 환경변수 검증 규칙

| 변수 | 검증 규칙 |
|------|----------|
| `NEXTAUTH_SECRET` | 32자 이상 |
| `DEEPSEEK_API_KEY` | `sk-`로 시작 |
| `STRIPE_SECRET_KEY` | `sk_live_` 또는 `sk_test_`로 시작 |
| `DATABASE_URL` | `postgresql://`로 시작 |

---

## Tech Blog 연동

### 콘텐츠 흐름

```
Tech Blog (tech.2twodragon.com)
        │
        │ 포스팅 작성
        ▼
   영상 제작 완료
        │
        │ Google Drive 업로드
        ▼
Online Course (edu.2twodragon.com)
        │
        │ /api/courses/sync-devsecops
        ▼
   코스 및 동영상 등록
```

### 동기화 API

| 엔드포인트 | 용도 |
|-----------|------|
| `/api/courses/sync-devsecops` | DevSecOps 코스 동기화 |
| `/api/drive/videos` | Google Drive 영상 목록 |
| `/api/drive/analyze` | 영상 메타데이터 분석 |

### 카테고리 매핑

| Tech Blog 카테고리 | Online Course 코스 |
|-------------------|-------------------|
| DevSecOps | DevSecOps 마스터 클래스 |
| Cloud Security | 클라우드 보안 실무 |
| Kubernetes | Kubernetes 보안 |
| AI/SNS | AI 도구 활용법 |

---

## 성능 최적화

### 1. Vercel 최적화

| 항목 | 설정 |
|------|------|
| **Serverless Timeout** | 10초 (Free), 60초 (Pro) |
| **Memory** | 1024MB |
| **Edge Caching** | 정적 자산 1년 캐시 |
| **ISR** | 코스 페이지 1시간 재검증 |

### 2. 데이터베이스 최적화

| 항목 | 구현 |
|------|------|
| **Connection Pooling** | Prisma + PgBouncer |
| **Query Optimization** | Select 필드 지정 |
| **Indexing** | userId, courseId 인덱스 |

### 3. 프론트엔드 최적화

| 항목 | 구현 |
|------|------|
| **Code Splitting** | 동적 import |
| **Image Optimization** | Next.js Image |
| **Lazy Loading** | Suspense + loading.tsx |

---

## 개발 가이드

### 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/Twodragon0/online-course.git
cd online-course

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp env.example .env.local
# .env.local 파일 편집

# 4. 데이터베이스 마이그레이션
npx prisma migrate dev

# 5. 개발 서버 실행
npm run dev
```

### 빌드 및 배포

```bash
# 타입 체크 및 린트
npm run lint

# 프로덕션 빌드
npm run build

# 보안 감사
npm audit

# Vercel 배포 (자동)
git push origin main
```

---

## AI 에이전트 규칙

### Claude/Cursor 작업 원칙

1. **보안 우선**: 모든 코드에서 민감 정보 하드코딩 금지
2. **타입 안전성**: TypeScript strict mode, any 사용 금지
3. **XSS 방지**: dangerouslySetInnerHTML 사용 시 escapeHtml 필수
4. **Rate Limiting**: 모든 API에 Rate Limit 적용
5. **에러 처리**: 민감 정보 노출 방지

### 커밋 규칙

```bash
# 형식
<type>: <description>

# 예시
feat: Pro 플랜 결제 기능 추가
fix: XSS 취약점 수정
chore: 의존성 업데이트
docs: API 문서 추가
```

---

## 참고 문서

| 문서 | 용도 |
|------|------|
| `.cursorrules` | Cursor IDE 상세 규칙 |
| `SECURITY.md` | 보안 정책 및 취약점 보고 |
| `env.example` | 환경 변수 템플릿 |
| [Next.js Docs](https://nextjs.org/docs) | 프레임워크 문서 |
| [Prisma Docs](https://www.prisma.io/docs) | ORM 문서 |
| [NextAuth.js](https://next-auth.js.org) | 인증 문서 |
| [ShadCN UI](https://ui.shadcn.com) | UI 컴포넌트 |

---

## 버전 히스토리

| 버전 | 날짜 | 주요 변경 사항 |
|------|------|---------------|
| v1.2 | 2026-01-12 | XSS 취약점 수정, .cursorrules 개선 |
| v1.1 | 2026-01-11 | Pro 플랜 결제 연동 |
| v1.0 | 2026-01-10 | 초기 릴리스 |

---

*이 문서는 Claude Code와 Cursor AI 에이전트가 프로젝트 작업 시 참조하는 종합 스펙 문서입니다.*
