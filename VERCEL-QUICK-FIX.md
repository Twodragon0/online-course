# Vercel DATABASE_URL 오류 빠른 해결

## 🚨 현재 오류

```
Prisma Client is not initialized. DATABASE_URL is required.
the URL must start with the protocol postgresql:// or postgres://
```

## ✅ 즉시 해결 방법

### 1단계: Vercel Postgres 생성 (가장 쉬운 방법)

1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. **프로젝트 선택**
3. **Storage** 탭 클릭
4. **Create Database** → **Postgres** 선택
5. 데이터베이스 이름 입력 (예: `online-course-db`)
6. **Create** 클릭
7. 데이터베이스가 생성되면 **Connect** 버튼 클릭
8. **Environment Variables** 섹션에서 `DATABASE_URL` 복사
9. **Settings** → **Environment Variables**로 이동
10. **Add New** 클릭:
    - Key: `DATABASE_URL`
    - Value: 복사한 연결 문자열 (자동으로 `postgresql://`로 시작)
    - Environment: ✅ Production, ✅ Preview, ✅ Development (모두 체크)
11. **Save** 클릭
12. **Deployments** 탭 → 최신 배포 → **⋯** 메뉴 → **Redeploy** 클릭

### 2단계: 배포 확인

1. **빌드 로그 확인**: Deployments → 최신 배포 → Build Logs
2. **런타임 로그 확인**: Deployments → 최신 배포 → Runtime Logs
3. **에러가 없으면 성공!**

## 📋 필수 환경 변수 체크리스트

Vercel에서 다음 변수들이 모두 설정되어 있는지 확인:

- [ ] `DATABASE_URL` - **가장 중요!** `postgresql://`로 시작해야 함
- [ ] `NEXTAUTH_SECRET` - 32자 이상
- [ ] `NEXTAUTH_URL` - `https://edu.2twodragon.com`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `DEEPSEEK_API_KEY` - `sk-`로 시작

## 🔍 DATABASE_URL 형식 확인

올바른 형식 예시:
```
postgresql://user:password@host:port/database?sslmode=require
```

Vercel Postgres를 사용하면 자동으로 올바른 형식으로 생성됩니다.

## ⚠️ 주의사항

1. **환경 변수 추가 후 반드시 Redeploy 필요**
   - 환경 변수만 추가하면 안 됩니다
   - 반드시 **Redeploy**를 실행해야 합니다

2. **모든 환경에 설정**
   - Production, Preview, Development 모두에 설정하는 것을 권장합니다

3. **DATABASE_URL은 절대 공개하지 마세요**
   - 비밀번호가 포함되어 있습니다

## 🆘 여전히 문제가 있나요?

1. **Vercel 로그 확인**:
   - Deployments → Runtime Logs
   - 에러 메시지 확인

2. **환경 변수 재확인**:
   - Settings → Environment Variables
   - `DATABASE_URL`이 정확히 설정되었는지 확인

3. **데이터베이스 연결 테스트**:
   - Vercel Postgres를 사용하는 경우 자동으로 연결됩니다
   - 외부 DB를 사용하는 경우 방화벽 설정 확인

## 📚 자세한 가이드

- [Vercel DATABASE_URL 해결 가이드](./docs/VERCEL-DATABASE-FIX.md)
- [Vercel 환경 변수 설정](./VERCEL-ENV-SETUP.md)
- [배포 가이드](./DEPLOYMENT-GUIDE.md)




