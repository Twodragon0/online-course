# GitHub 설정 가이드

이 문서는 GitHub Issues, Projects, Dependabot 설정 방법을 안내합니다.

## ✅ 완료된 설정

### 1. Dependabot 설정 개선
- **문제**: "Dependabot cannot open any more pull requests" 에러
- **해결**: 
  - PR 제한을 10개에서 5개로 감소
  - 그룹화 개선 (프로덕션/개발 의존성 그룹화)
  - 보안 업데이트 우선 처리

### 2. Issues 템플릿
- 버그 리포트 템플릿
- 기능 제안 템플릿
- 보안 취약점 보고 템플릿

### 3. Pull Request 템플릿
- 표준 PR 템플릿 생성

### 4. 자동화 워크플로우
- 프로젝트 자동화 워크플로우
- 라벨 설정 워크플로우

## 🚀 다음 단계

### 1. 라벨 설정 (필수)

GitHub 저장소에서 다음을 실행하세요:

1. **Actions 탭**으로 이동
2. **Setup Labels** 워크플로우 선택
3. **Run workflow** 클릭
4. **Run workflow** 버튼 클릭

또는 수동으로:
1. **Issues** 탭 → **Labels** 클릭
2. `.github/labels.json` 파일의 라벨들을 수동으로 생성

### 2. GitHub Project 생성 (권장)

1. 저장소에서 **Projects** 탭 클릭
2. **New project** 클릭
3. **Board** 템플릿 선택
4. 프로젝트 이름 입력 (예: "Online Course Development")
5. **Create** 클릭

#### 컬럼 설정
다음 컬럼들을 추가하세요:
- 📋 Backlog
- 🔍 To Do
- 🚧 In Progress
- 👀 In Review
- ✅ Done

#### 자동화 설정
1. 프로젝트에서 **⚙️ 메뉴** → **Workflows** 클릭
2. 다음 자동화 규칙 추가:
   - **이슈가 열릴 때**: `To Do`로 이동
   - **라벨 `in-progress` 추가 시**: `In Progress`로 이동
   - **라벨 `review` 추가 시**: `In Review`로 이동
   - **이슈가 닫힐 때**: `Done`으로 이동
   - **PR이 열릴 때**: `In Review`로 이동
   - **PR이 머지될 때**: `Done`으로 이동

### 3. Project URL 설정 (선택사항)

프로젝트 자동화를 사용하려면:

1. 생성한 프로젝트의 URL 복사
2. 저장소 **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** 클릭
4. Name: `PROJECT_URL`
5. Secret: 프로젝트 URL (예: `https://github.com/users/Twodragon0/projects/1`)
6. **Add secret** 클릭

### 4. 기존 Dependabot PR 정리

현재 열려있는 Dependabot PR이 많다면:

1. **Pull requests** 탭으로 이동
2. `author:dependabot` 필터 적용
3. 보안 업데이트 PR 우선 검토 및 머지
4. 그룹화된 PR 확인 (하나의 PR에 여러 패키지 업데이트)
5. 불필요한 PR은 닫기

### 5. Dependabot 재실행 (필요시)

Dependabot이 새로운 설정을 적용하도록:

1. **Settings** → **Code security and analysis**
2. **Dependabot version updates** 섹션
3. 설정이 올바른지 확인
4. 필요시 저장소를 다시 스캔

## 📋 체크리스트

- [ ] 라벨 설정 워크플로우 실행 또는 수동 라벨 생성
- [ ] GitHub Project 생성
- [ ] 프로젝트 자동화 규칙 설정
- [ ] PROJECT_URL 시크릿 설정 (선택사항)
- [ ] 기존 Dependabot PR 정리
- [ ] Issues 템플릿 테스트 (새 이슈 생성 시)
- [ ] PR 템플릿 테스트 (새 PR 생성 시)

## 🔍 확인 방법

### Dependabot 설정 확인
1. **Settings** → **Code security and analysis**
2. **Dependabot version updates** 활성화 확인
3. `.github/dependabot.yml` 파일이 올바르게 인식되는지 확인

### Issues 템플릿 확인
1. **Issues** 탭 클릭
2. **New issue** 클릭
3. 템플릿 목록 확인 (버그 리포트, 기능 제안, 보안)

### PR 템플릿 확인
1. **Pull requests** 탭 클릭
2. **New pull request** 클릭
3. 템플릿이 자동으로 채워지는지 확인

### 자동화 워크플로우 확인
1. **Actions** 탭 클릭
2. **Project Automation** 워크플로우 확인
3. 이슈/PR 생성 시 자동 실행되는지 확인

## 🐛 문제 해결

### Dependabot이 여전히 많은 PR을 생성하는 경우
- `.github/dependabot.yml`의 `open-pull-requests-limit` 확인
- 그룹화 설정이 올바른지 확인
- 기존 PR을 먼저 정리

### 프로젝트 자동화가 작동하지 않는 경우
- `PROJECT_URL` 시크릿이 올바르게 설정되었는지 확인
- 워크플로우 권한 확인 (Settings → Actions → General)
- Actions 탭에서 에러 로그 확인

### 라벨이 생성되지 않는 경우
- `.github/labels.json` 파일 형식 확인
- 워크플로우 실행 로그 확인
- 수동으로 라벨 생성

## 📚 참고 자료

- [Dependabot 설정 가이드](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file)
- [GitHub Projects 가이드](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [이슈 및 PR 템플릿](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)



