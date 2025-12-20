#!/bin/bash

# 로그 모니터링 및 자동 해결 스크립트
# GitHub Actions와 Vercel 배포를 모니터링하고 문제를 자동으로 해결합니다.

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 로그 파일
LOG_FILE="logs/monitor-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

# GitHub Actions 로그 확인
check_github_actions() {
    log "GitHub Actions 상태 확인 중..."
    
    if [ -z "$GITHUB_TOKEN" ]; then
        warn "GITHUB_TOKEN이 설정되지 않았습니다. GitHub API를 사용할 수 없습니다."
        return 1
    fi
    
    # 최근 워크플로우 실행 확인
    RECENT_RUNS=$(gh api repos/Twodragon0/online-course/actions/runs --jq '.workflow_runs[0:5]' 2>/dev/null || echo "[]")
    
    if [ "$RECENT_RUNS" = "[]" ]; then
        warn "GitHub Actions 실행 내역을 가져올 수 없습니다."
        return 1
    fi
    
    # 실패한 워크플로우 확인
    FAILED_RUNS=$(echo "$RECENT_RUNS" | jq -r '.[] | select(.conclusion == "failure") | "\(.name) - \(.html_url)"' 2>/dev/null || echo "")
    
    if [ -n "$FAILED_RUNS" ]; then
        error "실패한 GitHub Actions 워크플로우 발견:"
        echo "$FAILED_RUNS" | while read -r line; do
            error "  - $line"
        done
        return 1
    else
        log "모든 GitHub Actions 워크플로우가 성공했습니다."
        return 0
    fi
}

# Vercel 배포 로그 확인
check_vercel_deployments() {
    log "Vercel 배포 상태 확인 중..."
    
    if ! command -v vercel &> /dev/null; then
        warn "Vercel CLI가 설치되지 않았습니다. 'npm i -g vercel'로 설치하세요."
        return 1
    fi
    
    # 최근 배포 확인
    DEPLOYMENTS=$(vercel ls --json 2>/dev/null || echo "[]")
    
    if [ "$DEPLOYMENTS" = "[]" ]; then
        warn "Vercel 배포 정보를 가져올 수 없습니다. Vercel CLI에 로그인되어 있는지 확인하세요."
        return 1
    fi
    
    # 실패한 배포 확인
    FAILED_DEPLOYMENTS=$(echo "$DEPLOYMENTS" | jq -r '.[] | select(.state == "ERROR" or .state == "BUILDING") | "\(.url) - \(.state)"' 2>/dev/null || echo "")
    
    if [ -n "$FAILED_DEPLOYMENTS" ]; then
        error "문제가 있는 Vercel 배포 발견:"
        echo "$FAILED_DEPLOYMENTS" | while read -r line; do
            error "  - $line"
        done
        return 1
    else
        log "모든 Vercel 배포가 정상입니다."
        return 0
    fi
}

# Vercel 로그 확인
check_vercel_logs() {
    log "Vercel 로그 확인 중..."
    
    if ! command -v vercel &> /dev/null; then
        warn "Vercel CLI가 설치되지 않았습니다."
        return 1
    fi
    
    # 최근 로그 가져오기 (에러만)
    LOGS=$(vercel logs --output=raw --limit=50 2>/dev/null | grep -i "error\|fail\|exception" || echo "")
    
    if [ -n "$LOGS" ]; then
        error "Vercel 로그에서 에러 발견:"
        echo "$LOGS" | head -10 | while read -r line; do
            error "  - $line"
        done
        return 1
    else
        log "Vercel 로그에 심각한 에러가 없습니다."
        return 0
    fi
}

# Prisma 스키마 검증
check_prisma_schema() {
    log "Prisma 스키마 검증 중..."
    
    if ! command -v npx &> /dev/null; then
        warn "npx를 사용할 수 없습니다."
        return 1
    fi
    
    # DATABASE_URL이 없으면 더미 값 사용
    export DATABASE_URL="${DATABASE_URL:-postgresql://user:password@localhost:5432/db?schema=public}"
    
    if npx prisma validate 2>&1 | tee -a "$LOG_FILE"; then
        log "Prisma 스키마가 유효합니다."
        return 0
    else
        error "Prisma 스키마 검증 실패"
        return 1
    fi
}

# 빌드 테스트
test_build() {
    log "빌드 테스트 실행 중..."
    
    export DATABASE_URL="${DATABASE_URL:-postgresql://user:password@localhost:5432/db?schema=public}"
    export SKIP_ENV_VALIDATION=true
    export NODE_OPTIONS="--max-old-space-size=4096"
    
    if npm run build 2>&1 | tee -a "$LOG_FILE"; then
        log "빌드 테스트 성공"
        return 0
    else
        error "빌드 테스트 실패"
        return 1
    fi
}

# 자동 해결 시도
auto_fix() {
    log "자동 해결 시도 중..."
    
    # Prisma 스키마 문제 해결
    if ! check_prisma_schema; then
        log "Prisma 스키마 문제를 해결하려고 시도합니다..."
        # 스키마는 이미 수정되어 있어야 함
    fi
    
    # 의존성 문제 해결
    if [ -f "package-lock.json" ]; then
        log "의존성 재설치 중..."
        npm ci 2>&1 | tee -a "$LOG_FILE" || true
    fi
}

# 메인 실행
main() {
    log "=== 로그 모니터링 시작 ==="
    
    ISSUES=0
    
    # 각 체크 실행
    check_prisma_schema || ISSUES=$((ISSUES + 1))
    check_github_actions || ISSUES=$((ISSUES + 1))
    check_vercel_deployments || ISSUES=$((ISSUES + 1))
    check_vercel_logs || ISSUES=$((ISSUES + 1))
    
    if [ $ISSUES -gt 0 ]; then
        error "총 $ISSUES 개의 문제가 발견되었습니다."
        auto_fix
        exit 1
    else
        log "모든 체크가 통과했습니다."
        exit 0
    fi
}

# 스크립트 실행
main "$@"



