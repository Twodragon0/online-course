# 다중 도메인 설정 가이드

## 개요

이 애플리케이션은 여러 도메인에서 동작하도록 설계되었습니다:
- `https://edu.2twodragon.com` (프로덕션 도메인)
- `https://twodragon.vercel.app` (Vercel 기본 도메인)

## 동적 도메인 처리

NextAuth는 요청의 호스트를 기반으로 동적으로 `NEXTAUTH_URL`을 설정합니다. 이를 통해 여러 도메인에서 동일한 코드베이스로 작동할 수 있습니다.

## Vercel 환경 변수 설정

### 방법 1: NEXTAUTH_URL 설정 (권장)

Vercel 대시보드에서 `NEXTAUTH_URL`을 기본 도메인으로 설정:

```
NEXTAUTH_URL=https://edu.2twodragon.com
```

이 경우 코드가 요청 호스트를 확인하여 동적으로 처리합니다.

### 방법 2: NEXTAUTH_URL 미설정

`NEXTAUTH_URL`을 설정하지 않으면 요청의 호스트를 기반으로 자동으로 설정됩니다.

## Google OAuth 설정

Google Cloud Console에서 두 도메인 모두 승인된 리디렉션 URI로 추가해야 합니다:

1. Google Cloud Console 접속
2. APIs & Services → Credentials
3. OAuth 2.0 Client ID 선택
4. Authorized redirect URIs에 다음 추가:
   - `https://edu.2twodragon.com/api/auth/callback/google`
   - `https://twodragon.vercel.app/api/auth/callback/google`

## 도메인 확인

### 허용된 도메인 목록

다음 도메인들이 허용됩니다:
- `edu.2twodragon.com`
- `twodragon.vercel.app`
- `*.vercel.app` (Vercel 프리뷰 배포)
- `localhost` (개발 환경)

### 미들웨어 설정

`middleware.ts`에서 허용된 도메인 목록을 관리합니다:

```typescript
const ALLOWED_DOMAINS = [
  'edu.2twodragon.com',
  'twodragon.vercel.app',
  'vercel.app',
  'localhost',
];
```

## 문제 해결

### 홈 화면 에러

만약 `edu.2twodragon.com`에서 홈 화면 에러가 발생한다면:

1. **Vercel 로그 확인**:
   ```bash
   vercel logs
   ```

2. **환경 변수 확인**:
   - Vercel 대시보드 → Settings → Environment Variables
   - `NEXTAUTH_URL`이 올바르게 설정되었는지 확인

3. **도메인 설정 확인**:
   - Vercel 대시보드 → Settings → Domains
   - `edu.2twodragon.com`이 올바르게 연결되었는지 확인

4. **재배포**:
   - 변경사항 적용을 위해 재배포 필요

### NextAuth 콜백 오류

Google OAuth 콜백이 실패하는 경우:

1. Google Cloud Console에서 리디렉션 URI 확인
2. `NEXTAUTH_URL`이 올바른 도메인으로 설정되었는지 확인
3. `NEXTAUTH_SECRET`이 설정되었는지 확인

## GitHub Actions 로그 확인

GitHub Actions에서 배포 로그를 확인하려면:

1. GitHub 저장소 → Actions 탭
2. 최근 워크플로우 실행 선택
3. 빌드 및 배포 로그 확인

## 참고사항

- 프로덕션 환경에서는 HTTPS가 필수입니다
- 쿠키는 `secure` 플래그가 설정되어 HTTPS에서만 작동합니다
- CORS 설정은 미들웨어에서 관리됩니다




