#!/bin/bash

# 푸시 전 빌드 체크 스크립트
# 사용법: ./scripts/pre-push-check.sh

set -e

echo "🔍 푸시 전 빌드 체크를 시작합니다..."
echo ""

# TypeScript 타입 체크
echo "📝 TypeScript 타입 체크 중..."
npm run type-check || {
  echo "❌ TypeScript 타입 에러가 발견되었습니다."
  echo "   빌드를 중단합니다. 타입 에러를 수정한 후 다시 시도하세요."
  exit 1
}

echo "✅ TypeScript 타입 체크 통과"
echo ""

# 빌드 실행
echo "🏗️  프로덕션 빌드 실행 중..."
npm run build || {
  echo "❌ 빌드 에러가 발견되었습니다."
  echo "   빌드를 중단합니다. 에러를 수정한 후 다시 시도하세요."
  exit 1
}

echo "✅ 빌드 체크 완료!"
echo "   이제 안전하게 푸시할 수 있습니다."
echo ""






