# DevSecOps 과정 동기화 가이드

Google Drive에서 DevSecOps 과정 비디오를 가져와 데이터베이스에 추가하는 방법입니다.

## 방법 1: API 엔드포인트 사용 (권장)

### 1. 관리자로 로그인

먼저 관리자 계정으로 로그인해야 합니다.

### 2. API 호출

```bash
# 로컬 개발 환경
curl -X POST http://localhost:3000/api/courses/sync-devsecops \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"folderId": "1SaaPQmXPTyAtceM8BMv7xFKwCPg55L6Y"}'
```

또는 브라우저에서:
1. 관리자로 로그인
2. 개발자 도구 콘솔에서 실행:
```javascript
fetch('/api/courses/sync-devsecops', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ folderId: '1SaaPQmXPTyAtceM8BMv7xFKwCPg55L6Y' })
})
.then(r => r.json())
.then(console.log);
```

### 3. 응답 확인

성공 시:
```json
{
  "success": true,
  "message": "DevSecOps 과정 동기화 완료",
  "results": {
    "courseId": "course-id",
    "foldersProcessed": 3,
    "videosAdded": 25,
    "errors": []
  }
}
```

## 방법 2: 스크립트 직접 실행

### 1. 환경 변수 확인

`.env` 파일에 다음이 설정되어 있어야 합니다:
- `DATABASE_URL` - PostgreSQL 연결 URL
- `GOOGLE_CREDENTIALS` 또는 `GOOGLE_CREDENTIALS_PATH` - Google Service Account 인증 정보

### 2. 스크립트 실행

```bash
# TypeScript 실행
npx ts-node scripts/sync-devsecops-course.ts

# 또는 tsx 사용
npx tsx scripts/sync-devsecops-course.ts
```

## 처리되는 폴더

다음 폴더들이 자동으로 처리됩니다:

1. **클라우드 시큐리티 1기** - 우선 처리
2. **5기 클라우드 거버넌스** - 우선 처리
3. **클라우드 거버넌스 서기원님 자료** - 우선 처리
4. 기타 DevSecOps 관련 폴더 (키워드: devsecops, 클라우드 시큐리티, 보안, security 등)

## 생성되는 코스

- **제목**: 🛡️ DevSecOps & 클라우드 보안
- **설명**: DevSecOps와 클라우드 보안에 대한 종합적인 학습 과정입니다. 보안을 개발 프로세스에 통합하고, 클라우드 환경에서의 보안 모범 사례를 학습합니다.
- **가격**: 무료 (0원)

## 비디오 구조

각 폴더의 비디오는 다음과 같이 구성됩니다:

- 하위 폴더가 있는 경우: `{하위폴더명} - {비디오명}`
- 직접 비디오: `{비디오명}`

비디오는 `position` 필드로 순서가 관리되며, 자동으로 증가합니다.

## 문제 해결

### Google Drive 인증 오류

```
Error: Google Drive credentials not found
```

**해결**:
1. `GOOGLE_CREDENTIALS` 환경 변수 확인
2. 또는 `GOOGLE_CREDENTIALS_PATH`로 파일 경로 지정
3. Service Account JSON 파일이 올바른지 확인

### 데이터베이스 연결 오류

```
Error: Database not configured
```

**해결**:
1. `DATABASE_URL` 환경 변수 확인
2. 데이터베이스가 실행 중인지 확인
3. Prisma Client 생성: `npx prisma generate`

### 권한 오류

```
Error: 관리자 권한이 필요합니다
```

**해결**:
1. 관리자 이메일로 로그인
2. `ADMIN_EMAILS` 환경 변수에 이메일 추가

## 수동으로 코스 생성

API나 스크립트를 사용하지 않고 수동으로 생성하려면:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 코스 생성
const course = await prisma.course.create({
  data: {
    title: '🛡️ DevSecOps & 클라우드 보안',
    description: '...',
    price: 0,
  },
});

// 비디오 추가
await prisma.video.create({
  data: {
    courseId: course.id,
    title: '비디오 제목',
    description: '비디오 설명',
    url: 'https://drive.google.com/file/d/FILE_ID/view',
    position: 1,
  },
});
```

## 참고

- Google Drive 폴더 ID: `1SaaPQmXPTyAtceM8BMv7xFKwCPg55L6Y`
- API 엔드포인트: `/api/courses/sync-devsecops`
- 스크립트 경로: `scripts/sync-devsecops-course.ts`



