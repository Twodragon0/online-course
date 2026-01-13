# 멀티 플랫폼 아키텍처 기획서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [플랫폼 정의](#플랫폼-정의)
3. [아키텍처 설계](#아키텍처-설계)
4. [데이터 모델](#데이터-모델)
5. [플랫폼 간 통신](#플랫폼-간-통신)
6. [싱크 전략](#싱크-전략)
7. [보안 고려사항](#보안-고려사항)
8. [구현 로드맵](#구현-로드맵)

---

## 프로젝트 개요

### 비전
여러 도메인으로 분리된 독립적인 플랫폼들이 서로 보완적인 관계를 유지하며, 사용자에게 통합된 경험을 제공하는 멀티 플랫폼 생태계 구축.

### 핵심 원칙
- **독립성**: 각 플랫폼은 독립적으로 운영 가능
- **연결성**: 플랫폼 간 데이터 및 사용자 정보 공유
- **확장성**: 새로운 플랫폼 추가 용이
- **보안성**: 플랫폼 간 통신 보안 보장
- **일관성**: 통일된 사용자 경험 제공

---

## 플랫폼 정의

### 1. tech-blog (기술 블로그 플랫폼) ✅ 운영 중
**도메인**: `https://tech.2twodragon.com` (이미 제작 완료)

**주요 기능**:
- 📝 기술 블로그 포스팅
- 🏆 기술 자격증 정보 및 인증서 관리
- 📚 기술 문서 및 가이드
- 🔍 검색 및 태그 시스템
- 💬 댓글 및 토론 기능
- 📊 통계 및 분석 (조회수, 좋아요 등)

**콘텐츠 타입**:
- 블로그 포스트 (Markdown 지원)
- 자격증 정보 (AWS, Kubernetes, CISSP 등)
- 기술 문서
- 코드 스니펫 및 예제

**외부 연동**:
- GitHub 연동 (코드 저장소)
- LinkedIn 연동 (자격증 인증)
- 기술 커뮤니티 연동

---

### 2. online-course (교육 플랫폼) ⭐ 현재 프로젝트
**도메인**: `https://edu.2twodragon.com`

**주요 기능**:
- 📺 비디오 강의 재생 (YouTube, Google Drive)
- 🎧 오디오 콘텐츠 재생
- 💬 AI 기반 학습 어시스턴트
- 📊 학습 진행도 추적
- 💳 구독 및 결제 시스템
- 📝 코스 및 비디오 관리

**콘텐츠 타입**:
- 비디오 강의
- 오디오 강의
- 코스 자료 (PDF, 문서)
- AI 채팅 기록

**외부 연동**:
- Google Drive (비디오 스토리지)
- YouTube (비디오 임베드)
- Stripe/PayPal (결제)
- DeepSeek/OpenAI (AI 채팅)

---

### 3. bit-dragon (음악 플랫폼) 🔮 추후 개발
**도메인**: `https://bit.2twodragon.com`

**주요 기능**:
- 🎵 AI 음악 생성 (비트, EDM, 다양한 장르)
- 🎬 AI 뮤직 비디오 생성
- 🎹 음악 편집 및 믹싱 도구
- 📤 음악 공유 및 판매
- 🎧 음악 스트리밍 및 재생
- 📊 음악 통계 및 분석
- 🏷️ 장르별 분류 및 태그

**콘텐츠 타입**:
- AI 생성 음악 트랙 (MP3, WAV)
- 뮤직 비디오 (MP4)
- 비트/EDM 프로젝트 파일
- 음악 메타데이터 (BPM, 키, 장르)
- 플레이리스트

**외부 연동**:
- AI 음악 생성 API (Suno AI, Udio, MusicGen 등)
- AI 영상 생성 API (Runway, Pika, Stable Video 등)
- 음악 스토리지 (Vercel Blob, Cloudflare R2)
- 음악 플랫폼 연동 (Spotify, YouTube Music, SoundCloud)
- 결제 시스템 (Stripe, PayPal)

---

### 4. cooking (요리 플랫폼) 🍳
**도메인**: `https://cooking.2twodragon.com`

**주요 기능**:
- 🍽️ 레시피 공유
- 📹 요리 영상 (YouTube 연동)
- 📝 요리 블로그 (네이버 블로그 연동)
- 🏷️ 카테고리 및 태그
- ⭐ 평점 및 리뷰

**콘텐츠 타입**:
- 레시피
- 요리 영상 (YouTube Shorts)
- 요리 블로그 포스트
- 사진 갤러리

**외부 연동**:
- 네이버 블로그: `https://blog.naver.com/dragon-jelly`
- YouTube: `https://www.youtube.com/@yeongrae0/shorts`
- 이미지 스토리지 (Vercel Blob 또는 Google Drive)

---

## 아키텍처 설계

### 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 (Browser)                          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  tech-blog   │   │online-course │   │   cooking    │
│   Platform   │   │   Platform   │   │   Platform  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │      공통 서비스 레이어 (API Gateway)   │
        │  - 인증 및 권한 관리                    │
        │  - 플랫폼 간 통신                      │
        │  - 싱크 서비스                         │
        └───────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Shared DB   │   │  Platform DB │   │  Redis Cache │
│ (PostgreSQL) │   │ (PostgreSQL) │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
```

### 플랫폼별 아키텍처

#### tech-blog
```
tech-blog/
├── app/
│   ├── api/
│   │   ├── posts/          # 블로그 포스트 API
│   │   ├── certifications/ # 자격증 API
│   │   ├── sync/           # 싱크 API
│   │   └── external/       # 외부 연동 API
│   ├── posts/              # 블로그 포스트 페이지
│   ├── certifications/     # 자격증 페이지
│   └── dashboard/          # 관리자 대시보드
├── components/
│   ├── blog-editor/        # 블로그 에디터
│   ├── certification-card/ # 자격증 카드
│   └── sync-status/        # 싱크 상태 표시
└── lib/
    ├── sync-client.ts      # 싱크 클라이언트
    └── external-apis.ts    # 외부 API 연동
```

#### online-course (현재 구조 유지)
```
online-course/
├── app/
│   ├── api/
│   │   ├── videos/         # 비디오 API
│   │   ├── chat/           # AI 채팅 API
│   │   ├── sync/           # 싱크 API
│   │   └── ...
│   └── ...
├── components/
│   └── ...
└── lib/
    ├── sync-client.ts      # 싱크 클라이언트
    └── ...
```

#### cooking
```
cooking/
├── app/
│   ├── api/
│   │   ├── recipes/        # 레시피 API
│   │   ├── videos/         # 요리 영상 API
│   │   ├── sync/           # 싱크 API
│   │   └── external/       # 네이버/YouTube 연동
│   ├── recipes/            # 레시피 페이지
│   ├── videos/             # 요리 영상 페이지
│   └── blog/               # 블로그 연동 페이지
├── components/
│   ├── recipe-card/        # 레시피 카드
│   ├── video-player/       # 영상 플레이어
│   └── sync-status/        # 싱크 상태
└── lib/
    ├── sync-client.ts      # 싱크 클라이언트
    ├── naver-blog.ts       # 네이버 블로그 연동
    └── youtube-api.ts      # YouTube API 연동
```

#### bit-dragon
```
bit-dragon/
├── app/
│   ├── api/
│   │   ├── music/          # 음악 API
│   │   ├── video/          # 뮤직 비디오 API
│   │   ├── generate/       # AI 생성 API
│   │   │   ├── music/      # AI 음악 생성
│   │   │   └── video/      # AI 비디오 생성
│   │   ├── store/          # 음악 판매 API
│   │   ├── sync/           # 싱크 API
│   │   └── external/       # Spotify/YouTube 연동
│   ├── music/              # 음악 페이지
│   ├── video/              # 뮤직 비디오 페이지
│   ├── studio/             # 음악 스튜디오
│   └── store/              # 음악 스토어
├── components/
│   ├── music-player/       # 음악 플레이어
│   ├── video-player/       # 비디오 플레이어
│   ├── music-generator/    # AI 음악 생성기
│   ├── video-generator/    # AI 비디오 생성기
│   └── sync-status/        # 싱크 상태
└── lib/
    ├── sync-client.ts      # 싱크 클라이언트
    ├── suno-api.ts         # Suno AI 연동
    ├── runway-api.ts       # Runway ML 연동
    ├── spotify-api.ts      # Spotify API 연동
    └── music-storage.ts    # 음악 스토리지 관리
```

---

## 데이터 모델

### 공유 데이터베이스 스키마

#### User (공통 사용자)
```prisma
model User {
  id                  String    @id @default(cuid())
  email               String?   @unique
  name                String?
  image               String?
  emailVerified       DateTime?
  
  // 플랫폼별 프로필
  techBlogProfile     TechBlogProfile?
  courseProfile       CourseProfile?
  cookingProfile      CookingProfile?
  
  // 공통 구독 정보
  subscriptionStatus  SubscriptionStatus @default(inactive)
  subscription       Subscription?
  
  // 인증
  accounts            Account[]
  sessions           Session[]
  
  // 싱크 메타데이터
  syncMetadata        SyncMetadata?
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

#### SyncMetadata (싱크 메타데이터)
```prisma
model SyncMetadata {
  id                  String    @id @default(cuid())
  userId              String    @unique
  user                User      @relation(fields: [userId], references: [id])
  
  // 플랫폼별 마지막 싱크 시간
  techBlogLastSync    DateTime?
  courseLastSync      DateTime?
  cookingLastSync     DateTime?
  bitDragonLastSync   DateTime?
  
  // 싱크 상태
  syncStatus          SyncStatus @default(pending)
  syncErrors          String?   @db.Text
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

enum SyncStatus {
  pending
  syncing
  completed
  failed
}
```

#### CrossPlatformContent (플랫폼 간 콘텐츠 연결)
```prisma
model CrossPlatformContent {
  id                  String    @id @default(cuid())
  
  // 원본 콘텐츠
  sourcePlatform      Platform
  sourceContentId     String
  sourceContentType   ContentType
  
  // 연결된 콘텐츠
  linkedPlatform      Platform
  linkedContentId     String
  linkedContentType   ContentType
  
  // 메타데이터
  syncDirection       SyncDirection
  syncStatus          SyncStatus
  lastSyncedAt        DateTime?
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@unique([sourcePlatform, sourceContentId, linkedPlatform, linkedContentId])
  @@index([sourcePlatform, sourceContentId])
  @@index([linkedPlatform, linkedContentId])
}

enum Platform {
  TECH_BLOG
  ONLINE_COURSE
  COOKING
  BIT_DRAGON
}

enum ContentType {
  POST
  VIDEO
  RECIPE
  CERTIFICATION
  COURSE
  MUSIC
  MUSIC_VIDEO
  BEAT
  PLAYLIST
}

enum SyncDirection {
  ONE_WAY
  BIDIRECTIONAL
}
```

### 플랫폼별 데이터베이스 스키마

#### tech-blog 스키마
```prisma
model TechBlogProfile {
  id                  String    @id @default(cuid())
  userId              String    @unique
  user                User      @relation(fields: [userId], references: [id])
  
  bio                 String?
  githubUrl           String?
  linkedinUrl         String?
  websiteUrl          String?
  
  posts               Post[]
  certifications      Certification[]
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

model Post {
  id                  String    @id @default(cuid())
  title               String
  content             String    @db.Text
  excerpt             String?
  slug                String    @unique
  authorId             String
  author               TechBlogProfile @relation(fields: [authorId], references: [id])
  
  tags                String[]
  category            String?
  published           Boolean   @default(false)
  publishedAt         DateTime?
  
  views               Int       @default(0)
  likes               Int       @default(0)
  
  // 싱크 정보
  syncId              String?   @unique
  crossPlatformLinks  CrossPlatformContent[]
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([authorId])
  @@index([slug])
  @@index([published, publishedAt])
}

model Certification {
  id                  String    @id @default(cuid())
  title               String
  issuer              String
  issueDate           DateTime
  expiryDate          DateTime?
  credentialId        String?
  credentialUrl       String?
  
  userId              String
  user                TechBlogProfile @relation(fields: [userId], references: [id])
  
  imageUrl            String?
  verified            Boolean   @default(false)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([userId])
}
```

#### cooking 스키마
```prisma
model CookingProfile {
  id                  String    @id @default(cuid())
  userId              String    @unique
  user                User      @relation(fields: [userId], references: [id])
  
  bio                 String?
  naverBlogUrl        String?
  youtubeChannelUrl   String?
  
  recipes             Recipe[]
  videos              CookingVideo[]
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

model Recipe {
  id                  String    @id @default(cuid())
  title               String
  description         String?   @db.Text
  ingredients         String[]  // JSON 배열
  instructions        String[]  // JSON 배열
  cookingTime         Int?      // 분 단위
  servings            Int?
  difficulty          String?   // easy, medium, hard
  
  authorId            String
  author              CookingProfile @relation(fields: [authorId], references: [id])
  
  tags                String[]
  category            String?
  imageUrl            String?
  
  rating              Float     @default(0)
  reviewCount         Int       @default(0)
  
  // 외부 연동
  naverBlogPostId     String?
  youtubeVideoId      String?
  
  // 싱크 정보
  syncId              String?   @unique
  crossPlatformLinks  CrossPlatformContent[]
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([authorId])
  @@index([category])
}

model CookingVideo {
  id                  String    @id @default(cuid())
  title               String
  description         String?   @db.Text
  youtubeVideoId      String
  thumbnailUrl        String?
  
  authorId            String
  author              CookingProfile @relation(fields: [authorId], references: [id])
  
  duration            Int?      // 초 단위
  views               Int       @default(0)
  likes               Int       @default(0)
  
  recipeId            String?
  recipe              Recipe?   @relation(fields: [recipeId], references: [id])
  
  // 싱크 정보
  syncId              String?   @unique
  crossPlatformLinks  CrossPlatformContent[]
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([authorId])
  @@index([youtubeVideoId])
}
```

---

## 플랫폼 간 통신

### 통신 아키텍처

#### 1. API Gateway 패턴
중앙 집중식 API Gateway를 통해 플랫폼 간 통신 관리:

```
┌─────────────┐
│ tech-blog   │──┐
└─────────────┘  │
                 │
┌─────────────┐  │    ┌──────────────┐
│online-course│──┼───▶│ API Gateway  │
└─────────────┘  │    │ (Sync Service)│
                 │    └──────────────┘
┌─────────────┐  │           │
│  cooking    │──┘           │
└─────────────┘              │
                             ▼
                    ┌──────────────┐
                    │ Shared DB    │
                    └──────────────┘
```

#### 2. 싱크 클라이언트 라이브러리

각 플랫폼에 공통 싱크 클라이언트 라이브러리 제공:

```typescript
// lib/sync-client.ts (각 플랫폼에 공통)
interface SyncClient {
  // 콘텐츠 싱크
  syncContent(content: Content, targetPlatform: Platform): Promise<SyncResult>;
  
  // 사용자 정보 싱크
  syncUser(userId: string): Promise<void>;
  
  // 플랫폼 간 콘텐츠 연결
  linkContent(
    source: ContentRef,
    target: ContentRef,
    direction: SyncDirection
  ): Promise<CrossPlatformLink>;
  
  // 싱크 상태 조회
  getSyncStatus(contentId: string): Promise<SyncStatus>;
}

// 사용 예시
const syncClient = new SyncClient({
  apiGatewayUrl: process.env.API_GATEWAY_URL,
  platformId: 'tech-blog',
  apiKey: process.env.SYNC_API_KEY,
});

// 블로그 포스트를 online-course에 싱크
await syncClient.syncContent(post, 'ONLINE_COURSE');
```

#### 3. 웹훅 기반 실시간 싱크

플랫폼 간 실시간 싱크를 위한 웹훅 시스템:

```typescript
// 각 플랫폼의 웹훅 엔드포인트
POST /api/webhooks/sync
{
  "event": "content.created" | "content.updated" | "content.deleted",
  "platform": "tech-blog",
  "contentType": "post",
  "contentId": "xxx",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00Z",
  "signature": "hmac-sha256-signature"
}
```

#### 4. 메시지 큐 기반 비동기 싱크

대용량 데이터 싱크를 위한 메시지 큐 시스템 (선택사항):

```
Content Created → Message Queue (Redis/RabbitMQ) → Sync Workers → Target Platforms
```

---

## 싱크 전략

### 싱크 시나리오

#### 1. 사용자 정보 싱크
**목적**: 한 플랫폼에서 가입하면 다른 플랫폼에서도 동일한 사용자 정보 사용

**전략**:
- 공유 데이터베이스의 `User` 테이블 사용
- 플랫폼별 프로필은 각 플랫폼 DB에 저장
- 사용자 인증은 중앙 집중식 (NextAuth.js 공유)

**구현**:
```typescript
// 사용자 생성 시 자동 싱크
async function createUser(email: string, name: string) {
  // 1. 공유 DB에 사용자 생성
  const user = await sharedDb.user.create({ data: { email, name } });
  
  // 2. 각 플랫폼에 프로필 생성 (비동기)
  await Promise.all([
    createTechBlogProfile(user.id),
    createCourseProfile(user.id),
    createCookingProfile(user.id),
  ]);
  
  return user;
}
```

#### 2. 콘텐츠 싱크
**목적**: 한 플랫폼의 콘텐츠를 다른 플랫폼에서 참조하거나 표시

**전략**:
- **원본 유지**: 원본 플랫폼에 콘텐츠 저장
- **메타데이터 공유**: `CrossPlatformContent` 테이블에 연결 정보 저장
- **임베드 방식**: 다른 플랫폼에서는 원본 콘텐츠를 임베드하여 표시

**예시**:
- `tech-blog`의 기술 블로그 포스트를 `online-course`의 관련 코스에 연결
- `cooking`의 요리 영상을 `tech-blog`의 요리 관련 포스트에 임베드

**구현**:
```typescript
// 콘텐츠 연결
async function linkContent(
  sourcePlatform: Platform,
  sourceContentId: string,
  targetPlatform: Platform,
  targetContentId: string
) {
  // CrossPlatformContent에 연결 정보 저장
  await sharedDb.crossPlatformContent.create({
    data: {
      sourcePlatform,
      sourceContentId,
      sourceContentType: getContentType(sourceContentId),
      linkedPlatform: targetPlatform,
      linkedContentId: targetContentId,
      linkedContentType: getContentType(targetContentId),
      syncDirection: 'BIDIRECTIONAL',
      syncStatus: 'completed',
    },
  });
}
```

#### 3. 외부 콘텐츠 싱크 (cooking 플랫폼)
**목적**: 네이버 블로그와 YouTube 채널의 콘텐츠를 자동으로 가져와서 표시

**전략**:
- **네이버 블로그**: RSS 피드 또는 API를 통한 주기적 동기화
- **YouTube**: YouTube Data API를 통한 영상 정보 가져오기
- **자동 업데이트**: Cron Job 또는 웹훅을 통한 주기적 동기화

**구현**:
```typescript
// 네이버 블로그 동기화
async function syncNaverBlog() {
  // RSS 피드 파싱 또는 네이버 블로그 API 호출
  const posts = await fetchNaverBlogPosts('dragon-jelly');
  
  for (const post of posts) {
    await cookingDb.recipe.upsert({
      where: { naverBlogPostId: post.id },
      create: {
        title: post.title,
        description: post.content,
        naverBlogPostId: post.id,
        authorId: getCookingProfileId(),
        // ... 기타 필드
      },
      update: {
        title: post.title,
        description: post.content,
        // ... 업데이트 필드
      },
    });
  }
}

// YouTube 동기화
async function syncYouTubeChannel() {
  const videos = await youtubeAPI.getChannelVideos('@yeongrae0');
  
  for (const video of videos) {
    await cookingDb.cookingVideo.upsert({
      where: { youtubeVideoId: video.id },
      create: {
        title: video.title,
        description: video.description,
        youtubeVideoId: video.id,
        thumbnailUrl: video.thumbnail,
        authorId: getCookingProfileId(),
        // ... 기타 필드
      },
      update: {
        title: video.title,
        description: video.description,
        // ... 업데이트 필드
      },
    });
  }
}
```

#### 4. 구독 정보 싱크
**목적**: 한 플랫폼에서 구독하면 다른 플랫폼에서도 동일한 구독 상태 유지

**전략**:
- 공유 데이터베이스의 `Subscription` 테이블 사용
- 플랫폼별 구독 권한은 각 플랫폼에서 확인

**구현**:
```typescript
// 구독 상태 확인 (각 플랫폼에서)
async function checkSubscription(userId: string) {
  const subscription = await sharedDb.subscription.findUnique({
    where: { userId },
  });
  
  return subscription?.status === 'active';
}
```

---

## 보안 고려사항

### 1. 플랫폼 간 인증

#### API Key 기반 인증
```typescript
// 각 플랫폼에 고유한 API Key 발급
interface SyncRequest {
  platform: Platform;
  apiKey: string; // HMAC 서명된 API Key
  timestamp: number;
  signature: string; // HMAC-SHA256 서명
}

// 서명 검증
function verifySyncRequest(request: SyncRequest): boolean {
  const expectedSignature = hmacSha256(
    `${request.platform}:${request.timestamp}`,
    process.env.SYNC_SECRET_KEY
  );
  
  return request.signature === expectedSignature;
}
```

#### JWT 토큰 기반 인증
```typescript
// 공유 JWT 토큰 발급
const syncToken = jwt.sign(
  { platform: 'tech-blog', permissions: ['read', 'write'] },
  process.env.SYNC_JWT_SECRET,
  { expiresIn: '1h' }
);
```

### 2. CORS 및 도메인 제한

```typescript
// API Gateway CORS 설정
const corsOptions = {
  origin: [
    'https://tech-blog.dragon.com',
    'https://course.dragon.com',
    'https://cooking.dragon.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
```

### 3. Rate Limiting

플랫폼 간 API 호출에 대한 Rate Limiting:

```typescript
// 플랫폼별 Rate Limit
const rateLimits = {
  'tech-blog': { requests: 100, window: '1m' },
  'online-course': { requests: 100, window: '1m' },
  'cooking': { requests: 100, window: '1m' },
};
```

### 4. 데이터 암호화

민감한 데이터는 암호화하여 저장:

```typescript
// API Key 암호화 저장
const encryptedApiKey = encrypt(apiKey, process.env.ENCRYPTION_KEY);
```

### 5. 입력 검증 및 Sanitization

플랫폼 간 통신 시 입력 검증 필수:

```typescript
// 싱크 요청 검증
function validateSyncRequest(data: any): boolean {
  return (
    validatePlatform(data.platform) &&
    validateContentId(data.contentId) &&
    sanitizeInput(data.metadata)
  );
}
```

---

## 구현 로드맵

### Phase 1: 기반 구조 구축 (1-2개월)

#### 1.1 공유 인프라 구축
- [ ] 공유 데이터베이스 스키마 설계 및 마이그레이션
- [ ] API Gateway 서비스 구축
- [ ] 싱크 클라이언트 라이브러리 개발
- [ ] 인증 및 권한 시스템 통합

#### 1.2 online-course 개선
- [ ] 싱크 클라이언트 통합
- [ ] 싱크 API 엔드포인트 추가
- [ ] 플랫폼 간 콘텐츠 연결 기능 추가

### Phase 2: tech-blog 플랫폼 구축 (2-3개월)

#### 2.1 기본 구조
- [ ] Next.js 프로젝트 초기화
- [ ] 데이터베이스 스키마 설정
- [ ] 인증 시스템 통합 (공유 인증)

#### 2.2 핵심 기능
- [ ] 블로그 포스트 작성/편집/삭제
- [ ] Markdown 에디터 통합
- [ ] 자격증 관리 시스템
- [ ] 검색 및 태그 시스템

#### 2.3 싱크 기능
- [ ] online-course와 콘텐츠 연결
- [ ] 외부 플랫폼 연동 (GitHub, LinkedIn)

### Phase 3: cooking 플랫폼 구축 (2-3개월)

#### 3.1 기본 구조
- [ ] Next.js 프로젝트 초기화
- [ ] 데이터베이스 스키마 설정
- [ ] 인증 시스템 통합

#### 3.2 핵심 기능
- [ ] 레시피 작성/관리
- [ ] YouTube 영상 임베드 및 관리
- [ ] 네이버 블로그 연동
- [ ] 이미지 갤러리

#### 3.3 외부 연동
- [ ] 네이버 블로그 RSS 피드 파싱
- [ ] YouTube Data API 연동
- [ ] 자동 동기화 스케줄러

### Phase 4: 고급 기능 및 최적화 (1-2개월)

#### 4.1 싱크 최적화
- [ ] 메시지 큐 기반 비동기 싱크
- [ ] 싱크 상태 모니터링 대시보드
- [ ] 에러 처리 및 재시도 로직

#### 4.2 성능 최적화
- [ ] 캐싱 전략 구현 (Redis)
- [ ] CDN 통합
- [ ] 이미지 최적화

#### 4.3 모니터링 및 분석
- [ ] 플랫폼 간 트래픽 모니터링
- [ ] 싱크 성공률 추적
- [ ] 사용자 행동 분석

### Phase 5: bit-dragon 플랫폼 (추후)

#### 5.1 기본 구조
- [ ] Next.js 프로젝트 초기화
- [ ] 데이터베이스 스키마 설정 (음악, 비디오, 프로젝트)
- [ ] 인증 시스템 통합

#### 5.2 핵심 기능
- [ ] AI 음악 생성 인터페이스
- [ ] AI 뮤직 비디오 생성
- [ ] 음악 편집 및 믹싱 도구
- [ ] 음악 스트리밍 플레이어
- [ ] 음악 판매 및 다운로드 시스템

#### 5.3 AI 서비스 연동
- [ ] Suno AI API 연동
- [ ] Runway ML API 연동 (비디오)
- [ ] 음악 생성 큐 시스템
- [ ] 비디오 생성 큐 시스템

#### 5.4 외부 연동
- [ ] Spotify API 연동
- [ ] YouTube Music API 연동
- [ ] 음악 스토리지 최적화
- [ ] 결제 시스템 통합

---

## 기술 스택

### 공통 기술 스택
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS + shadcn/ui
- **데이터베이스**: PostgreSQL (Prisma ORM)
- **캐싱**: Redis
- **인증**: NextAuth.js (공유)
- **배포**: Vercel

### 플랫폼별 추가 기술

#### tech-blog
- **에디터**: MDX 또는 TipTap
- **검색**: Algolia 또는 PostgreSQL Full-Text Search
- **외부 연동**: GitHub API, LinkedIn API

#### cooking
- **외부 연동**: 
  - 네이버 블로그 RSS/API
  - YouTube Data API v3
- **이미지 처리**: Sharp 또는 ImageKit

#### bit-dragon
- **AI 음악 생성**: 
  - Suno AI API
  - Udio API
  - MusicGen (Meta)
  - Stable Audio
- **AI 영상 생성**:
  - Runway ML API
  - Pika Labs API
  - Stable Video Diffusion
- **음악 스토리지**: Vercel Blob, Cloudflare R2
- **음악 플랫폼 연동**: Spotify API, YouTube Music API

---

## 배포 전략

### 도메인 구조
```
tech.2twodragon.com     → tech-blog 플랫폼 (✅ 운영 중)
edu.2twodragon.com      → online-course 플랫폼 (⭐ 현재 프로젝트)
cooking.2twodragon.com  → cooking 플랫폼 (🔮 예정)
bit.2twodragon.com      → bit-dragon 플랫폼 (🔮 예정)
```

### 환경 변수 관리

#### 공통 환경 변수
```bash
# 공유 데이터베이스
SHARED_DATABASE_URL="postgresql://..."

# 싱크 서비스
SYNC_API_KEY="..."
SYNC_JWT_SECRET="..."
API_GATEWAY_URL="https://api.dragon.com"

# 인증
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://[platform].dragon.com"
```

#### 플랫폼별 환경 변수
```bash
# tech-blog
GITHUB_CLIENT_ID="..."
LINKEDIN_CLIENT_ID="..."

# cooking
NAVER_BLOG_RSS_URL="https://blog.naver.com/dragon-jelly"
YOUTUBE_API_KEY="..."
YOUTUBE_CHANNEL_ID="@yeongrae0"
```

### CI/CD 파이프라인

각 플랫폼은 독립적인 배포 파이프라인을 가지되, 공통 라이브러리는 버전 관리:

```
GitHub Actions
├── tech-blog-workflow.yml
├── online-course-workflow.yml
├── cooking-workflow.yml
└── shared-libs-workflow.yml
```

---

## 모니터링 및 로깅

### 통합 모니터링
- **에러 추적**: Sentry (플랫폼별 프로젝트)
- **성능 모니터링**: Vercel Analytics
- **로그 집중화**: 로그 수집 서비스 (예: Logtail, Datadog)

### 싱크 모니터링
- 싱크 성공/실패율 추적
- 싱크 지연 시간 모니터링
- 플랫폼 간 API 호출 통계

---

## 다음 단계

1. **기획 검토 및 승인**: 이 기획서 검토 후 피드백 수집
2. **프로토타입 개발**: tech-blog 플랫폼 프로토타입 개발
3. **싱크 시스템 POC**: 플랫폼 간 통신 프로토타입 개발
4. **외부 연동 테스트**: 네이버 블로그 및 YouTube API 연동 테스트

---

## 참고 자료

- [Next.js Multi-Zone](https://nextjs.org/docs/advanced-features/multi-zones)
- [Prisma Multi-Schema](https://www.prisma.io/docs/guides/migrate-to-prisma/migrate-from-sequelize/multi-schema)
- [API Gateway 패턴](https://microservices.io/patterns/apigateway.html)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [네이버 블로그 API](https://developers.naver.com/docs/serviceapi/blog/blog.md)

---

## 1인 비즈니스 비용 효율 아키텍처

### 비용 최적화 전략

#### 1. 인프라 비용 최소화

**현재 구조 (무료/저비용 티어 활용)**:
```
┌─────────────────────────────────────────────────┐
│              Vercel (무료 티어)                  │
│  - Hobby Plan: $0/월                            │
│  - 100GB 대역폭/월                               │
│  - 무제한 배포                                   │
│  - Edge Functions 포함                          │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│tech-blog │ │edu-course│ │ cooking  │
│(Jekyll)  │ │(Next.js) │ │(Next.js) │
└──────────┘ └──────────┘ └──────────┘
```

**데이터베이스 전략**:
- **Phase 1 (초기)**: Vercel Postgres Hobby ($0/월, 256MB)
  - 각 플랫폼별 독립 DB 또는 공유 DB 1개
  - 트래픽이 적을 때는 충분
  
- **Phase 2 (성장기)**: Vercel Postgres Pro ($20/월, 8GB)
  - 사용자 1,000명 이상 또는 트래픽 증가 시
  - 공유 DB 1개로 통합하여 비용 절감

- **Phase 3 (확장기)**: Supabase Pro ($25/월) 또는 Neon Pro ($19/월)
  - 더 많은 기능 필요 시
  - 자동 백업, 더 큰 스토리지

**캐싱 전략**:
- **무료 옵션**: Vercel Edge Cache (무료)
- **Redis**: Upstash Redis Free Tier (10,000 commands/일)
  - Rate limiting 및 세션 관리용
  - 필요 시 Pro ($0.20/100K commands)

#### 2. API 비용 최적화

**AI 서비스**:
```
우선순위: DeepSeek > Gemini > OpenAI

DeepSeek (최우선):
- 입력: $0.14/1M tokens
- 출력: $0.28/1M tokens
- OpenAI 대비 95% 절감

Gemini (Fallback):
- 입력: $0.10/1M tokens
- 출력: $0.40/1M tokens

OpenAI (Pro 플랜 전용):
- GPT-4: $30/1M input, $60/1M output
- Pro 플랜 사용자에게만 제공
```

**비용 절감 전략**:
- 캐싱: 동일 질문 1시간 캐시
- 토큰 제한: 기본 2048 토큰
- Fallback 체인: DeepSeek → Gemini → OpenAI

**외부 API**:
- YouTube Data API: 무료 (10,000 units/일)
- 네이버 블로그: RSS 피드 무료 사용
- Google Drive API: 무료 (1일 1,000,000,000 quota units)

#### 3. 스토리지 비용

**이미지/파일 스토리지**:
- **Vercel Blob**: 무료 티어 (1GB, 100GB 대역폭/월)
- **Google Drive**: 무료 (15GB)
- **Cloudflare R2**: $0.015/GB (S3 호환, 대역폭 무료)

**비디오 스토리지**:
- Google Drive (무료) 우선 사용
- YouTube 임베드 (무료)
- 필요 시 Vercel Blob 또는 Cloudflare Stream

#### 4. 모니터링 및 로깅

**무료 티어 활용**:
- **Sentry**: Free Tier (5,000 events/월)
  - 각 플랫폼별 프로젝트 분리
  - 중요 에러만 추적
  
- **Vercel Analytics**: 무료 (기본 분석)
- **Logtail**: Free Tier (1GB/월)
  - 필요 시에만 사용

### 월 예상 비용 (1인 비즈니스)

#### Phase 1: 초기 단계 (0-100 사용자)
```
Vercel Hobby Plan:        $0/월
Vercel Postgres Hobby:     $0/월
Upstash Redis Free:        $0/월
Sentry Free:               $0/월
도메인 (2twodragon.com):   $12/년 ($1/월)
─────────────────────────────────
총 비용:                   $1/월
```

#### Phase 2: 성장기 (100-1,000 사용자)
```
Vercel Hobby Plan:        $0/월
Vercel Postgres Pro:      $20/월
Upstash Redis Pro:        $10/월 (예상)
DeepSeek API:             $5-10/월 (예상)
Sentry Free:              $0/월
도메인:                   $1/월
─────────────────────────────────
총 비용:                   $36-41/월
```

#### Phase 3: 확장기 (1,000-10,000 사용자)
```
Vercel Pro:               $20/월
Vercel Postgres Pro:      $20/월
Upstash Redis Pro:        $20/월
DeepSeek API:             $20-50/월
Sentry Team:              $26/월 (선택)
도메인:                   $1/월
─────────────────────────────────
총 비용:                   $107-137/월
```

#### Phase 4: 성숙기 (10,000+ 사용자)
```
Vercel Pro:               $20/월
Supabase Pro:             $25/월
Upstash Redis Pro:        $50/월
DeepSeek API:             $100-200/월
Sentry Team:              $26/월
도메인:                   $1/월
─────────────────────────────────
총 비용:                   $222-302/월
```

### 비용 증가 구간 및 대응 전략

#### 구간 1: $0 → $20/월 (100-500 사용자)
**트리거**: 데이터베이스 사용량 증가
**대응**:
- Vercel Postgres Hobby → Pro 업그레이드
- 공유 DB로 통합하여 비용 절감
- 쿼리 최적화 및 인덱싱

#### 구간 2: $20 → $50/월 (500-2,000 사용자)
**트리거**: AI API 사용량 증가, Redis 필요
**대응**:
- AI 응답 캐싱 강화
- Rate limiting 최적화
- Upstash Redis Pro 업그레이드

#### 구간 3: $50 → $150/월 (2,000-10,000 사용자)
**트리거**: 트래픽 증가, 모니터링 필요
**대응**:
- Vercel Pro 업그레이드
- CDN 최적화
- 이미지 최적화 (WebP, lazy loading)

#### 구간 4: $150 → $300/월 (10,000+ 사용자)
**트리거**: 대규모 트래픽, 고급 기능 필요
**대응**:
- 데이터베이스 최적화
- 캐싱 전략 고도화
- 모니터링 도구 확장

---

## 비즈니스 모델 (BM) 기획

### 수익 모델

#### 1. online-course (edu.2twodragon.com)

**구독 모델**:
```
Free Tier:
- 기본 비디오 시청
- 제한된 AI 채팅 (20회/일)

Pro Tier: $29/월 또는 $290/년
- 모든 비디오 무제한 시청
- 무제한 AI 채팅
- 고급 AI 모델 (GPT-4) 사용
- 우선 고객 지원
- 수료증 발급

Enterprise Tier: $99/월 (기업용)
- 팀 관리 기능
- 학습 진행도 추적
- 맞춤형 콘텐츠
```

**예상 수익**:
- 100명 Pro 구독자: $2,900/월
- 10명 Enterprise: $990/월
- **총 예상**: $3,890/월

#### 2. tech-blog (tech.2twodragon.com)

**광고 수익**:
- Google AdSense: CPM $1-5
- 기술 관련 제휴 광고
- 스폰서 포스트

**예상 수익** (월 10,000 PV 기준):
- AdSense: $30-50/월
- 제휴 광고: $100-200/월
- **총 예상**: $130-250/월

#### 3. cooking (cooking.2twodragon.com)

**제휴 마케팅**:
- 요리 도구/재료 제휴 링크
- YouTube 수익화 연동
- 레시피 프리미엄 콘텐츠

**예상 수익** (월 5,000 PV 기준):
- 제휴 수수료: $50-100/월
- YouTube 광고: $20-50/월
- **총 예상**: $70-150/월

#### 4. bit-dragon (bit.2twodragon.com)

**음악 판매 및 구독 모델**:
```
Free Tier:
- 기본 음악 스트리밍
- 제한된 AI 음악 생성 (5곡/월)
- 워터마크 포함 뮤직 비디오

Pro Tier: $19/월 또는 $190/년
- 무제한 AI 음악 생성
- 무제한 뮤직 비디오 생성
- 고품질 오디오 다운로드 (WAV)
- 워터마크 없는 비디오
- 음악 판매 수수료 10% (일반 30%)

Creator Tier: $49/월
- Pro 기능 포함
- 음악 판매 수수료 5%
- 우선 AI 생성 큐
- 커스텀 브랜딩
- 상세 분석 도구
```

**음악 판매 수익**:
- 음악 다운로드 판매: $0.99-4.99/곡
- 뮤직 비디오 판매: $4.99-19.99/비디오
- 비트/EDM 팩 판매: $9.99-49.99/팩

**예상 수익** (월 1,000 활성 사용자 기준):
- Pro 구독 (100명): $1,900/월
- Creator 구독 (20명): $980/월
- 음악 판매 수수료: $200-500/월
- **총 예상**: $3,080-3,380/월

### 통합 수익 예측

#### Phase 1 (초기 6개월)
```
online-course:  $500-1,000/월
tech-blog:      $50-100/월
cooking:        $20-50/월
────────────────────────────
총 수익:        $570-1,150/월
비용:           $1-20/월
순이익:         $550-1,130/월
```

#### Phase 2 (6-12개월)
```
online-course:  $2,000-4,000/월
tech-blog:      $100-200/월
cooking:        $50-100/월
bit-dragon:     $500-1,000/월 (초기 런칭)
────────────────────────────
총 수익:        $2,650-5,300/월
비용:           $36-50/월
순이익:         $2,600-5,250/월
```

#### Phase 3 (12-24개월)
```
online-course:  $5,000-10,000/월
tech-blog:      $200-400/월
cooking:        $100-200/월
bit-dragon:     $3,000-5,000/월 (성장기)
────────────────────────────
총 수익:        $8,300-15,600/월
비용:           $100-150/월
순이익:         $8,150-15,450/월
```

### 수익 증대 전략

#### 1. 크로스 플랫폼 마케팅
- tech-blog에서 online-course 홍보
- cooking에서 tech-blog 요리 관련 포스트 연결
- 플랫폼 간 구독 연동 할인

#### 2. 프리미엄 콘텐츠
- online-course: 고급 코스 별도 판매
- tech-blog: 프리미엄 기술 가이드
- cooking: 프리미엄 레시피 팩

#### 3. 제휴 및 협업
- 기술 교육 기관과 제휴
- 요리 도구 브랜드 제휴
- 음악 제작 도구/플러그인 제휴
- 음악 플랫폼 연동 (Spotify, Apple Music)

#### 4. 커뮤니티 구축
- Discord/Slack 커뮤니티
- 월간 구독자 전용 이벤트
- 멘토링 프로그램

### ROI 분석

**초기 투자**:
- 개발 시간: 6-12개월 (1인 개발)
- 도메인: $12/년
- 초기 마케팅: $500-1,000

**예상 회수 기간**:
- Phase 1: 1-2개월
- Phase 2: 3-6개월
- Phase 3: 6-12개월

**장기 목표**:
- 24개월 내 월 $10,000+ 수익
- 자동화된 수익 구조 구축
- 플랫폼 확장 및 스케일링

---

## 운영 효율성 전략

### 자동화

#### 1. 콘텐츠 자동 싱크
- 네이버 블로그 → cooking 자동 동기화
- YouTube → cooking 자동 동기화
- tech-blog → online-course 콘텐츠 연결

#### 2. 모니터링 자동화
- 에러 알림 (Sentry → Slack/Email)
- 트래픽 모니터링 (Vercel Analytics)
- 비용 알림 (예산 초과 시)

#### 3. 배포 자동화
- GitHub Actions CI/CD
- 자동 테스트 및 배포
- 롤백 자동화

### 운영 시간 최소화

**일일 운영 시간**: 1-2시간
- 콘텐츠 작성/업데이트
- 사용자 문의 응답
- 시스템 모니터링

**주간 운영 시간**: 5-10시간
- 콘텐츠 기획
- 마케팅 활동
- 기술 개선

### 확장성 고려사항

#### 수평 확장
- 각 플랫폼 독립 운영
- 마이크로서비스 아키텍처
- 서버리스 함수 활용

#### 수직 확장
- 필요 시에만 리소스 업그레이드
- 사용량 기반 자동 스케일링
- 비용 효율적인 리소스 관리

---

**작성일**: 2024-01-22  
**버전**: 2.0  
**작성자**: AI Assistant (DevSecOps Engineer)  
**업데이트**: 1인 비즈니스 비용 효율성 및 BM 추가
