# Google Drive 동영상 강의 연동 가이드

이 문서는 `share` 폴더의 Google Drive 로직을 참고하여 동영상 강의를 구글 공유 드라이브 링크로 연결하는 방법을 설명합니다.

## 개요

온라인 강의 플랫폼에서 Google Drive에 저장된 동영상 강의를 자동으로 조회하고 표시할 수 있도록 구현되었습니다.

## 주요 기능

1. **Google Drive API 연동**: Service Account를 사용하여 Google Drive에 접근
2. **폴더 기반 동영상 조회**: 기수별, 주차별 폴더 구조에서 동영상 파일 자동 조회
3. **동영상 링크 생성**: Google Drive 파일 ID로부터 임베드 URL 및 공유 링크 생성
4. **URL 파싱**: 다양한 Google Drive URL 형식에서 파일 ID 추출

## 설정

### 1. Google Service Account 설정

`share/data/bjchoi_service_account.json` 파일에 Service Account 인증 정보가 필요합니다.

또는 환경변수로 설정:
```bash
GOOGLE_CREDENTIALS='{"type":"service_account",...}'
GOOGLE_CREDENTIALS_PATH=/path/to/service_account.json
```

### 2. 폴더 설정

`share/data/folders.json` 파일에 기수별 폴더 ID가 설정되어 있어야 합니다:

```json
{
  "1기": "폴더ID1",
  "2기": "폴더ID2",
  ...
}
```

또는 환경변수로 설정:
```bash
FOLDERS_CONFIG_PATH=/path/to/folders.json
```

## 사용 방법

### 1. API 엔드포인트 사용

#### 특정 기수의 주차별 동영상 조회
```typescript
// GET /api/drive/videos?batch=8기&week=3
const response = await fetch('/api/drive/videos?batch=8기&week=3');
const data = await response.json();
// { batch: "8기", week: 3, videos: [...] }
```

#### 모든 기수의 주차별 동영상 조회
```typescript
// GET /api/drive/videos?week=3&all=true
const response = await fetch('/api/drive/videos?week=3&all=true');
const data = await response.json();
// { week: 3, batches: [{ batch: "8기", videos: [...] }, ...] }
```

#### 폴더 ID로 직접 조회
```typescript
// GET /api/drive/videos?folderId=FOLDER_ID
const response = await fetch('/api/drive/videos?folderId=FOLDER_ID');
const data = await response.json();
// { folderId: "FOLDER_ID", videos: [...] }
```

### 2. 유틸리티 함수 사용

#### Google Drive URL에서 파일 ID 추출
```typescript
import { getDriveFileId } from '@/lib/video-utils';

const fileId = getDriveFileId('https://drive.google.com/file/d/1ABC123/view');
// "1ABC123"
```

#### 임베드 URL 생성
```typescript
import { getEmbedUrl } from '@/lib/video-utils';

const embedUrl = getEmbedUrl('1ABC123');
// "https://drive.google.com/file/d/1ABC123/preview"
```

#### 공유 링크 생성
```typescript
import { getShareUrl } from '@/lib/video-utils';

const shareUrl = getShareUrl('1ABC123');
// "https://drive.google.com/file/d/1ABC123/view?usp=sharing"
```

### 3. Google Drive 서비스 직접 사용

#### 주차별 폴더 ID 조회
```typescript
import { getWeekFolderId } from '@/lib/google-drive';

const folderId = await getWeekFolderId('8기', 3);
// "폴더ID"
```

#### 폴더 내 동영상 조회
```typescript
import { getVideosInFolder } from '@/lib/google-drive';

const videos = await getVideosInFolder('FOLDER_ID');
// [{ id: "...", name: "...", mimeType: "video/mp4", ... }]
```

#### 주차별 동영상 조회
```typescript
import { getWeekVideos } from '@/lib/google-drive';

const videos = await getWeekVideos('8기', 3);
// [{ id: "...", name: "...", ... }]
```

## 컴포넌트 사용

### VideoPlayer 컴포넌트

기존 `VideoPlayer` 컴포넌트는 자동으로 Google Drive URL을 임베드 URL로 변환합니다:

```tsx
import { VideoPlayer } from '@/components/video-player';

<VideoPlayer url="https://drive.google.com/file/d/1ABC123/view" />
// 또는 파일 ID만 전달
<VideoPlayer url="1ABC123" />
```

### VideoCard 컴포넌트

`VideoCard` 컴포넌트는 `driveFileId` prop을 받아 Google Drive 동영상을 표시합니다:

```tsx
import { VideoCard } from '@/components/video-card';

<VideoCard
  id="video-1"
  title="강의 제목"
  description="강의 설명"
  driveFileId="1ABC123"
/>
```

## 데이터베이스 연동

### Video 모델의 url 필드 활용

현재 `Video` 모델의 `url` 필드에 Google Drive URL이 저장되어 있다면, 유틸리티 함수로 파일 ID를 추출할 수 있습니다:

```typescript
import { extractDriveFileIdFromVideo } from '@/lib/video-utils';

const video = await prisma.video.findUnique({ where: { id: '...' } });
const fileId = extractDriveFileIdFromVideo(video.url);
```

### Prisma 스키마 확장 (선택사항)

필요한 경우 `Video` 모델에 `driveFileId` 필드를 추가할 수 있습니다:

```prisma
model Video {
  id          String   @id @default(cuid())
  title       String
  description String?
  url         String
  driveFileId String?  // 추가 필드
  courseId    String
  // ...
}
```

## 보안 고려사항

1. **Rate Limiting**: API 엔드포인트는 1분에 20회 요청으로 제한됩니다.
2. **Service Account 권한**: 읽기 전용 권한만 부여하는 것을 권장합니다.
3. **환경변수 보안**: Service Account 인증 정보는 환경변수로 관리하세요.
4. **캐싱**: API 응답은 5분간 캐시됩니다.

## 폴더 구조

Google Drive 폴더 구조는 다음과 같이 구성되어야 합니다:

```
기수 폴더 (예: "8기")
  └── 1주차/
      ├── 동영상1.mp4
      ├── 동영상2.mp4
      └── ...
  └── 2주차/
      └── ...
```

## 에러 처리

- 폴더를 찾을 수 없는 경우: 빈 배열 반환
- 인증 실패: 500 에러 반환
- Rate limit 초과: 429 에러 반환

## 예제

### 전체 워크플로우 예제

```typescript
// 1. Google Drive에서 동영상 목록 가져오기
const response = await fetch('/api/drive/videos?batch=8기&week=3');
const { videos } = await response.json();

// 2. 데이터베이스에 저장 (선택사항)
for (const video of videos) {
  await prisma.video.create({
    data: {
      title: video.name,
      url: video.viewLink,
      courseId: 'devsecops-course',
      // ...
    },
  });
}

// 3. 컴포넌트에서 표시
{videos.map((video) => (
  <VideoCard
    key={video.id}
    id={video.id}
    title={video.name}
    description={null}
    driveFileId={video.id}
  />
))}
```

## 참고 자료

- [Google Drive API 문서](https://developers.google.com/drive/api/v3/about-sdk)
- [share 폴더 README](../share/README.md)
- [share/services/drive_service.py](../share/services/drive_service.py)

