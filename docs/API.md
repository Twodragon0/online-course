# API 문서

이 문서는 온라인 코스 플랫폼의 모든 API 엔드포인트에 대한 상세한 설명을 제공합니다.

## 목차

- [인증 API](#인증-api)
- [코스 및 비디오 API](#코스-및-비디오-api)
- [채팅 API](#채팅-api)
- [구독 및 결제 API](#구독-및-결제-api)
- [파일 업로드 API](#파일-업로드-api)
- [웹훅](#웹훅)

---

## 인증 API

### POST /api/register

사용자 등록을 처리합니다.

**Rate Limit**: 5회/분

**요청 본문**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "사용자 이름"
}
```

**응답** (201 Created):
```json
{
  "user": {
    "email": "user@example.com",
    "name": "사용자 이름"
  }
}
```

**에러 응답**:
- `400`: 입력 검증 실패
- `429`: Rate limit 초과
- `500`: 서버 오류

**비밀번호 요구사항**:
- 최소 8자 이상
- 대문자, 소문자, 숫자 포함
- 최대 128자

---

### GET/POST /api/auth/[...nextauth]

NextAuth.js 인증 엔드포인트입니다.

**인증 방법**: Google OAuth

**세션 전략**: Database (프로덕션) 또는 JWT (개발)

자세한 내용은 [NextAuth.js 문서](https://next-auth.js.org)를 참조하세요.

---

## 코스 및 비디오 API

### GET /api/videos

비디오 목록을 조회합니다.

**Rate Limit**: 30회/분

**인증**: 불필요

**쿼리 파라미터**: 없음

**응답** (200 OK):
```json
[
  {
    "id": "video-id",
    "title": "비디오 제목",
    "description": "비디오 설명",
    "url": "https://...",
    "courseId": "course-id",
    "position": 1,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "course": {
      "id": "course-id",
      "title": "코스 제목",
      "description": "코스 설명",
      "price": 0,
      "imageUrl": null
    }
  }
]
```

**캐시**: 5분 (public, s-maxage=300)

---

### GET /api/drive/videos

Google Drive에서 동영상 강의를 조회합니다.

**Rate Limit**: 20회/분

**인증**: 불필요

**쿼리 파라미터**:
- `batch` (선택): 기수 (예: "3기")
- `week` (필수): 주차 번호 (예: 3)
- `folderId` (선택): 직접 폴더 ID 지정
- `all` (선택): 모든 기수 조회 (true/false)

**예시 요청**:
```
GET /api/drive/videos?batch=3기&week=3
GET /api/drive/videos?folderId=abc123
GET /api/drive/videos?week=3&all=true
```

**응답** (200 OK):
```json
{
  "batch": "3기",
  "week": 3,
  "videos": [
    {
      "id": "file-id",
      "name": "비디오 파일명.mp4",
      "mimeType": "video/mp4",
      "link": "https://drive.google.com/file/d/.../preview",
      "viewLink": "https://drive.google.com/file/d/.../view",
      "thumbnailLink": "https://..."
    }
  ]
}
```

**에러 응답**:
- `400`: 필수 파라미터 누락 또는 유효하지 않은 값
- `429`: Rate limit 초과
- `500`: 서버 오류

---

### POST /api/video-summary

비디오 요약을 생성합니다.

**Rate Limit**: 10회/분

**인증**: 불필요

**요청 본문**:
```json
{
  "fileId": "google-drive-file-id",
  "courseType": "devsecops"
}
```

**응답** (200 OK):
```json
{
  "summary": "비디오 요약 내용...",
  "title": "비디오 제목"
}
```

**에러 응답**:
- `400`: 유효하지 않은 파일 ID 또는 코스 타입
- `429`: Rate limit 초과
- `500`: 서버 오류

**코스 타입**: `devsecops` 또는 `aiSns`

---

### POST /api/related-questions

관련 질문을 생성합니다.

**Rate Limit**: 20회/분

**인증**: 불필요

**요청 본문**:
```json
{
  "response": "AI 응답 내용..."
}
```

**응답** (200 OK):
```json
{
  "questions": [
    "질문 1",
    "질문 2",
    "질문 3"
  ]
}
```

**에러 응답**:
- `400`: 응답 내용 누락 또는 유효하지 않음
- `429`: Rate limit 초과
- `500`: 서버 오류

---

## 채팅 API

### POST /api/chat

AI 채팅 메시지를 전송합니다.

**Rate Limit**: 20회/분

**인증**: 불필요 (하지만 사용자 ID가 있으면 채팅 기록 저장)

**요청 본문**:
```json
{
  "message": "사용자 메시지",
  "category": "devsecops",
  "sessionId": "session-id"
}
```

**응답** (200 OK):
```json
{
  "response": "AI 응답 내용...",
  "logId": "chat-log-id"
}
```

**에러 응답**:
- `400`: 메시지 누락 또는 유효하지 않음
- `429`: Rate limit 초과
- `502`: AI 서비스 오류
- `503`: 서비스 일시 중단
- `504`: 요청 시간 초과

**카테고리**: `general`, `devsecops`, `aiSns`, `cloud`

**메시지 제한**: 최대 5000자

---

## 구독 및 결제 API

### GET /api/subscription

구독 정보를 조회합니다.

**Rate Limit**: 20회/분

**인증**: 필수

**응답** (200 OK):
```json
{
  "status": "success",
  "subscriptionStatus": "active"
}
```

**에러 응답**:
- `401`: 인증 필요
- `404`: 사용자를 찾을 수 없음
- `429`: Rate limit 초과
- `500`: 서버 오류

**구독 상태**: `active` 또는 `inactive`

---

### POST /api/subscription

구독을 생성하거나 업데이트합니다.

**Rate Limit**: 5회/분

**인증**: 필수

**요청 본문**: 없음 (현재는 더미 응답)

**응답** (200 OK):
```json
{
  "status": "success"
}
```

---

### POST /api/create-payment-session

Stripe 결제 세션을 생성합니다.

**Rate Limit**: 5회/분

**인증**: 필수

**요청 본문**:
```json
{
  "priceId": "price_xxxxx"
}
```

**응답** (200 OK):
```json
{
  "sessionId": "cs_test_xxxxx"
}
```

**에러 응답**:
- `400`: 유효하지 않은 가격 ID
- `401`: 인증 필요
- `429`: Rate limit 초과
- `500`: 서버 오류

---

### GET /api/stripe

Stripe 고객 정보를 조회합니다.

**Rate Limit**: 20회/분

**인증**: 필수

**응답** (200 OK):
```json
{
  "customer": {
    "id": "cus_xxxxx",
    "email": "user@example.com"
  }
}
```

---

## 파일 업로드 API

### POST /api/upload

파일을 업로드합니다.

**Rate Limit**: 10회/분

**인증**: 필수

**요청 형식**: `multipart/form-data`

**파라미터**:
- `file` (필수): 업로드할 파일
- `folder` (선택): 폴더 경로 (예: "courses", "users", "pdfs")

**허용 파일 형식**:
- PDF: `.pdf`
- 이미지: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

**최대 파일 크기**: 10MB

**응답** (200 OK):
```json
{
  "success": true,
  "url": "https://blob.vercel-storage.com/...",
  "pathname": "/path/to/file.pdf",
  "size": 1024,
  "contentType": "application/pdf"
}
```

**에러 응답**:
- `400`: 파일 누락 또는 유효하지 않음
- `401`: 인증 필요
- `429`: Rate limit 초과
- `500`: 서버 오류

---

### GET /api/upload

업로드된 파일 목록을 조회합니다.

**Rate Limit**: 30회/분

**인증**: 불필요

**쿼리 파라미터**:
- `prefix` (선택): 경로 prefix (예: "courses/")
- `limit` (선택): 최대 개수 (기본: 100, 최대: 100)

**응답** (200 OK):
```json
{
  "files": [
    {
      "url": "https://blob.vercel-storage.com/...",
      "pathname": "/path/to/file.pdf",
      "contentType": "application/pdf",
      "size": 1024,
      "uploadedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### DELETE /api/upload/delete

파일을 삭제합니다.

**Rate Limit**: 10회/분

**인증**: 필수

**요청 본문**:
```json
{
  "url": "https://blob.vercel-storage.com/..."
}
```

**응답** (200 OK):
```json
{
  "success": true,
  "message": "파일이 삭제되었습니다."
}
```

**에러 응답**:
- `400`: 유효하지 않은 URL
- `401`: 인증 필요
- `429`: Rate limit 초과
- `500`: 서버 오류

---

## 웹훅

### POST /api/webhooks/stripe

Stripe 웹훅을 처리합니다.

**인증**: Stripe 서명 검증

**처리 이벤트**:
- `checkout.session.completed`: 결제 완료 시 구독 활성화
- `customer.subscription.updated`: 구독 상태 업데이트
- `customer.subscription.deleted`: 구독 취소 시 비활성화

**응답** (200 OK):
```json
{
  "received": true
}
```

---

### POST /api/webhooks/paypal

PayPal 웹훅을 처리합니다.

**인증**: PayPal 서명 검증

**처리 이벤트**:
- `PAYMENT.SALE.COMPLETED`: 결제 완료 시 구독 활성화
- `BILLING.SUBSCRIPTION.CREATED`: 구독 생성
- `BILLING.SUBSCRIPTION.ACTIVATED`: 구독 활성화
- `BILLING.SUBSCRIPTION.CANCELLED`: 구독 취소
- `BILLING.SUBSCRIPTION.EXPIRED`: 구독 만료
- `BILLING.SUBSCRIPTION.UPDATED`: 구독 업데이트

**응답** (200 OK):
```json
{
  "received": true
}
```

---

## 공통 응답 형식

### 성공 응답

대부분의 API는 JSON 형식으로 응답합니다. 성공 시 적절한 HTTP 상태 코드와 함께 데이터를 반환합니다.

### 에러 응답

모든 에러는 다음 형식을 따릅니다:

```json
{
  "error": "에러 메시지"
}
```

### Rate Limit 헤더

Rate limit이 적용되는 API는 다음 헤더를 포함합니다:

- `X-RateLimit-Limit`: 최대 요청 수
- `X-RateLimit-Remaining`: 남은 요청 수
- `X-RateLimit-Reset`: 리셋 시간 (Unix timestamp)
- `Retry-After`: 재시도까지 대기 시간 (초)

Rate limit 초과 시 `429 Too Many Requests` 상태 코드와 함께 다음 응답을 반환합니다:

```json
{
  "error": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
}
```

---

## 보안 고려사항

1. **인증**: 대부분의 API는 NextAuth.js를 통한 세션 인증을 사용합니다.
2. **Rate Limiting**: 모든 API는 IP 기반 rate limiting을 적용합니다.
3. **입력 검증**: 모든 사용자 입력은 검증 및 sanitization을 거칩니다.
4. **XSS 방지**: 모든 입력은 HTML 이스케이프 처리됩니다.
5. **SQL Injection 방지**: Prisma의 파라미터화된 쿼리를 사용합니다.

---

## 추가 리소스

- [agents.md](../agents.md): 프로젝트 가이드라인
- [REPOSITORY-CHECK.md](../REPOSITORY-CHECK.md): 코드베이스 체크 리포트
- [Next.js 문서](https://nextjs.org/docs)
- [NextAuth.js 문서](https://next-auth.js.org)
- [Stripe API 문서](https://stripe.com/docs/api)
- [PayPal API 문서](https://developer.paypal.com/docs/api)




