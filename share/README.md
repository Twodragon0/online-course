# 영상 공유 자동화

클라우드 시큐리티 강의 영상을 주차별로 자동 공유하는 시스템

## 개요

매주 토요일 수업 후, 해당 주차 강의 영상을 수강생에게 자동으로 공유합니다.

### 주요 기능

- **자동 공유**: 매주 토요일 11:30 KST에 EventBridge Scheduler가 자동 실행
- **수동 공유**: Slack 슬래시 커맨드 `/share-url {주차}`로 수동 실행
- **차등 주차 공유**: 현재 기수는 N주차, 이전 기수는 N+1주차 공유
- **마지막 주차 처리**: 마지막 주차에는 현재 기수만 공유

### 공유 로직

| 기수 | 공유 주차 | 비고 |
|------|-----------|------|
| 8기 (현재) | N주차 | 현재 운영 기수 |
| 3기~7기 | N+1주차 | 이전 기수 |
| 1기~2기 | - | 제외 |

예: `/share-url 3` 실행 시
- 8기: 3주차 폴더 공유
- 3기~7기: 4주차 폴더 공유

---

## 배포

### 사전 요구사항

- Node.js 18+ 
- Python 3.11
- AWS CLI 설정 (프로필: `bjchoi-admin`)
- Serverless Framework

### 의존성 설치

```bash
cd deploy
npm install
pip install -r requirements.txt
```

### 환경 변수 설정

`.env.dev` 또는 `.env.prod` 파일 생성:

```bash
# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C...
```

### 배포 명령어

```bash
# 개발 환경
serverless deploy --stage dev

# 운영 환경
serverless deploy --stage prod
```

### 배포 결과

| 함수 | 역할 |
|------|------|
| `share` | Slack 슬래시 커맨드 수신 (API Gateway) |
| `shareProcessor` | 실제 공유 작업 수행 + 자동 스케줄 |

---

## 사용법

### 1. Slack 슬래시 커맨드 (수동)

Slack에서 `/share-url {주차}` 입력:

```
/share-url 3
```

**응답:**
```
⏳ 영상 공유 처리 중...
• 8기: 3주차
• 이전 기수: 4주차
완료되면 알려드릴게요!
```

### 2. 자동 스케줄 (EventBridge)

매주 토요일 11:30 KST에 자동 실행됩니다.

- `schedule.json`의 날짜와 현재 날짜를 비교하여 주차 계산
- 스케줄 범위 밖이면 실행되지 않음

### 3. 수동 테스트

```bash
# 자동 주차 계산 (EventBridge 시뮬레이션)
serverless invoke -f shareProcessor --stage dev --aws-profile bjchoi-admin --data '{}'

# 특정 주차 지정
serverless invoke -f shareProcessor --stage dev --aws-profile bjchoi-admin --data '{"week": 3}'
```

### 4. 로그 확인

```bash
serverless logs -f shareProcessor --stage prod
```

---

## 설정 파일

### data/schedule.json

주차 스케줄 및 기수 설정:

```json
{
  "current_batch": 8,
  "last_week": 9,
  "schedule": {
    "3": "2025-12-13",
    "4": "2025-12-20",
    "5": "2025-12-27",
    "6": "2026-01-03",
    "7": "2026-01-10",
    "8": "2026-01-17",
    "9": "2026-01-24"
  },
  "trigger_time": "11:30",
  "timezone": "Asia/Seoul"
}
```

| 필드 | 설명 |
|------|------|
| `current_batch` | 현재 운영 기수 |
| `last_week` | 마지막 주차 (이 주차에는 현재 기수만 공유) |
| `schedule` | 주차별 시작 날짜 (토요일) |
| `trigger_time` | EventBridge 실행 시간 (참고용) |
| `timezone` | 타임존 (참고용) |

### data/folders.json

기수별 Google Drive 폴더 ID:

```json
{
  "1기": "폴더ID",
  "2기": "폴더ID",
  "3기": "폴더ID",
  ...
}
```

### data/users.txt

공유 대상 이메일 목록 (Gmail만 처리):

```
user1@gmail.com
user2@gmail.com
```

- 한 줄에 하나의 이메일
- `#`으로 시작하는 줄은 무시
- Gmail 주소만 공유 처리 (네이버 등 제외)

---

## 다음 기수 운영 시 변경사항

1. **schedule.json 수정**
   - `current_batch`: 새 기수 번호
   - `schedule`: 새 주차 일정

2. **folders.json 수정**
   - 새 기수 폴더 ID 추가

3. **users.txt 수정**
   - 새 수강생 이메일 추가

4. **재배포**
   ```bash
   serverless deploy --stage prod --aws-profile bjchoi-admin
   ```

---

## 트러블슈팅

### Rate Limit 에러

Google Drive API rate limit 초과 시 자동 재시도 (최대 3회, 지수 백오프)

### 폴더를 찾을 수 없음

- `folders.json`에 해당 기수 폴더 ID 확인
- Google Drive에 `{N}주차` 형식의 폴더 존재 확인
