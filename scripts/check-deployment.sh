#!/bin/bash

# 배포 상태 종합 확인 스크립트
# GitHub Actions와 Vercel 배포 상태를 확인합니다

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

section() {
    echo -e "\n${CYAN}=== $1 ===${NC}"
}

# GitHub Actions 확인
check_github_actions() {
    section "GitHub Actions 상태"
    
    if command -v gh &> /dev/null; then
        info "GitHub CLI를 사용하여 Actions 확인 중..."
        RUNS=$(gh run list --limit 3 --json status,conclusion,name,createdAt,url 2>/dev/null || echo "[]")
        
        if [ "$RUNS" != "[]" ]; then
            echo "$RUNS" | jq -r '.[] | "  \(.name) - \(.status) [\(.conclusion // "in_progress")] - \(.createdAt)"'
            
            FAILED=$(echo "$RUNS" | jq -r '.[] | select(.conclusion == "failure") | .url')
            if [ -n "$FAILED" ]; then
                error "실패한 워크플로우 발견:"
                echo "$FAILED" | while read -r url; do
                    error "  $url"
                done
                return 1
            fi
        else
            warn "GitHub Actions 정보를 가져올 수 없습니다."
            info "GitHub CLI로 로그인: gh auth login"
        fi
    else
        warn "GitHub CLI가 설치되지 않았습니다."
        info "설치: brew install gh"
        info "웹에서 확인: https://github.com/Twodragon0/online-course/actions"
    fi
    
    return 0
}

# Vercel 배포 확인
check_vercel_deployment() {
    section "Vercel 배포 상태"
    
    if command -v vercel &> /dev/null; then
        info "Vercel CLI를 사용하여 배포 확인 중..."
        
        # Vercel 로그인 확인
        if ! vercel whoami &> /dev/null; then
            if [ -n "$VERCEL_TOKEN" ]; then
                info "VERCEL_TOKEN을 사용하여 로그인 시도..."
                echo "$VERCEL_TOKEN" | vercel login --token 2>/dev/null || warn "Vercel 로그인 실패"
            else
                warn "Vercel에 로그인되어 있지 않습니다."
                info "로그인: vercel login"
                info "또는 VERCEL_TOKEN 환경 변수 설정"
                return 0
            fi
        fi
        
        DEPLOYMENTS=$(vercel ls --json 2>/dev/null || echo "[]")
        
        if [ "$DEPLOYMENTS" != "[]" ]; then
            info "최근 배포:"
            echo "$DEPLOYMENTS" | jq -r '.[0:3] | .[] | "  \(.url) [\(.state)] - \(.created)"'
            
            FAILED=$(echo "$DEPLOYMENTS" | jq -r '.[] | select(.state == "ERROR") | .url')
            if [ -n "$FAILED" ]; then
                error "실패한 배포 발견:"
                echo "$FAILED" | while read -r url; do
                    error "  $url"
                done
                return 1
            fi
        else
            warn "배포 정보를 가져올 수 없습니다."
        fi
    else
        warn "Vercel CLI가 설치되지 않았습니다."
        info "설치: npm install -g vercel"
        info "웹에서 확인: https://vercel.com/dashboard"
    fi
    
    return 0
}

# Vercel 로그 확인
check_vercel_logs() {
    section "Vercel 로그 확인"
    
    if command -v vercel &> /dev/null && vercel whoami &> /dev/null; then
        info "최근 로그 확인 중..."
        LOGS=$(vercel logs --output=raw --limit 50 2>/dev/null || echo "")
        
        if [ -n "$LOGS" ]; then
            ERRORS=$(echo "$LOGS" | grep -i "error\|fail\|exception" | head -10 || echo "")
            
            if [ -n "$ERRORS" ]; then
                error "에러 로그 발견:"
                echo "$ERRORS" | while read -r line; do
                    error "  $line"
                done
                return 1
            else
                log "최근 로그에 에러가 없습니다."
            fi
        else
            warn "로그를 가져올 수 없습니다."
        fi
    else
        warn "Vercel CLI 로그인 필요"
    fi
    
    return 0
}

# 환경 변수 체크리스트
check_env_variables() {
    section "환경 변수 체크리스트"
    
    info "Vercel에서 설정해야 할 필수 환경 변수:"
    echo "  ✓ DATABASE_URL"
    echo "  ✓ NEXTAUTH_SECRET"
    echo "  ✓ NEXTAUTH_URL"
    echo "  ✓ GOOGLE_CLIENT_ID"
    echo "  ✓ GOOGLE_CLIENT_SECRET"
    echo "  ✓ DEEPSEEK_API_KEY (우선)"
    echo "  ✓ GOOGLE_GEMINI_API_KEY (선택, fallback)"
    
    info "확인: Vercel 대시보드 → Settings → Environment Variables"
}

# 메인 실행
main() {
    log "배포 상태 종합 확인 시작..."
    
    ISSUES=0
    
    check_github_actions || ISSUES=$((ISSUES + 1))
    check_vercel_deployment || ISSUES=$((ISSUES + 1))
    check_vercel_logs || ISSUES=$((ISSUES + 1))
    check_env_variables
    
    echo ""
    if [ $ISSUES -gt 0 ]; then
        error "총 $ISSUES 개의 문제가 발견되었습니다."
        info "자세한 내용은 위의 로그를 확인하세요."
        exit 1
    else
        log "모든 체크가 통과했습니다! ✅"
        exit 0
    fi
}

# 스크립트 실행
main "$@"

