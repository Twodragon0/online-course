# 플랫폼 간 싱크 구현 가이드

## 📋 목차
1. [싱크 클라이언트 라이브러리](#싱크-클라이언트-라이브러리)
2. [API Gateway 구현](#api-gateway-구현)
3. [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
4. [외부 연동 구현](#외부-연동-구현)
5. [보안 구현](#보안-구현)

---

## 싱크 클라이언트 라이브러리

### 라이브러리 구조

```
lib/
├── sync/
│   ├── client.ts          # 싱크 클라이언트 메인
│   ├── types.ts           # 타입 정의
│   ├── errors.ts          # 에러 처리
│   └── utils.ts           # 유틸리티 함수
```

### 구현 코드

#### types.ts
```typescript
export enum Platform {
  TECH_BLOG = 'tech-blog',
  ONLINE_COURSE = 'online-course',
  COOKING = 'cooking',
  BIT_DRAGON = 'bit-dragon',
}

export enum ContentType {
  POST = 'post',
  VIDEO = 'video',
  RECIPE = 'recipe',
  CERTIFICATION = 'certification',
  COURSE = 'course',
  MUSIC = 'music',
  MUSIC_VIDEO = 'music-video',
  BEAT = 'beat',
  PLAYLIST = 'playlist',
}

export enum SyncDirection {
  ONE_WAY = 'one-way',
  BIDIRECTIONAL = 'bidirectional',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ContentRef {
  platform: Platform;
  contentType: ContentType;
  contentId: string;
}

export interface SyncRequest {
  source: ContentRef;
  target: ContentRef;
  direction: SyncDirection;
  metadata?: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  syncId?: string;
  error?: string;
  timestamp: Date;
}

export interface SyncStatusResponse {
  syncId: string;
  status: SyncStatus;
  source: ContentRef;
  target: ContentRef;
  lastSyncedAt?: Date;
  error?: string;
}
```

#### client.ts
```typescript
import { Platform, ContentType, SyncDirection, SyncRequest, SyncResult, SyncStatusResponse } from './types';

export class SyncClient {
  private apiGatewayUrl: string;
  private platformId: Platform;
  private apiKey: string;
  private secretKey: string;

  constructor(config: {
    apiGatewayUrl: string;
    platformId: Platform;
    apiKey: string;
    secretKey: string;
  }) {
    this.apiGatewayUrl = config.apiGatewayUrl;
    this.platformId = config.platformId;
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
  }

  /**
   * 콘텐츠를 다른 플랫폼에 싱크
   */
  async syncContent(
    sourceContentId: string,
    sourceContentType: ContentType,
    targetPlatform: Platform,
    direction: SyncDirection = SyncDirection.ONE_WAY,
    metadata?: Record<string, any>
  ): Promise<SyncResult> {
    const request: SyncRequest = {
      source: {
        platform: this.platformId,
        contentType: sourceContentType,
        contentId: sourceContentId,
      },
      target: {
        platform: targetPlatform,
        contentType: sourceContentType, // 동일한 타입으로 가정
        contentId: '', // 타겟 플랫폼에서 생성
      },
      direction,
      metadata,
    };

    try {
      const response = await fetch(`${this.apiGatewayUrl}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Id': this.platformId,
          'X-API-Key': this.apiKey,
          'X-Signature': this.generateSignature(request),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sync failed');
      }

      const result: SyncResult = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 플랫폼 간 콘텐츠 연결
   */
  async linkContent(
    sourceContentId: string,
    sourceContentType: ContentType,
    targetPlatform: Platform,
    targetContentId: string,
    targetContentType: ContentType,
    direction: SyncDirection = SyncDirection.BIDIRECTIONAL
  ): Promise<SyncResult> {
    const request: SyncRequest = {
      source: {
        platform: this.platformId,
        contentType: sourceContentType,
        contentId: sourceContentId,
      },
      target: {
        platform: targetPlatform,
        contentType: targetContentType,
        contentId: targetContentId,
      },
      direction,
    };

    try {
      const response = await fetch(`${this.apiGatewayUrl}/api/sync/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Id': this.platformId,
          'X-API-Key': this.apiKey,
          'X-Signature': this.generateSignature(request),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Link failed');
      }

      const result: SyncResult = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 싱크 상태 조회
   */
  async getSyncStatus(syncId: string): Promise<SyncStatusResponse | null> {
    try {
      const response = await fetch(`${this.apiGatewayUrl}/api/sync/${syncId}`, {
        headers: {
          'X-Platform-Id': this.platformId,
          'X-API-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return null;
    }
  }

  /**
   * 사용자 정보 싱크
   */
  async syncUser(userId: string): Promise<SyncResult> {
    try {
      const response = await fetch(`${this.apiGatewayUrl}/api/sync/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Id': this.platformId,
          'X-API-Key': this.apiKey,
          'X-Signature': this.generateSignature({ userId }),
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'User sync failed');
      }

      const result: SyncResult = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * HMAC 서명 생성
   */
  private generateSignature(data: any): string {
    const crypto = require('crypto');
    const payload = JSON.stringify(data);
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
    return signature;
  }
}
```

#### 사용 예시
```typescript
// 각 플랫폼에서 싱크 클라이언트 초기화
import { SyncClient } from '@/lib/sync/client';
import { Platform, ContentType, SyncDirection } from '@/lib/sync/types';

const syncClient = new SyncClient({
  apiGatewayUrl: process.env.API_GATEWAY_URL || 'https://api.dragon.com',
  platformId: Platform.ONLINE_COURSE,
  apiKey: process.env.SYNC_API_KEY!,
  secretKey: process.env.SYNC_SECRET_KEY!,
});

// 비디오를 tech-blog에 싱크
const result = await syncClient.syncContent(
  videoId,
  ContentType.VIDEO,
  Platform.TECH_BLOG,
  SyncDirection.ONE_WAY,
  { title: video.title, description: video.description }
);

if (result.success) {
  console.log('Sync completed:', result.syncId);
} else {
  console.error('Sync failed:', result.error);
}
```

---

## API Gateway 구현

### API Gateway 구조

```
api-gateway/
├── app/
│   ├── api/
│   │   ├── sync/
│   │   │   ├── route.ts           # 싱크 요청 처리
│   │   │   ├── link/
│   │   │   │   └── route.ts       # 콘텐츠 연결
│   │   │   ├── user/
│   │   │   │   └── route.ts       # 사용자 싱크
│   │   │   └── [syncId]/
│   │   │       └── route.ts       # 싱크 상태 조회
│   │   └── webhooks/
│   │       └── sync/
│   │           └── route.ts       # 웹훅 수신
│   └── ...
├── lib/
│   ├── auth.ts                    # 인증 검증
│   ├── sync-handler.ts            # 싱크 로직
│   └── platform-client.ts         # 플랫폼별 클라이언트
```

### 인증 미들웨어

```typescript
// lib/auth.ts
import crypto from 'crypto';

interface AuthHeaders {
  'x-platform-id': string;
  'x-api-key': string;
  'x-signature': string;
}

export function verifySyncRequest(
  headers: Headers,
  body: any
): { valid: boolean; platform?: string; error?: string } {
  const platformId = headers.get('x-platform-id');
  const apiKey = headers.get('x-api-key');
  const signature = headers.get('x-signature');

  if (!platformId || !apiKey || !signature) {
    return { valid: false, error: 'Missing authentication headers' };
  }

  // API Key 검증
  const validApiKey = process.env[`${platformId.toUpperCase()}_SYNC_API_KEY`];
  if (apiKey !== validApiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  // 서명 검증
  const secretKey = process.env[`${platformId.toUpperCase()}_SYNC_SECRET_KEY`];
  const expectedSignature = crypto
    .createHmac('sha256', secretKey!)
    .update(JSON.stringify(body))
    .digest('hex');

  if (signature !== expectedSignature) {
    return { valid: false, error: 'Invalid signature' };
  }

  return { valid: true, platform: platformId };
}
```

### 싱크 API 라우트

```typescript
// app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySyncRequest } from '@/lib/auth';
import { handleSyncRequest } from '@/lib/sync-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = request.headers;

    // 인증 검증
    const auth = verifySyncRequest(headers, body);
    if (!auth.valid) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }

    // 싱크 처리
    const result = await handleSyncRequest(body, auth.platform!);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 싱크 핸들러

```typescript
// lib/sync-handler.ts
import { prisma } from '@/lib/prisma';
import { SyncRequest, SyncResult, SyncStatus } from './types';
import { callPlatformAPI } from './platform-client';

export async function handleSyncRequest(
  request: SyncRequest,
  sourcePlatform: string
): Promise<SyncResult> {
  const { source, target, direction, metadata } = request;

  try {
    // 1. 싱크 레코드 생성
    const syncRecord = await prisma.crossPlatformContent.create({
      data: {
        sourcePlatform: source.platform as any,
        sourceContentId: source.contentId,
        sourceContentType: source.contentType as any,
        linkedPlatform: target.platform as any,
        linkedContentId: target.contentId || '', // 타겟에서 생성될 예정
        linkedContentType: target.contentType as any,
        syncDirection: direction as any,
        syncStatus: 'SYNCING' as any,
      },
    });

    // 2. 타겟 플랫폼에 콘텐츠 생성 요청
    const targetResult = await callPlatformAPI(
      target.platform,
      '/api/sync/receive',
      {
        sourcePlatform: source.platform,
        sourceContentId: source.contentId,
        contentType: source.contentType,
        metadata,
      }
    );

    if (!targetResult.success) {
      // 실패 시 상태 업데이트
      await prisma.crossPlatformContent.update({
        where: { id: syncRecord.id },
        data: {
          syncStatus: 'FAILED' as any,
        },
      });

      return {
        success: false,
        error: targetResult.error,
        timestamp: new Date(),
      };
    }

    // 3. 성공 시 타겟 콘텐츠 ID 업데이트
    await prisma.crossPlatformContent.update({
      where: { id: syncRecord.id },
      data: {
        linkedContentId: targetResult.contentId,
        syncStatus: 'COMPLETED' as any,
        lastSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      syncId: syncRecord.id,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Sync handler error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}
```

---

## 데이터베이스 마이그레이션

### 공유 데이터베이스 마이그레이션

```prisma
// prisma/shared-schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("SHARED_DATABASE_URL")
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
}

enum SyncDirection {
  ONE_WAY
  BIDIRECTIONAL
}

enum SyncStatus {
  PENDING
  SYNCING
  COMPLETED
  FAILED
}

enum SubscriptionStatus {
  active
  inactive
}

model User {
  id                  String    @id @default(cuid())
  email               String?   @unique
  name                String?
  image               String?
  emailVerified       DateTime?
  subscriptionStatus  SubscriptionStatus @default(inactive)
  
  accounts            Account[]
  sessions           Session[]
  subscription       Subscription?
  syncMetadata        SyncMetadata?
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Subscription {
  id                   String    @id @default(cuid())
  userId               String    @unique
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  stripePriceId        String?
  stripeCurrentPeriodEnd DateTime?
  status               String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

model SyncMetadata {
  id                  String    @id @default(cuid())
  userId              String    @unique
  user                User      @relation(fields: [userId], references: [id])
  
  techBlogLastSync    DateTime?
  courseLastSync      DateTime?
  cookingLastSync     DateTime?
  
  syncStatus          SyncStatus @default(PENDING)
  syncErrors          String?   @db.Text
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

model CrossPlatformContent {
  id                  String    @id @default(cuid())
  
  sourcePlatform      Platform
  sourceContentId     String
  sourceContentType   ContentType
  
  linkedPlatform      Platform
  linkedContentId     String
  linkedContentType   ContentType
  
  syncDirection       SyncDirection
  syncStatus          SyncStatus
  lastSyncedAt        DateTime?
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@unique([sourcePlatform, sourceContentId, linkedPlatform, linkedContentId])
  @@index([sourcePlatform, sourceContentId])
  @@index([linkedPlatform, linkedContentId])
}
```

### 마이그레이션 실행

```bash
# 공유 데이터베이스 마이그레이션
cd api-gateway
npx prisma migrate dev --name init_shared_schema

# 각 플랫폼별 마이그레이션
cd ../tech-blog
npx prisma migrate dev --name init_tech_blog_schema

cd ../online-course
npx prisma migrate dev --name add_sync_support

cd ../cooking
npx prisma migrate dev --name init_cooking_schema
```

---

## 외부 연동 구현

### 네이버 블로그 연동

```typescript
// lib/naver-blog.ts
import Parser from 'rss-parser';

const parser = new Parser();

export interface NaverBlogPost {
  id: string;
  title: string;
  content: string;
  link: string;
  pubDate: Date;
  categories: string[];
}

export async function fetchNaverBlogPosts(
  blogId: string
): Promise<NaverBlogPost[]> {
  try {
    // 네이버 블로그 RSS 피드 URL
    const rssUrl = `https://rss.blog.naver.com/${blogId}.xml`;
    
    const feed = await parser.parseURL(rssUrl);
    
    return feed.items.map((item) => ({
      id: extractPostId(item.link || ''),
      title: item.title || '',
      content: item.contentSnippet || item.content || '',
      link: item.link || '',
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      categories: item.categories || [],
    }));
  } catch (error) {
    console.error('Failed to fetch Naver blog posts:', error);
    throw error;
  }
}

function extractPostId(url: string): string {
  // URL에서 포스트 ID 추출
  const match = url.match(/\/PostView\.naver\?blogId=\w+&logNo=(\d+)/);
  return match ? match[1] : '';
}

// 주기적 동기화 (Cron Job)
export async function syncNaverBlog() {
  const posts = await fetchNaverBlogPosts('dragon-jelly');
  
  for (const post of posts) {
    // cooking 데이터베이스에 레시피로 저장
    await prisma.recipe.upsert({
      where: { naverBlogPostId: post.id },
      create: {
        title: post.title,
        description: post.content,
        naverBlogPostId: post.id,
        authorId: getCookingProfileId(),
        tags: post.categories,
        // ... 기타 필드
      },
      update: {
        title: post.title,
        description: post.content,
        tags: post.categories,
      },
    });
  }
}
```

### YouTube 연동

```typescript
// lib/youtube-api.ts
import { google } from 'googleapis';

const youtube = google.youtube('v3');

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: Date;
  duration: number; // 초 단위
  viewCount: number;
  likeCount: number;
}

export async function getChannelVideos(
  channelId: string,
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  try {
    const response = await youtube.search.list({
      auth: process.env.YOUTUBE_API_KEY,
      part: ['snippet'],
      channelId: channelId.startsWith('@') 
        ? await getChannelIdFromHandle(channelId)
        : channelId,
      type: ['video'],
      maxResults,
      order: 'date',
    });

    if (!response.data.items) {
      return [];
    }

    const videoIds = response.data.items
      .map((item) => item.id?.videoId)
      .filter((id): id is string => !!id);

    // 비디오 상세 정보 가져오기
    const videoDetails = await youtube.videos.list({
      auth: process.env.YOUTUBE_API_KEY,
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds,
    });

    return videoDetails.data.items?.map((video) => ({
      id: video.id!,
      title: video.snippet?.title || '',
      description: video.snippet?.description || '',
      thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
      publishedAt: new Date(video.snippet?.publishedAt || ''),
      duration: parseDuration(video.contentDetails?.duration || ''),
      viewCount: parseInt(video.statistics?.viewCount || '0'),
      likeCount: parseInt(video.statistics?.likeCount || '0'),
    })) || [];
  } catch (error) {
    console.error('Failed to fetch YouTube videos:', error);
    throw error;
  }
}

async function getChannelIdFromHandle(handle: string): Promise<string> {
  const response = await youtube.search.list({
    auth: process.env.YOUTUBE_API_KEY,
    part: ['snippet'],
    q: handle,
    type: ['channel'],
    maxResults: 1,
  });

  return response.data.items?.[0]?.id?.channelId || '';
}

function parseDuration(duration: string): number {
  // ISO 8601 duration 형식 (PT1H2M10S)을 초로 변환
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

// 주기적 동기화
export async function syncYouTubeChannel() {
  const videos = await getChannelVideos('@yeongrae0');
  
  for (const video of videos) {
    await prisma.cookingVideo.upsert({
      where: { youtubeVideoId: video.id },
      create: {
        title: video.title,
        description: video.description,
        youtubeVideoId: video.id,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.viewCount,
        likes: video.likeCount,
        authorId: getCookingProfileId(),
        // ... 기타 필드
      },
      update: {
        title: video.title,
        description: video.description,
        views: video.viewCount,
        likes: video.likeCount,
      },
    });
  }
}
```

### Cron Job 설정 (Vercel)

```typescript
// app/api/cron/sync-external/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { syncNaverBlog } from '@/lib/naver-blog';
import { syncYouTubeChannel } from '@/lib/youtube-api';

export async function GET(request: NextRequest) {
  // Vercel Cron Secret 검증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 네이버 블로그 동기화
    await syncNaverBlog();
    
    // YouTube 동기화
    await syncYouTubeChannel();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-external",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## 보안 구현

### API Key 관리

```typescript
// lib/api-key-manager.ts
import crypto from 'crypto';

export class APIKeyManager {
  private static keys: Map<string, { key: string; secret: string }> = new Map();

  static generateKeyPair(platform: string): { apiKey: string; secretKey: string } {
    const apiKey = crypto.randomBytes(32).toString('hex');
    const secretKey = crypto.randomBytes(64).toString('hex');
    
    this.keys.set(platform, { key: apiKey, secret: secretKey });
    
    return { apiKey, secretKey };
  }

  static verifyKey(platform: string, apiKey: string): boolean {
    const stored = this.keys.get(platform);
    return stored?.key === apiKey;
  }

  static getSecretKey(platform: string): string | null {
    return this.keys.get(platform)?.secret || null;
  }
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimit(
  platform: string,
  limit: number = 100,
  window: number = 60 // 초
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate-limit:sync:${platform}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }

  const remaining = Math.max(0, limit - current);
  
  return {
    allowed: current <= limit,
    remaining,
  };
}
```

---

## 다음 단계

1. **싱크 클라이언트 라이브러리 패키지화**: npm 패키지로 배포하여 각 플랫폼에서 재사용
2. **모니터링 대시보드**: 싱크 상태를 시각화하는 관리자 대시보드 구축
3. **에러 처리 개선**: 재시도 로직 및 데드 레터 큐 구현
4. **성능 최적화**: 배치 싱크 및 캐싱 전략 구현

---

**작성일**: 2024-01-22  
**버전**: 1.0
