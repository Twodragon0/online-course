# 멀티 플랫폼 빠른 참조 가이드

## 🎯 플랫폼 개요

| 플랫폼 | 도메인 | 상태 | 주요 기능 |
|--------|--------|------|----------|
| **tech-blog** | https://tech.2twodragon.com | ✅ 운영 중 | 기술 블로그, 자격증 관리 |
| **online-course** | https://edu.2twodragon.com | ⭐ 개발 중 | 비디오 강의, AI 채팅, 구독 |
| **cooking** | https://cooking.2twodragon.com | 🔮 예정 | 레시피, YouTube/네이버 연동 |
| **bit-dragon** | https://bit.2twodragon.com | 🔮 예정 | AI 음악/비디오 생성, 음악 스트리밍 |

## 💰 비용 구조 (1인 비즈니스)

### Phase 1: 초기 (0-100 사용자)
- **비용**: $1/월
- **구성**: Vercel Free + Postgres Hobby + 무료 서비스

### Phase 2: 성장기 (100-1,000 사용자)
- **비용**: $36-41/월
- **구성**: Postgres Pro + Redis Pro + AI API

### Phase 3: 확장기 (1,000-10,000 사용자)
- **비용**: $107-137/월
- **구성**: Vercel Pro + 고급 모니터링

### Phase 4: 성숙기 (10,000+ 사용자)
- **비용**: $222-302/월
- **구성**: 전체 Pro 플랜 + 최적화

## 💵 수익 모델

### online-course
- **Free**: 기본 기능
- **Pro**: $29/월 - 무제한 콘텐츠 + AI
- **Enterprise**: $99/월 - 팀 기능

### tech-blog
- Google AdSense
- 제휴 광고
- 스폰서 포스트

### cooking
- 제휴 마케팅
- YouTube 수익화
- 프리미엄 레시피

### bit-dragon
- 구독 모델 (Free/Pro $19/월/Creator $49/월)
- 음악 판매 ($0.99-4.99/곡)
- 뮤직 비디오 판매 ($4.99-19.99/비디오)
- 비트/EDM 팩 판매 ($9.99-49.99/팩)

## 📊 예상 수익

| 단계 | 기간 | 월 수익 | 순이익 |
|------|------|---------|--------|
| Phase 1 | 0-6개월 | $570-1,150 | $550-1,130 |
| Phase 2 | 6-12개월 | $2,250-4,300 | $2,200-4,250 |
| Phase 3 | 12-24개월 | $5,600-11,200 | $5,500-11,050 |

## 🔧 기술 스택

### 공통
- **프레임워크**: Next.js 14
- **언어**: TypeScript
- **스타일링**: Tailwind CSS + shadcn/ui
- **데이터베이스**: PostgreSQL (Prisma)
- **배포**: Vercel
- **인증**: NextAuth.js

### AI 서비스 (우선순위)
1. **DeepSeek** (최우선) - 가장 저렴
2. **Gemini** (Fallback)
3. **OpenAI** (Pro 플랜 전용)

## 🔐 보안 전략

- API Key 기반 플랫폼 간 인증
- HMAC 서명 검증
- Rate Limiting (Redis)
- 입력 검증 및 Sanitization
- CORS 도메인 제한

## 📈 성장 전략

### 콘텐츠 전략
- tech-blog → online-course 콘텐츠 연결
- cooking → tech-blog 요리 포스트
- 플랫폼 간 크로스 마케팅

### 자동화
- 외부 콘텐츠 자동 싱크 (네이버, YouTube)
- 모니터링 자동 알림
- CI/CD 자동 배포

## 🚀 다음 단계

1. ✅ tech-blog 운영 중
2. ⭐ online-course 싱크 기능 추가
3. 🔮 cooking 플랫폼 구축
4. 🔮 bit-dragon 플랫폼 구축

## 📚 상세 문서

- [멀티 플랫폼 아키텍처](./MULTI-PLATFORM-ARCHITECTURE.md)
- [싱크 구현 가이드](./SYNC-IMPLEMENTATION-GUIDE.md)

---

**최종 업데이트**: 2024-01-22
