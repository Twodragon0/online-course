#!/bin/bash

# 빠른 배포 상태 확인 스크립트

echo "🚀 배포 상태 빠른 확인"
echo ""

# GitHub 커밋 확인
echo "📦 최근 커밋:"
git log --oneline -3
echo ""

# GitHub Actions 상태 (GitHub CLI 사용 가능한 경우)
if command -v gh &> /dev/null; then
    echo "⚙️  GitHub Actions 상태:"
    gh run list --limit 3 --json status,conclusion,name --jq '.[] | "  \(.name): \(.status) [\(.conclusion // "in_progress")]"' 2>/dev/null || echo "  GitHub Actions 정보를 가져올 수 없습니다."
    echo ""
fi

# Vercel 배포 상태 (Vercel CLI 사용 가능한 경우)
if command -v vercel &> /dev/null && vercel whoami &> /dev/null 2>&1; then
    echo "🌐 Vercel 배포 상태:"
    vercel ls --json 2>/dev/null | jq -r '.[0:3] | .[] | "  \(.url) [\(.state)]"' 2>/dev/null || echo "  배포 정보를 가져올 수 없습니다."
    echo ""
    
    echo "📋 최근 로그 (에러만):"
    vercel logs --output=raw --limit 30 2>/dev/null | grep -i "error\|fail\|exception" | head -3 || echo "  최근 로그에 에러가 없습니다."
    echo ""
fi

echo "✅ 확인 완료!"
echo ""
echo "📚 자세한 내용:"
echo "  - GitHub Actions: https://github.com/Twodragon0/online-course/actions"
echo "  - Vercel Dashboard: https://vercel.com/dashboard"
echo "  - 배포 가이드: ./DEPLOYMENT-GUIDE.md"



