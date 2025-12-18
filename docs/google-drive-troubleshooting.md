# Google Drive 동영상 표시 문제 해결 가이드

## 문제: 동영상이 표시되지 않음

Google Drive 동영상이 표시되지 않는 경우 다음 사항을 확인하세요.

## 1. Google Drive 파일 공유 설정 확인

### 필수 단계:

1. **Google Drive에서 파일 선택**
   - 동영상 파일을 우클릭
   - "공유" 또는 "링크 가져오기" 선택

2. **공유 설정 변경**
   - "링크가 있는 모든 사용자" 또는 "모든 사용자"로 설정
   - "뷰어" 권한으로 설정 (편집 권한 불필요)

3. **파일 ID 확인**
   - 공유 링크 형식: `https://drive.google.com/file/d/FILE_ID/view`
   - `FILE_ID` 부분을 복사하여 사용

### 올바른 공유 링크 예시:
```
https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing
```
→ 파일 ID: `1ABC123xyz`

## 2. 파일 ID 확인 방법

### 방법 1: URL에서 추출
```
https://drive.google.com/file/d/FILE_ID/view
https://drive.google.com/file/d/FILE_ID/preview
https://drive.google.com/open?id=FILE_ID
```

### 방법 2: 브라우저에서 직접 확인
1. Google Drive에서 파일 열기
2. 주소창에서 `/d/` 뒤의 문자열이 파일 ID
3. 파일 ID는 보통 30-40자 길이의 영문/숫자 조합

## 3. 코드에서 파일 ID 사용

### app/courses/page.tsx에서:
```typescript
const sections = [
  {
    id: 'devsecops',
    title: '🛡️ DevSecOps 과정',
    description: '클라우드 보안과 DevSecOps 기초 학습',
    driveFileIds: {
      'intro': 'YOUR_FILE_ID_HERE' // 여기에 실제 파일 ID 입력
    }
  },
];
```

## 4. 일반적인 문제 해결

### 문제 1: "요청한 파일이 없습니다" 에러
**원인**: 파일 ID가 잘못되었거나 파일이 삭제됨
**해결**: 
- 파일 ID를 다시 확인
- Google Drive에서 파일이 존재하는지 확인
- 파일이 공유되어 있는지 확인

### 문제 2: iframe이 로드되지 않음
**원인**: 파일이 공유되지 않았거나 권한 문제
**해결**:
- 파일 공유 설정을 "링크가 있는 모든 사용자"로 변경
- "뷰어" 권한 확인

### 문제 3: 동영상이 재생되지 않음
**원인**: 파일 형식 문제 또는 브라우저 호환성
**해결**:
- MP4 형식 권장
- 다른 브라우저에서 테스트
- Google Drive에서 직접 재생되는지 확인

## 5. 테스트 방법

### 1단계: 파일 ID 확인
브라우저에서 직접 접근:
```
https://drive.google.com/file/d/YOUR_FILE_ID/preview
```

### 2단계: 공유 링크 확인
```
https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing
```

### 3단계: 코드에 적용
```typescript
driveFileIds: {
  'intro': 'YOUR_FILE_ID'
}
```

## 6. 현재 사용 중인 파일 ID 확인

`app/courses/page.tsx` 파일의 72번째 줄을 확인하세요:
```typescript
driveFileIds: {
  'intro': '1er3p4BdWsYmeLUuhMshS10EImWYvWWcU'
}
```

이 파일 ID가 올바른지 확인하려면:
1. Google Drive에서 해당 파일 ID로 검색
2. 또는 브라우저에서 `https://drive.google.com/file/d/1er3p4BdWsYmeLUuhMshS10EImWYvWWcU/preview` 접근

## 7. 대체 방법

동영상이 계속 표시되지 않으면:

### 방법 1: 직접 링크 사용
```typescript
<Button asChild>
  <a href={viewUrl} target="_blank">
    Google Drive에서 보기
  </a>
</Button>
```

### 방법 2: YouTube 또는 다른 플랫폼 사용
동영상을 YouTube에 업로드하고 YouTube 임베드 사용

### 방법 3: Vercel Blob Storage 사용
동영상을 Vercel Blob Storage에 업로드하고 직접 URL 사용

## 8. 디버깅 팁

브라우저 개발자 도구에서 확인:
1. Network 탭에서 iframe 요청 확인
2. Console 탭에서 에러 메시지 확인
3. iframe의 src 속성이 올바른지 확인

```javascript
// 콘솔에서 실행
document.querySelector('iframe').src
```

## 9. 보안 고려사항

- 파일이 공개적으로 공유되므로 민감한 정보가 포함되지 않도록 주의
- 필요시 특정 사용자에게만 공유하는 방식 고려
- Service Account를 사용한 인증 방식도 고려 가능

