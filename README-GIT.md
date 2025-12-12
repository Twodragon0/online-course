# Git 커밋 및 푸시 설정 가이드

## 문제 해결: Vercel 배포 시 커밋 작성자 이메일 오류

Vercel 배포가 실패하는 경우, 커밋 작성자의 이메일 주소가 GitHub 계정과 연결되어 있지 않을 수 있습니다.

## 해결 방법

### 방법 1: GitHub 계정에 이메일 추가 (권장)

1. GitHub.com에 로그인
2. **Settings** → **Emails** 이동
3. **Add email address** 클릭
4. 현재 사용 중인 이메일 주소 추가 (예: `twodragon114@gmail.com`)
5. 이메일 인증 완료

이 방법이 가장 간단하고 기존 커밋 히스토리를 유지할 수 있습니다.

### 방법 2: Git 설정 변경 및 커밋 작성자 정보 수정

#### 1. Git 설정 확인 및 변경

```bash
# 현재 설정 확인
git config user.name
git config user.email

# GitHub 계정에 연결된 이메일로 변경
git config user.name "YourGitHubUsername"
git config user.email "your-github-email@example.com"

# 또는 전역 설정으로 (모든 저장소에 적용)
git config --global user.name "YourGitHubUsername"
git config --global user.email "your-github-email@example.com"
```

#### 2. 최근 커밋의 작성자 정보 수정 (선택사항)

```bash
# 최근 5개 커밋의 작성자 정보 수정
git rebase -i HEAD~5 --exec 'git commit --amend --author="YourName <your-email@example.com>" --no-edit'

# 변경사항 푸시 (주의: force push 필요)
git push --force-with-lease origin main
```

## 일반적인 Git 워크플로우

### 커밋 및 푸시

```bash
# 변경사항 확인
git status

# 변경사항 스테이징
git add .

# 또는 특정 파일만
git add app/page.tsx components/navbar.tsx

# 커밋
git commit -m "feat: Add new feature"

# 푸시
git push origin main
```

### 브랜치 작업

```bash
# 새 브랜치 생성
git checkout -b feature/new-feature

# 변경사항 커밋
git add .
git commit -m "feat: Add new feature"

# 브랜치 푸시
git push origin feature/new-feature

# 메인 브랜치로 돌아가기
git checkout main
```

## 유용한 Git 명령어

```bash
# 커밋 히스토리 확인
git log --oneline -10

# 커밋 작성자 정보 확인
git log --format="%h %an <%ae>" -10

# 원격 저장소 상태 확인
git fetch origin
git status

# 최근 커밋 수정 (메시지 변경)
git commit --amend -m "새로운 커밋 메시지"

# 마지막 커밋 취소 (변경사항 유지)
git reset --soft HEAD~1
```

## 주의사항

- `--force` 또는 `--force-with-lease` 사용 시 주의: 다른 사람과 협업 중이면 히스토리를 덮어쓸 수 있습니다
- 커밋 전에 항상 `git status`로 변경사항 확인
- 중요한 변경사항은 브랜치를 만들어서 작업하는 것을 권장합니다

