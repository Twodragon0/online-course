# Architecture Diagrams

이 디렉토리에는 Python `diagrams` 라이브러리를 사용하여 생성된 시스템 아키텍처 다이어그램이 포함되어 있습니다.

## 설치 방법

```bash
# Python 가상환경 생성 (선택사항)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# Graphviz 설치 (시스템 레벨)
# macOS
brew install graphviz

# Ubuntu/Debian
sudo apt-get install graphviz

# Windows
# https://graphviz.org/download/ 에서 설치
```

## 다이어그램 생성

### 개별 다이어그램 생성

```bash
python architecture.py      # 전체 시스템 아키텍처
python security_flow.py     # 보안 흐름 다이어그램
python api_routes.py        # API 라우트 구조
python database_schema.py   # 데이터베이스 스키마
```

### 모든 다이어그램 한번에 생성

```bash
python generate_all.py
```

## 다이어그램 설명

### 1. architecture.py
- 전체 시스템 아키텍처
- 클라이언트부터 외부 서비스까지의 전체 흐름
- 보안 레이어와 API 라우트 구조

### 2. security_flow.py
- API 요청 처리 시 보안 검증 흐름
- Rate Limiting → Authentication → Validation → Sanitization 순서

### 3. api_routes.py
- 모든 API 엔드포인트 목록
- 각 API의 Rate Limit 설정
- 인증 요구사항

### 4. database_schema.py
- Prisma 데이터베이스 스키마
- 엔티티 간 관계 (1:1, 1:N)

## 출력 파일

각 스크립트는 PNG 형식의 이미지 파일을 생성합니다:
- `architecture.png`
- `security_flow.png`
- `api_routes.png`
- `database_schema.png`

## 참고사항

- 다이어그램은 `diagrams` 라이브러리를 사용하여 생성됩니다
- Graphviz가 시스템에 설치되어 있어야 합니다
- 생성된 이미지는 스크립트와 같은 디렉토리에 저장됩니다

