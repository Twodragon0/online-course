# 배포 상태 확인 결과

## 최근 커밋

- **커밋 해시**: `b8147e3`
- **메시지**: docs: 배포 및 로그 확인 가이드 추가
- **이전 커밋**: `322f48d` - feat: DeepSeek 우선 사용 및 Gemini fallback 통합

## 배포 확인 방법

### 1. GitHub Actions 확인

**웹에서 확인**:
- URL: https://github.com/Twodragon0/online-course/actions
- 최신 워크플로우 실행 상태 확인
- 빌드가 성공적으로 완료되었는지 확인

**명령어로 확인**:
```bash
# GitHub CLI 사용
gh run list --limit 5
gh run watch

# 또는 스크립트 사용
./scripts/check-github-actions.sh
```

### 2. Vercel 배포 확인

**웹 대시보드에서 확인**:
- URL: https://vercel.com/dashboard
- 프로젝트 선택
- **Deployments** 탭에서 최신 배포 상태 확인

**명령어로 확인**:
```bash
# Vercel 로그인 (필요시)
vercel login

# 최근 배포 확인
vercel ls

# 배포 상태 종합 확인
./scripts/check-deployment.sh
```

### 3. Vercel 로그 확인

**웹 대시보드에서**:
1. Vercel 대시보드 → 프로젝트 → **Deployments**
2. 최신 배포 클릭
3. **Build Logs** 탭 (빌드 과정)
4. **Runtime Logs** 탭 (런타임 에러)

**명령어로 확인**:
```bash
# 최근 로그 확인
vercel logs --limit 100

# 에러만 필터링
vercel logs --limit 100 | grep -i "error\|fail\|exception"

# Vercel 로그 확인 스크립트
./scripts/check-vercel-logs.sh
```

## 주요 변경사항

### 1. DeepSeek 우선 사용
- DeepSeek API를 우선 사용 (비용 최적화)
- Gemini는 fallback으로만 사용

### 2. 새로운 기능
- Google Drive 파일 분석 API (`/api/drive/analyze`)
- DevSecOps 과정 동기화 API (`/api/courses/sync-devsecops`)
- Gemini API 통합

### 3. 개선사항
- API 에러 처리 개선
- GitHub Actions CI 개선
- 문서 업데이트

## 환경 변수 체크리스트

Vercel에서 다음 환경 변수들이 설정되어 있는지 확인:

### 필수 환경 변수
- [ ] `DATABASE_URL` - PostgreSQL 연결 URL
- [ ] `NEXTAUTH_SECRET` - NextAuth 시크릿 키 (32자 이상)
- [ ] `NEXTAUTH_URL` - NextAuth URL (프로덕션 도메인)
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth 클라이언트 ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth 클라이언트 시크릿

### AI 서비스 API 키
- [ ] `DEEPSEEK_API_KEY` - DeepSeek API 키 (우선 사용, `sk-`로 시작)
- [ ] `GOOGLE_GEMINI_API_KEY` - Gemini API 키 (선택, fallback용)

### 선택적 환경 변수
- [ ] `OPENAI_API_KEY` - OpenAI API 키 (선택)
- [ ] `STRIPE_SECRET_KEY` - Stripe 시크릿 키
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe 공개 키
- [ ] 기타 결제 관련 변수

## 배포 후 테스트

### 1. 기본 기능 테스트
- [ ] 홈페이지 접속 확인
- [ ] 채팅 기능 테스트 (AI Assistant)
- [ ] 로그인 기능 테스트 (Google OAuth)
- [ ] 코스 목록 확인 (`/courses`)
- [ ] 비디오 재생 확인

### 2. API 테스트
```bash
# 채팅 API
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "테스트", "category": "general", "sessionId": "test"}'

# 코스 API
curl https://your-domain.com/api/courses

# 비디오 API
curl https://your-domain.com/api/videos
```

## 문제 해결

### 빌드 실패
1. 빌드 로그에서 에러 메시지 확인
2. 환경 변수 누락 확인
3. 타입 에러 확인: `npm run type-check`
4. 의존성 문제 확인

### 런타임 에러
1. Runtime Logs 확인
2. 환경 변수 설정 확인
3. 데이터베이스 연결 확인
4. API 키 형식 확인

### 환경 변수 문제
1. Vercel 대시보드 → Settings → Environment Variables
2. 모든 필수 변수 설정 확인
3. 환경 변수 추가 후 **Redeploy** 실행

## 참고 문서

- [배포 가이드](./DEPLOYMENT-GUIDE.md)
- [Vercel 환경 변수 설정](./VERCEL-ENV-SETUP.md)
- [Vercel 배포 확인 가이드](./docs/VERCEL-DEPLOYMENT-CHECK.md)
- [Gemini 설정 가이드](./docs/GEMINI-SETUP.md)
- [DevSecOps 동기화 가이드](./docs/DEVSECOPS-SYNC.md)

## 빠른 명령어 참조

```bash
# 로컬 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# 배포 상태 종합 확인
./scripts/check-deployment.sh

# Vercel 로그 확인
./scripts/check-vercel-logs.sh

# GitHub Actions 확인
./scripts/check-github-actions.sh
```

## 다음 단계

1. ✅ GitHub에 커밋 완료
2. ⏳ GitHub Actions 빌드 확인 (자동 실행 중)
3. ⏳ Vercel 자동 배포 확인 (GitHub 푸시 시 자동 트리거)
4. ⏳ 배포 후 기능 테스트
5. ⏳ 로그 모니터링

---

**마지막 업데이트**: $(date +'%Y-%m-%d %H:%M:%S')
