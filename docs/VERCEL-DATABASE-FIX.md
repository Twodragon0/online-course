# Vercel DATABASE_URL 오류 해결 가이드

이 문서는 Vercel에서 발생하는 `DATABASE_URL` 관련 오류를 해결하는 방법을 안내합니다.

## 오류 메시지

```
Prisma Client is not initialized. DATABASE_URL is required.
Invalid `prisma.video.findUnique()` invocation: 
error: Error validating datasource `db`: 
the URL must start with the protocol `postgresql://` or `postgres://`.
```

## 원인

1. **DATABASE_URL이 설정되지 않음**: Vercel 환경 변수에 `DATABASE_URL`이 없음
2. **DATABASE_URL 형식 오류**: URL이 `postgresql://` 또는 `postgres://`로 시작하지 않음
3. **환경 변수가 배포에 반영되지 않음**: 환경 변수 추가 후 Redeploy를 하지 않음

## 해결 방법

### 1. Vercel에서 DATABASE_URL 설정

#### 방법 A: Vercel Postgres 사용 (권장)

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. **Storage** 탭 클릭
4. **Create Database** → **Postgres** 선택
5. 데이터베이스 생성
6. **Connect** 버튼 클릭
7. **Environment Variables** 섹션에서 `DATABASE_URL` 복사
8. **Settings** → **Environment Variables**로 이동
9. `DATABASE_URL` 추가:
   - Key: `DATABASE_URL`
   - Value: 복사한 연결 문자열
   - Environment: Production, Preview, Development (모두 선택)
10. **Save** 클릭
11. **Deployments** → 최신 배포 → **Redeploy** 클릭

#### 방법 B: 외부 PostgreSQL 사용

1. Vercel 대시보드 → **Settings** → **Environment Variables**
2. **Add New** 클릭
3. 다음 정보 입력:
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:password@host:port/database?sslmode=require`
   - Environment: Production, Preview, Development
4. **Save** 클릭
5. **Redeploy** 실행

### 2. DATABASE_URL 형식 확인

올바른 형식:
```
postgresql://user:password@host:port/database?sslmode=require
postgres://user:password@host:port/database?sslmode=require
postgresql+pooler://user:password@host:port/database?sslmode=require
```

잘못된 형식:
```
❌ mysql://... (MySQL은 지원하지 않음)
❌ mongodb://... (MongoDB는 지원하지 않음)
❌ postgresql:// (프로토콜만 있고 나머지 없음)
```

### 3. 환경 변수 확인

Vercel CLI로 확인:
```bash
# Vercel 로그인
vercel login

# 환경 변수 확인 (로컬에서는 확인 불가, 대시보드에서 확인)
# Vercel 대시보드 → Settings → Environment Variables
```

### 4. 배포 후 확인

1. **빌드 로그 확인**:
   - Vercel 대시보드 → Deployments → 최신 배포
   - **Build Logs** 탭에서 에러 확인

2. **런타임 로그 확인**:
   - Vercel 대시보드 → Deployments → 최신 배포
   - **Runtime Logs** 탭에서 에러 확인

3. **API 테스트**:
   ```bash
   curl https://edu.2twodragon.com/api/courses
   curl https://edu.2twodragon.com/api/videos
   ```

## 체크리스트

배포 전 확인:

- [ ] `DATABASE_URL`이 Vercel 환경 변수에 설정됨
- [ ] `DATABASE_URL`이 `postgresql://` 또는 `postgres://`로 시작함
- [ ] 환경 변수가 Production, Preview, Development 모두에 설정됨
- [ ] 환경 변수 추가 후 **Redeploy** 실행됨
- [ ] 데이터베이스가 실행 중이고 접근 가능함
- [ ] 방화벽 설정이 올바름 (외부 DB 사용 시)

## 문제 해결 단계

### Step 1: 환경 변수 확인
1. Vercel 대시보드 → Settings → Environment Variables
2. `DATABASE_URL` 존재 여부 확인
3. 값이 올바른 형식인지 확인

### Step 2: 형식 검증
```bash
# DATABASE_URL 형식 확인
echo $DATABASE_URL | grep -E "^postgresql://|^postgres://"
```

### Step 3: 연결 테스트
로컬에서 테스트:
```bash
# .env 파일에 DATABASE_URL 설정
DATABASE_URL="postgresql://..."

# Prisma 연결 테스트
npx prisma db pull
```

### Step 4: 재배포
환경 변수 수정 후:
1. Vercel 대시보드 → Deployments
2. 최신 배포 → **Redeploy** 클릭
3. 빌드 로그 확인

## 예방 조치

### 1. 환경 변수 검증 스크립트

배포 전 로컬에서 확인:
```bash
# .env 파일 확인
cat .env | grep DATABASE_URL

# 형식 검증
node -e "const url = process.env.DATABASE_URL; console.log(url?.startsWith('postgresql://') || url?.startsWith('postgres://') ? 'OK' : 'INVALID');"
```

### 2. CI/CD에서 검증

GitHub Actions에서 환경 변수 형식 검증 추가 (선택사항)

## 추가 리소스

- [Vercel Postgres 문서](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma 연결 가이드](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Vercel 환경 변수 설정](./VERCEL-ENV-SETUP.md)

## 지원

문제가 지속되면:
1. Vercel 로그 확인
2. Prisma 연결 문자열 검증
3. 데이터베이스 제공업체 문서 확인
4. 프로젝트 관리자에게 문의



