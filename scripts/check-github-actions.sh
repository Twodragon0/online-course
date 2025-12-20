#!/bin/bash

# GitHub Actions 상태 확인 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# GitHub CLI 확인
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        error "GitHub CLI가 설치되지 않았습니다."
        info "설치 명령어: https://cli.github.com/"
        exit 1
    fi
    log "GitHub CLI 확인 완료: $(gh --version | head -1)"
}

# GitHub 인증 확인
check_gh_auth() {
    if ! gh auth status &> /dev/null; then
        warn "GitHub에 로그인되어 있지 않습니다."
        if [ -n "$GITHUB_TOKEN" ]; then
            info "GITHUB_TOKEN을 사용하여 로그인 시도..."
            echo "$GITHUB_TOKEN" | gh auth login --with-token
        else
            error "GITHUB_TOKEN이 설정되지 않았습니다."
            exit 1
        fi
    fi
    log "GitHub 인증 확인 완료"
}

# 최근 워크플로우 실행 확인
check_workflow_runs() {
    local REPO=${1:-"Twodragon0/online-course"}
    local LIMIT=${2:-10}
    
    log "최근 $LIMIT 개의 워크플로우 실행 확인 중..."
    
    RUNS=$(gh api "repos/$REPO/actions/runs?per_page=$LIMIT" --jq '.workflow_runs' 2>/dev/null || echo "[]")
    
    if [ "$RUNS" = "[]" ]; then
        warn "워크플로우 실행 내역을 가져올 수 없습니다."
        return 1
    fi
    
    echo ""
    info "최근 워크플로우 실행:"
    echo "$RUNS" | jq -r '.[] | "  - \(.name) [\(.conclusion // .status)] - \(.created_at) - \(.html_url)"'
    
    # 실패한 워크플로우 확인
    FAILED=$(echo "$RUNS" | jq -r '.[] | select(.conclusion == "failure") | "\(.name)|\(.html_url)"')
    
    if [ -n "$FAILED" ]; then
        error "실패한 워크플로우 발견:"
        echo "$FAILED" | while IFS='|' read -r name url; do
            error "  - $name: $url"
        done
        return 1
    fi
    
    return 0
}

# 특정 워크플로우의 로그 확인
check_workflow_logs() {
    local RUN_ID=$1
    local REPO=${2:-"Twodragon0/online-course"}
    
    if [ -z "$RUN_ID" ]; then
        error "워크플로우 실행 ID가 필요합니다."
        return 1
    fi
    
    log "워크플로우 로그 확인 중: $RUN_ID"
    
    # 워크플로우 실행 정보 가져오기
    RUN_INFO=$(gh api "repos/$REPO/actions/runs/$RUN_ID" 2>/dev/null || echo "{}")
    
    if [ "$RUN_INFO" = "{}" ]; then
        warn "워크플로우 실행 정보를 가져올 수 없습니다."
        return 1
    fi
    
    echo "$RUN_INFO" | jq -r '.name, .status, .conclusion, .html_url'
    
    # 실패한 작업 확인
    JOBS=$(gh api "repos/$REPO/actions/runs/$RUN_ID/jobs" --jq '.jobs' 2>/dev/null || echo "[]")
    
    FAILED_JOBS=$(echo "$JOBS" | jq -r '.[] | select(.conclusion == "failure") | "\(.name) - \(.html_url)"')
    
    if [ -n "$FAILED_JOBS" ]; then
        error "실패한 작업:"
        echo "$FAILED_JOBS" | while read -r line; do
            error "  - $line"
        done
    fi
}

# 메인 실행
main() {
    local REPO=${1:-"Twodragon0/online-course"}
    
    check_gh_cli
    check_gh_auth
    
    ISSUES=0
    
    check_workflow_runs "$REPO" 10 || ISSUES=$((ISSUES + 1))
    
    if [ $ISSUES -gt 0 ]; then
        error "총 $ISSUES 개의 문제가 발견되었습니다."
        exit 1
    else
        log "모든 체크가 통과했습니다."
        exit 0
    fi
}

# 스크립트 실행
main "$@"



