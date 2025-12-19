# Google Gemini API 설정 가이드

이 가이드는 Google Gemini API를 online-course 플랫폼에 통합하는 방법을 설명합니다.

## 개요

Google Gemini API는 Google OAuth와 동일한 Google Cloud 프로젝트에서 사용할 수 있어 비용 최적화에 유리합니다.

## 주요 기능

1. **채팅 기능**: Gemini를 사용한 AI 채팅 (DeepSeek 대체 가능)
2. **Google Drive 파일 분석**: Gemini를 사용하여 Google Drive 파일 내용 분석
3. **비용 최적화**: 캐싱 및 적절한 모델 선택으로 비용 절감

## API 키 발급

### 방법 1: Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택 (Google OAuth와 동일한 프로젝트 권장)
3. **API 및 서비스** → **사용자 인증 정보** 이동
4. **+ 사용자 인증 정보 만들기** → **API 키** 선택
5. 생성된 API 키 복사

### 방법 2: Google AI Studio

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. **Get API Key** 클릭
3. 프로젝트 선택 또는 새 프로젝트 생성
4. API 키 복사

## 환경 변수 설정

### 로컬 개발 환경

`.env` 파일에 추가:

```bash
# Google Gemini API 키
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
# 또는
GEMINI_API_KEY=your-gemini-api-key
```

### Vercel 배포 환경

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 다음 변수 추가:
   - Key: `GOOGLE_GEMINI_API_KEY`
   - Value: 발급받은 API 키
   - Environment: Production, Preview, Development
4. **Save** 클릭
5. **Redeploy** 실행

## 사용 방법

### 1. 채팅 기능

Gemini API 키가 설정되면 자동으로 채팅 기능에 사용됩니다.

- Gemini가 설정되어 있으면 Gemini 사용 (우선)
- Gemini가 없으면 DeepSeek 사용 (fallback)

### 2. Google Drive 파일 분석

```javascript
// API 호출 예시
fetch('/api/drive/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileId: 'google-drive-file-id',
    prompt: '이 파일의 주요 내용을 요약해주세요.',
  }),
})
.then(r => r.json())
.then(data => console.log(data.analysis));
```

## 비용 최적화

### 1. 캐싱

- 응답은 자동으로 1시간 캐시됩니다
- 동일한 요청은 캐시에서 반환되어 API 호출 비용 절감

### 2. 모델 선택

- **gemini-pro**: 일반 텍스트 생성 (기본, 가장 저렴)
- **gemini-pro-vision**: 이미지 분석 포함 (필요시만 사용)

### 3. 토큰 제한

- 기본 최대 토큰: 2048
- 필요시 조정 가능하나 비용 증가

## API 엔드포인트

### POST /api/chat

채팅 메시지 전송 (Gemini 또는 DeepSeek 자동 선택)

**요청**:
```json
{
  "message": "DevSecOps에 대해 설명해주세요",
  "category": "general",
  "sessionId": "session-id"
}
```

**응답**:
```json
{
  "response": "AI 응답 내용...",
  "logId": "log-id",
  "provider": "gemini" // 또는 "deepseek"
}
```

### POST /api/drive/analyze

Google Drive 파일 분석

**요청**:
```json
{
  "fileId": "google-drive-file-id",
  "prompt": "이 파일의 주요 내용을 요약해주세요"
}
```

**응답**:
```json
{
  "success": true,
  "file": {
    "id": "file-id",
    "name": "파일명",
    "mimeType": "text/plain",
    "size": 1234
  },
  "analysis": "분석 결과...",
  "provider": "gemini"
}
```

## 문제 해결

### API 키 오류

```
Error: Google Gemini API key is not configured
```

**해결**:
1. `GOOGLE_GEMINI_API_KEY` 또는 `GEMINI_API_KEY` 환경 변수 확인
2. API 키가 올바르게 설정되었는지 확인
3. 환경 변수 설정 후 서버 재시작

### 권한 오류

```
Error: API key not valid
```

**해결**:
1. Google Cloud Console에서 API 키 확인
2. Generative AI API가 활성화되어 있는지 확인
3. API 키 제한 설정 확인

### 할당량 초과

```
Error: Quota exceeded
```

**해결**:
1. Google Cloud Console에서 할당량 확인
2. 필요시 할당량 증가 요청
3. 캐싱 활용으로 API 호출 감소

## 보안 권장사항

1. **API 키 제한 설정**:
   - Google Cloud Console에서 API 키 제한 설정
   - 특정 IP 또는 도메인만 허용

2. **환경 변수 보호**:
   - `.env` 파일을 버전 관리에 포함하지 않음
   - Vercel 환경 변수는 암호화되어 저장

3. **Rate Limiting**:
   - API 엔드포인트에 Rate Limiting 적용됨
   - 악의적인 요청 방지

## 비용 관리

### AI 서비스 가격 비교 (2024 기준)

**DeepSeek** (우선 사용 - 가장 저렴):
- OpenAI 대비 최대 95% 비용 절감
- 매우 저렴한 가격으로 고성능 제공

**Gemini API** (보조/fallback):
- **gemini-pro**: 입력 $0.10/1M 토큰, 출력 $0.40/1M 토큰
- **gemini-pro-vision**: 입력 $0.10/1M 토큰, 출력 $0.40/1M 토큰

**결론**: DeepSeek이 Gemini보다 훨씬 저렴하므로, 시스템은 DeepSeek을 우선 사용하고 Gemini는 fallback으로만 사용합니다.

### 비용 절감 팁

1. **DeepSeek 우선 사용**: 기본적으로 DeepSeek 사용 (가장 저렴)
2. **Gemini는 fallback만**: DeepSeek 실패 시에만 Gemini 사용
3. **캐싱 활용**: 응답은 자동으로 1시간 캐시 (자동 적용)
4. **불필요한 API 호출 최소화**
5. **적절한 모델 선택**: vision 모델은 필요시만 사용
6. **토큰 제한 설정**: 기본 2048 토큰으로 제한

## 참고 자료

- [Gemini API 문서](https://ai.google.dev/docs)
- [Google Cloud Console](https://console.cloud.google.com)
- [Google AI Studio](https://makersuite.google.com)

