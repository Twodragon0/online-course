# Vercel 배포 및 로그 확인 가이드

이 문서는 GitHub 커밋 후 Vercel 배포 상태와 로그를 확인하는 방법을 안내합니다.

## 1. GitHub Actions 확인

### 웹에서 확인
1. GitHub 저장소 접속: https://github.com/Twodragon0/online-course
2. **Actions** 탭 클릭
3. 최신 워크플로우 실행 상태 확인
4. 빌드가 성공적으로 완료되었는지 확인

### 명령어로 확인
```bash
# GitHub CLI 사용 (설치 필요: brew install gh)
gh run list --limit 5
gh run watch
```

## 2. Vercel 배포 확인

### 웹 대시보드에서 확인
1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. **Deployments** 탭 확인
4. 최신 배포 상태 확인:
   - ✅ **Ready**: 배포 성공
   - ⏳ **Building**: 빌드 중
   - ❌ **Error**: 배포 실패

### 명령어로 확인
```bash
# Vercel CLI 설치 (아직 없다면)
npm install -g vercel

# Vercel 로그인
vercel login

# 최근 배포 확인
vercel ls

# 특정 배포의 로그 확인
vercel logs [deployment-url]
```

## 3. 배포 로그 확인

### Vercel 대시보드에서
1. Vercel 대시보드 → 프로젝트 → **Deployments**
2. 최신 배포 클릭
3. **Build Logs** 탭 확인 (빌드 과정)
4. **Runtime Logs** 탭 확인 (런타임 에러)

### 명령어로 확인
```bash
# 최근 로그 확인 (100개)
vercel logs --limit 100

# 에러만 필터링
vercel logs --limit 100 | grep -i "error\|fail\|exception"

# 특정 배포의 로그
vercel logs [deployment-url] --output=raw
```

## 4. 일반적인 문제 해결

### 빌드 실패

**증상**: Build Logs에 에러 메시지

**해결 방법**:
1. 빌드 로그에서 에러 메시지 확인
2. 일반적인 원인:
   - 환경 변수 누락
   - 타입 에러
   - 의존성 문제
   - Prisma 마이그레이션 필요

**체크리스트**:
- [ ] `DATABASE_URL` 설정 확인
- [ ] `DEEPSEEK_API_KEY` 또는 `GOOGLE_GEMINI_API_KEY` 설정 확인
- [ ] `NEXTAUTH_SECRET` 설정 확인
- [ ] `NEXTAUTH_URL` 설정 확인
- [ ] 타입 에러 확인: `npm run type-check`

### 런타임 에러

**증상**: 배포는 성공했지만 앱이 작동하지 않음

**해결 방법**:
1. Runtime Logs 확인
2. 일반적인 원인:
   - 환경 변수 누락
   - 데이터베이스 연결 실패
   - API 키 오류

**체크리스트**:
- [ ] 모든 필수 환경 변수 설정 확인
- [ ] 데이터베이스 연결 확인
- [ ] API 키 형식 확인

### 환경 변수 문제

**증상**: "API key is not configured" 에러

**해결 방법**:
1. Vercel 대시보드 → Settings → Environment Variables
2. 다음 변수 확인:
   - `DEEPSEEK_API_KEY` (우선)
   - `GOOGLE_GEMINI_API_KEY` (fallback)
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. 환경 변수 추가 후 **Redeploy** 실행

## 5. 자동화된 체크 스크립트

프로젝트에 포함된 스크립트 사용:

```bash
# Vercel 로그 확인
./scripts/check-vercel-logs.sh

# GitHub Actions 확인
./scripts/check-github-actions.sh
```

## 6. 배포 후 확인사항

### 기능 테스트
1. **홈페이지 접속**: 배포된 URL 확인
2. **채팅 기능**: AI Assistant 테스트
3. **로그인 기능**: Google OAuth 테스트
4. **코스 목록**: `/courses` 페이지 확인
5. **비디오 재생**: 비디오 플레이어 테스트

### API 테스트
```bash
# 채팅 API 테스트
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "테스트", "category": "general", "sessionId": "test"}'

# 코스 API 테스트
curl https://your-domain.com/api/courses

# 비디오 API 테스트
curl https://your-domain.com/api/videos
```

## 7. 모니터링

### Vercel Analytics
- Vercel 대시보드 → Analytics 탭
- 트래픽, 성능, 에러율 확인

### 로그 모니터링
- Vercel 대시보드 → Logs 탭
- 실시간 로그 확인
- 에러 알림 설정

## 8. 문제 해결 체크리스트

배포 문제 발생 시:

- [ ] GitHub Actions 빌드 성공 확인
- [ ] Vercel 배포 상태 확인
- [ ] 빌드 로그 확인
- [ ] 런타임 로그 확인
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 연결 확인
- [ ] API 키 설정 확인
- [ ] 타입 에러 확인
- [ ] 의존성 문제 확인

## 9. 빠른 참조

### 주요 명령어
```bash
# 로컬 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# Vercel 로그인
vercel login

# 배포 목록
vercel ls

# 로그 확인
vercel logs --limit 100

# 환경 변수 확인 (로컬)
cat .env
```

### 주요 URL
- GitHub: https://github.com/Twodragon0/online-course
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions: https://github.com/Twodragon0/online-course/actions

## 10. 지원

문제가 지속되면:
1. Vercel 로그 확인
2. GitHub Issues에 문제 보고
3. 프로젝트 관리자에게 문의




