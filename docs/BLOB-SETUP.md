# Vercel Blob Storage 설정 가이드

이 프로젝트는 Vercel Blob Storage를 사용하여 파일 업로드 및 저장 기능을 제공합니다.

## Vercel Blob Storage 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택 → **Storage** 탭
3. **Create Database** → **Blob** 선택
4. 이름 입력 (예: `blob-online-course`)
5. 리전 선택 (예: `ICN1` - 서울)
6. **Create** 클릭

## 환경 변수 설정

Vercel Blob Storage를 생성하면 자동으로 환경 변수가 설정됩니다:
- `BLOB_READ_WRITE_TOKEN`: Blob Storage 읽기/쓰기 토큰

### 로컬 개발 환경

`.env.local` 파일에 토큰 추가:
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

토큰은 Vercel Dashboard → 프로젝트 → Storage → Blob → Settings에서 확인할 수 있습니다.

## 사용 방법

### 1. 파일 업로드 API

```typescript
// POST /api/upload
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'courses'); // 선택사항

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const { url, pathname } = await response.json();
```

### 2. FileUpload 컴포넌트 사용

```tsx
import { FileUpload } from '@/components/file-upload';

<FileUpload
  folder="courses"
  accept="application/pdf,image/*"
  maxSize={10 * 1024 * 1024} // 10MB
  onUploadComplete={(url, pathname) => {
    console.log('Uploaded:', url);
  }}
  onUploadError={(error) => {
    console.error('Upload error:', error);
  }}
/>
```

### 3. PDF 카드에 Blob URL 사용

```tsx
import { PdfCard } from '@/components/pdf-card';

<PdfCard
  id="pdf-1"
  title="PDF 문서"
  description="설명"
  blobUrl="https://xxxxx.public.blob.vercel-storage.com/..."
/>
```

## 지원하는 파일 형식

- **PDF**: `application/pdf`
- **이미지**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

## 파일 크기 제한

- 기본 최대 크기: **10MB**
- API에서 조정 가능

## 폴더 구조

파일은 다음과 같은 폴더 구조로 저장됩니다:
- `courses/`: 코스 관련 파일 (이미지, PDF)
- `users/`: 사용자 프로필 이미지
- `pdfs/`: PDF 문서

## API 엔드포인트

### POST /api/upload
파일 업로드
- **Rate Limit**: 1분에 10회
- **인증**: 필요
- **Body**: FormData
  - `file`: 파일
  - `folder`: 폴더명 (선택사항)

### GET /api/upload?prefix=courses/
파일 목록 조회
- **Rate Limit**: 1분에 30회
- **Query Parameters**:
  - `prefix`: 경로 prefix (선택사항)
  - `limit`: 최대 개수 (기본 100)

### DELETE /api/upload/delete
파일 삭제
- **Rate Limit**: 1분에 10회
- **인증**: 필요
- **Body**: `{ url: string }`

## 보안 고려사항

1. **인증 필요**: 모든 업로드/삭제 작업은 인증이 필요합니다.
2. **파일 검증**: 파일 형식, 크기, MIME 타입 검증
3. **파일명 Sanitization**: 경로 탐색 공격 방지
4. **Rate Limiting**: Redis 기반 rate limiting 적용

## 무료 티어 제한

Vercel Blob Storage 무료 티어:
- **Storage**: 1GB
- **Simple Operations**: 10,000회/일
- **Advanced Operations**: 2,000회/일
- **Data Transfer**: 10GB/월

## 문제 해결

### 파일 업로드 실패
- `BLOB_READ_WRITE_TOKEN` 환경 변수 확인
- 파일 크기 제한 확인
- 파일 형식 확인

### 인증 오류
- 세션이 유효한지 확인
- 로그인 상태 확인

### Rate Limit 초과
- 요청 빈도 확인
- Redis 연결 상태 확인

## 참고 자료

- [Vercel Blob Storage 문서](https://vercel.com/docs/storage/vercel-blob)
- [@vercel/blob 패키지](https://github.com/vercel/storage/tree/main/packages/blob)








