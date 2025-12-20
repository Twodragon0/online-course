# GitHub Projects 설정 가이드

이 문서는 GitHub Projects를 활용한 프로젝트 관리 방법을 설명합니다.

## 기본 프로젝트 구조

### 1. 칸반 보드 생성
GitHub 저장소에서 Projects 탭으로 이동하여 새 프로젝트를 생성하세요.

### 2. 기본 컬럼 구조
다음과 같은 컬럼 구조를 권장합니다:

```
📋 Backlog
  └─ 새로운 이슈가 자동으로 추가됨

🔍 To Do
  └─ 작업할 준비가 된 이슈

🚧 In Progress
  └─ 현재 작업 중인 이슈

👀 In Review
  └─ 코드 리뷰 대기 중인 PR

✅ Done
  └─ 완료된 작업
```

### 3. 자동화 설정
GitHub Projects의 자동화 기능을 활용하세요:

#### 이슈 자동 이동
- `opened` → `To Do`로 이동
- `labeled` with `in-progress` → `In Progress`로 이동
- `labeled` with `review` → `In Review`로 이동
- `closed` → `Done`으로 이동

#### PR 자동 이동
- `opened` → `In Review`로 이동
- `merged` → `Done`으로 이동
- `closed` → `Done`으로 이동

## 이슈 라벨 전략

### 우선순위 라벨
- `priority: critical` - 즉시 처리 필요
- `priority: high` - 빠른 처리 필요
- `priority: medium` - 일반 처리
- `priority: low` - 나중에 처리

### 유형 라벨
- `bug` - 버그 리포트
- `enhancement` - 기능 제안
- `documentation` - 문서 개선
- `security` - 보안 관련
- `dependencies` - 의존성 업데이트
- `refactoring` - 리팩토링

### 상태 라벨
- `in-progress` - 작업 중
- `review` - 리뷰 대기
- `blocked` - 차단됨
- `wontfix` - 수정하지 않음

## 마일스톤 활용

### 마일스톤 생성 예시
1. **v1.0.0** - 초기 릴리스
2. **v1.1.0** - 기능 개선
3. **v1.2.0** - 성능 최적화
4. **Security Updates** - 보안 업데이트

### 마일스톤 사용 팁
- 각 마일스톤에 목표 날짜 설정
- 관련 이슈를 마일스톤에 연결
- 마일스톤 진행률을 주기적으로 확인

## 필터 및 뷰 설정

### 유용한 필터 예시
```
is:open label:bug priority:high
is:open label:security
is:pr is:open review-requested:@me
```

### 저장된 뷰
- **내 작업**: `assignee:@me is:open`
- **버그**: `is:open label:bug`
- **보안**: `is:open label:security`
- **리뷰 필요**: `is:pr is:open review-requested:@me`

## 워크플로우 예시

### 버그 리포트 처리
1. 이슈 생성 → 자동으로 `To Do`에 추가
2. `priority:high` 라벨 추가
3. 담당자 할당
4. `in-progress` 라벨 추가 → `In Progress`로 이동
5. PR 생성 및 연결
6. `review` 라벨 추가 → `In Review`로 이동
7. 머지 완료 → `Done`으로 이동

### 기능 제안 처리
1. 이슈 생성 → `enhancement` 라벨 추가
2. 토론 및 계획 수립
3. `To Do`에서 작업 시작
4. PR 생성 및 리뷰
5. 머지 완료

## 통계 및 리포팅

### 주간 리뷰
- 완료된 작업 수
- 진행 중인 작업 수
- 평균 처리 시간
- 병목 지점 식별

### 월간 리뷰
- 전체 진행률
- 마일스톤 달성률
- 이슈 트렌드 분석

## 자동화 워크플로우

GitHub Actions를 활용하여 Projects를 자동화할 수 있습니다:

```yaml
# .github/workflows/project-automation.yml 예시
name: Project Automation

on:
  issues:
    types: [opened, labeled]
  pull_request:
    types: [opened, labeled, closed]

jobs:
  update-project:
    runs-on: ubuntu-latest
    steps:
      - name: Add to project
        uses: actions/add-to-project@v0.4.1
        with:
          project-url: ${{ secrets.PROJECT_URL }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## 참고 자료

- [GitHub Projects 문서](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [GitHub Projects 자동화](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project)
- [이슈 및 PR 템플릿](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)



