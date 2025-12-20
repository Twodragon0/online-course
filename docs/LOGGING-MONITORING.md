# 로깅 및 모니터링 가이드

이 프로젝트는 GitHub Actions와 Vercel 배포를 자동으로 모니터링하고 문제를 감지하여 해결하는 시스템을 포함합니다.

## 개요

### 자동 모니터링 시스템

- **GitHub Actions 워크플로우**: 매시간 자동으로 실행되어 로그를 확인하고 문제를 감지합니다.
- **Vercel 배포 모니터링**: 배포 상태와 로그를 실시간으로 확인합니다.
- **자동 해결**: 일반적인 문제를 자동으로 해결하려고 시도합니다.

## 스크립트

### 1. `scripts/monitor-logs.sh`

종합 로그 모니터링 스크립트입니다.

**기능:**
- GitHub Actions 상태 확인
- Vercel 배포 상태 확인
- Vercel 로그 에러 확인
- Prisma 스키마 검증
- 빌드 테스트
- 자동 해결 시도

**사용법:**
```bash
# 환경 변수 설정
export GITHUB_TOKEN="your_github_token"
export VERCEL_TOKEN="your_vercel_token"

# 스크립트 실행
./scripts/monitor-logs.sh
```

### 2. `scripts/check-github-actions.sh`

GitHub Actions 상태를 확인하는 스크립트입니다.

**기능:**
- 최근 워크플로우 실행 확인
- 실패한 워크플로우 감지
- 워크플로우 로그 확인

**사용법:**
```bash
# GitHub CLI 인증
export GITHUB_TOKEN="your_github_token"
gh auth login --with-token < <(echo "$GITHUB_TOKEN")

# 스크립트 실행
./scripts/check-github-actions.sh [repository]

# 예시
./scripts/check-github-actions.sh Twodragon0/online-course
```

### 3. `scripts/check-vercel-logs.sh`

Vercel 배포 및 로그를 확인하는 스크립트입니다.

**기능:**
- 최근 배포 확인
- 배포 상태 확인
- 에러 로그 필터링
- 특정 배포의 로그 확인

**사용법:**
```bash
# Vercel CLI 인증
export VERCEL_TOKEN="your_vercel_token"
echo "$VERCEL_TOKEN" | vercel login --token

# 스크립트 실행
./scripts/check-vercel-logs.sh

# 특정 배포의 로그 확인
./scripts/check-vercel-logs.sh <deployment-url>
```

## GitHub Actions 워크플로우

### `monitor-logs.yml`

매시간 자동으로 실행되는 모니터링 워크플로우입니다.

**트리거:**
- 스케줄: 매시간 (`0 * * * *`)
- 수동 실행: `workflow_dispatch`
- Push/Pull Request: main 브랜치

**기능:**
1. GitHub Actions 상태 확인
2. Vercel 배포 상태 확인
3. Vercel 로그 에러 확인
4. Prisma 스키마 검증
5. 빌드 테스트
6. 문제 발견 시 GitHub Issue 자동 생성

**필수 시크릿:**
- `GITHUB_TOKEN`: GitHub API 인증 (자동 제공)
- `VERCEL_TOKEN`: Vercel API 인증 (수동 설정 필요)

## Vercel Token 설정

### 1. Vercel 대시보드에서 Token 생성

1. Vercel 대시보드 접속: https://vercel.com/account/tokens
2. **Create Token** 클릭
3. Token 이름 입력 (예: "CI/CD Monitoring")
4. Scope 선택: **Full Account** 또는 **Specific Projects**
5. **Create** 클릭
6. 생성된 Token 복사

### 2. GitHub Secrets에 추가

1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. Name: `VERCEL_TOKEN`
4. Value: 생성한 Vercel Token
5. **Add secret** 클릭

## 로컬에서 사용하기

### 사전 요구사항

```bash
# GitHub CLI 설치
# macOS
brew install gh

# 또는 공식 설치 스크립트
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Vercel CLI 설치
npm install -g vercel
```

### 인증 설정

```bash
# GitHub CLI 인증
gh auth login

# 또는 Token 사용
export GITHUB_TOKEN="your_token"
echo "$GITHUB_TOKEN" | gh auth login --with-token

# Vercel CLI 인증
vercel login

# 또는 Token 사용
export VERCEL_TOKEN="your_token"
echo "$VERCEL_TOKEN" | vercel login --token
```

### 스크립트 실행

```bash
# 모든 모니터링 실행
./scripts/monitor-logs.sh

# GitHub Actions만 확인
./scripts/check-github-actions.sh

# Vercel만 확인
./scripts/check-vercel-logs.sh
```

## 문제 해결

### GitHub CLI 인증 실패

```bash
# 인증 상태 확인
gh auth status

# 재인증
gh auth login

# Token으로 인증
export GITHUB_TOKEN="your_token"
echo "$GITHUB_TOKEN" | gh auth login --with-token
```

### Vercel CLI 인증 실패

```bash
# 인증 상태 확인
vercel whoami

# 재인증
vercel login

# Token으로 인증
export VERCEL_TOKEN="your_token"
echo "$VERCEL_TOKEN" | vercel login --token
```

### 스크립트 실행 권한 오류

```bash
# 실행 권한 부여
chmod +x scripts/*.sh
```

### Prisma 스키마 검증 실패

```bash
# DATABASE_URL 설정
export DATABASE_URL="postgresql://user:password@localhost:5432/db?schema=public"

# Prisma 검증
npx prisma validate
```

## 모니터링 결과 확인

### GitHub Actions

1. GitHub 저장소 → **Actions** 탭
2. **Monitor Logs and Auto-Fix** 워크플로우 선택
3. 최근 실행 확인
4. **Summary** 섹션에서 상세 정보 확인

### 로그 파일

로컬에서 실행한 경우 `logs/` 디렉토리에 로그 파일이 생성됩니다:

```bash
ls -la logs/
```

## 자동 해결 기능

현재 자동으로 해결하려고 시도하는 문제:

1. **Prisma 스키마 검증**: 스키마 파일 확인
2. **의존성 문제**: `npm ci` 재실행
3. **빌드 실패**: 빌드 로그 분석 및 일반적인 문제 해결

## 알림 설정

문제가 발견되면:

1. GitHub Issue 자동 생성
2. 워크플로우 Summary에 상세 정보 표시
3. 로그 파일 저장 (7일간 보관)

## 추가 개선 사항

향후 추가할 수 있는 기능:

- Slack/Discord 알림
- 이메일 알림
- 자동 재배포
- 성능 메트릭 수집
- 에러 추적 (Sentry 등)



