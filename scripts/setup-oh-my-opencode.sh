#!/bin/bash

# oh-my-opencode 설치 스크립트
# Cursor IDE 및 터미널에서 모두 사용 가능
# 사용법: ./scripts/setup-oh-my-opencode.sh 또는 npm run setup:oh-my-opencode

set -e

echo "🚀 oh-my-opencode 설치를 시작합니다..."
echo ""

# zshrc 소스 및 bunx 확인
if [ -f ~/.zshrc ]; then
  echo "📝 ~/.zshrc 파일을 소스합니다..."
  source ~/.zshrc || {
    echo "⚠️  ~/.zshrc 소스 중 경고가 발생했지만 계속 진행합니다..."
  }
else
  echo "⚠️  ~/.zshrc 파일을 찾을 수 없습니다. 계속 진행합니다..."
fi

# bunx 명령어 확인
if ! command -v bunx &> /dev/null; then
  echo "❌ bunx 명령어를 찾을 수 없습니다."
  echo "   Bun을 먼저 설치해주세요: curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

echo "✅ bunx 명령어 확인 완료"
echo ""

# oh-my-opencode 설치
echo "📦 oh-my-opencode를 설치합니다..."
bunx oh-my-opencode install || {
  echo "❌ oh-my-opencode 설치 중 오류가 발생했습니다."
  echo "   수동으로 실행해보세요: source ~/.zshrc && bunx oh-my-opencode install"
  exit 1
}

echo ""
echo "✅ oh-my-opencode 설치가 완료되었습니다!"
echo ""
echo "💡 다음 단계:"
echo "   - 새 터미널을 열거나 다음 명령어를 실행하세요:"
echo "     source ~/.zshrc"
echo "   - Cursor IDE에서는 이미 적용되었습니다."
echo ""
