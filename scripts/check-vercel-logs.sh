#!/bin/bash

# Vercel 로그 확인 및 분석 스크립트

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

# Vercel CLI 확인
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI가 설치되지 않았습니다."
        info "설치 명령어: npm install -g vercel"
        exit 1
    fi
    log "Vercel CLI 확인 완료: $(vercel --version)"
}

# Vercel 로그인 확인
check_vercel_auth() {
    if ! vercel whoami &> /dev/null; then
        warn "Vercel에 로그인되어 있지 않습니다."
        if [ -n "$VERCEL_TOKEN" ]; then
            info "VERCEL_TOKEN을 사용하여 로그인 시도..."
            echo "$VERCEL_TOKEN" | vercel login --token
        else
            error "VERCEL_TOKEN이 설정되지 않았습니다."
            exit 1
        fi
    fi
    log "Vercel 인증 확인 완료"
}

# 최근 배포 확인
check_deployments() {
    log "최근 배포 확인 중..."
    
    DEPLOYMENTS=$(vercel ls --json 2>/dev/null || echo "[]")
    
    if [ "$DEPLOYMENTS" = "[]" ]; then
        warn "배포 정보를 가져올 수 없습니다."
        return 1
    fi
    
    echo ""
    info "최근 배포 목록:"
    echo "$DEPLOYMENTS" | jq -r '.[0:5] | .[] | "  - \(.url) [\(.state)] - \(.created)"'
    
    # 실패한 배포 확인
    FAILED=$(echo "$DEPLOYMENTS" | jq -r '.[] | select(.state == "ERROR") | .url')
    
    if [ -n "$FAILED" ]; then
        error "실패한 배포 발견:"
        echo "$FAILED" | while read -r url; do
            error "  - $url"
        done
        return 1
    fi
    
    return 0
}

# 로그 확인
check_logs() {
    local LIMIT=${1:-100}
    log "최근 $LIMIT 개의 로그 확인 중..."
    
    LOGS=$(vercel logs --output=raw --limit="$LIMIT" 2>/dev/null || echo "")
    
    if [ -z "$LOGS" ]; then
        warn "로그를 가져올 수 없습니다."
        return 1
    fi
    
    # 에러 로그 필터링
    ERRORS=$(echo "$LOGS" | grep -i "error\|fail\|exception\|crash" || echo "")
    
    if [ -n "$ERRORS" ]; then
        error "에러 로그 발견:"
        echo "$ERRORS" | head -20 | while read -r line; do
            error "  $line"
        done
        return 1
    else
        log "최근 로그에 에러가 없습니다."
        return 0
    fi
}

# 특정 배포의 로그 확인
check_deployment_logs() {
    local DEPLOYMENT_URL=$1
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        error "배포 URL이 필요합니다."
        return 1
    fi
    
    log "배포 로그 확인 중: $DEPLOYMENT_URL"
    
    LOGS=$(vercel logs "$DEPLOYMENT_URL" --output=raw 2>/dev/null || echo "")
    
    if [ -z "$LOGS" ]; then
        warn "로그를 가져올 수 없습니다."
        return 1
    fi
    
    echo "$LOGS"
}

# 메인 실행
main() {
    check_vercel_cli
    check_vercel_auth
    
    ISSUES=0
    
    check_deployments || ISSUES=$((ISSUES + 1))
    check_logs 100 || ISSUES=$((ISSUES + 1))
    
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

