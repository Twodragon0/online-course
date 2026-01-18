#!/bin/bash

# Git 커밋 작성자 정보 수정 스크립트
# 사용법: ./fix-commit-author.sh <github-email>

GITHUB_EMAIL="${1:-twodragon114@gmail.com}"
GITHUB_NAME="${2:-Twodragon0}"

echo "Git 커밋 작성자 정보 수정 중..."
echo "이메일: $GITHUB_EMAIL"
echo "이름: $GITHUB_NAME"
echo ""

# Git 설정 업데이트
git config user.name "$GITHUB_NAME"
git config user.email "$GITHUB_EMAIL"

echo "✅ 로컬 Git 설정이 업데이트되었습니다."
echo ""
echo "최근 커밋들의 작성자 정보를 수정하려면 다음 명령을 실행하세요:"
echo ""
echo "  # 최근 5개 커밋의 작성자 정보 수정"
echo "  git rebase -i HEAD~5 --exec 'git commit --amend --author=\"$GITHUB_NAME <$GITHUB_EMAIL>\" --no-edit'"
echo ""
echo "또는 GitHub 계정에 이메일을 추가하는 것이 더 간단합니다:"
echo "  1. GitHub.com → Settings → Emails"
echo "  2. 'Add email address' 클릭"
echo "  3. '$GITHUB_EMAIL' 추가 및 인증"
echo ""


