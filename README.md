# easyK - 외국인 맞춤형 정착 지원 플랫폼

외국인과 전문가(법조회사, 세무사, 노무사)를 연결하는 신뢰 기반 플랫폼

---

## 프로젝트 개요

easyK는 한국에 정착하는 외국인들이 겪는 법률, 일자리, 정부 지원 관련 어려움을 해결하기 위한 플랫폼입니다.

### 핵심 기능

- **FEAT-1: 법률 상담 매칭** - 외국인과 법률 전문가 연결
- **FEAT-2: 일자리 게시판** - 지자체 채용 공고 및 지원
- **FEAT-3: 정부 지원 정보** - 장려금, 교육, 훈련 프로그램 안내

---

## 기술 스택

### 프론트엔드
- **프레임워크**: Next.js 14+
- **언어**: TypeScript 5.0+
- **스타일링**: Tailwind CSS 3.0+
- **상태 관리**: React Context / Zustand
- **배포**: Vercel

### 백엔드
- **언어**: Python 3.11+
- **프레임워크**: FastAPI 0.104+
- **ORM**: SQLAlchemy 2.0+
- **데이터베이스**: PostgreSQL 15+ (Supabase)
- **배포**: Railway

---

## 시작하기

### 전제 조건

- Node.js 18+
- Python 3.11+
- PostgreSQL (또는 Supabase 계정)
- Git

### 설치

#### 1. 저장소 클론

```bash
git clone <repository-url>
cd easyk
```

#### 2. 프론트엔드 설정

```bash
cd frontend
npm install
cp .env.example .env.local
# .env.local 파일을 편집하여 환경 변수 설정
```

#### 3. 백엔드 설정

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# .env 파일을 편집하여 환경 변수 설정
```

### 개발 서버 실행

#### 프론트엔드

```bash
cd frontend
npm run dev
```

브라우저에서 http://localhost:3000 접속

#### 백엔드

```bash
cd backend
uvicorn src.main:app --reload
```

API 문서: http://localhost:8000/docs

---

## 프로젝트 구조

```
easyk/
├── docs/                    # 프로젝트 문서
│   ├── 01_easyK_PRD.md
│   ├── 02_easyK_TRD.md
│   ├── 03_easyK_UserFlow.md
│   ├── 04_easyK_DatabaseDesign.md
│   ├── 05_easyK_DesignSystem.md
│   └── 07_easyK_CodingConvention.md
├── plan.md                  # 개발 방법론 (헌법)
├── tasks.md                 # 실행 가능한 개발 큐
├── frontend/                # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # React 컴포넌트
│   │   ├── lib/            # 유틸리티 및 API
│   │   └── styles/         # 전역 스타일
│   └── public/             # 정적 파일
└── backend/                 # FastAPI 백엔드
    └── src/
        ├── routers/        # API 엔드포인트
        ├── models/         # 데이터베이스 모델
        ├── schemas/        # Pydantic 스키마
        ├── services/       # 비즈니스 로직
        └── tests/          # 테스트
```

---

## 개발 방법론

이 프로젝트는 **TDD (Test-Driven Development)**와 **Tidy First** 원칙을 따릅니다.

### TDD 사이클

1. **Red** - 실패하는 테스트 작성
2. **Green** - 최소한의 코드로 테스트 통과
3. **Refactor** - 구조 개선

### Tidy First

- **STRUCTURAL** (구조적 변경): 동작을 바꾸지 않는 리팩토링
- **BEHAVIORAL** (행동적 변경): 새로운 기능 추가

자세한 내용은 [plan.md](plan.md)를 참조하세요.

---

## 문서

- **[PRD](docs/01_easyK_PRD.md)** - 제품 요구사항 정의서
- **[TRD](docs/02_easyK_TRD.md)** - 기술 요구사항 정의서
- **[User Flow](docs/03_easyK_UserFlow.md)** - 사용자 흐름도
- **[Database Design](docs/04_easyK_DatabaseDesign.md)** - 데이터베이스 설계
- **[Design System](docs/05_easyK_DesignSystem.md)** - 디자인 시스템
- **[Coding Convention](docs/07_easyK_CodingConvention.md)** - 코딩 컨벤션
- **[Plan](plan.md)** - 개발 방법론
- **[Tasks](tasks.md)** - 개발 Task 목록

---

## 테스트

### 프론트엔드

```bash
cd frontend
npm test
```

### 백엔드

```bash
cd backend
pytest
```

---

## 배포

### 프론트엔드 (Vercel)

```bash
cd frontend
vercel
```

### 백엔드 (Railway)

Railway 대시보드에서 GitHub 저장소 연결 및 자동 배포 설정

---

## 기여

1. 이 저장소를 포크합니다
2. 새 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경 사항을 커밋합니다 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다.

---

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 연락처

프로젝트 관련 문의: [이메일 주소]

프로젝트 링크: [GitHub 저장소 URL]
# Vercel deployment trigger
