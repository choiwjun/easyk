# easyK Tasks (실행 가능한 개발 큐)

**문서 버전**: v1.0
**작성일**: 2025-12-31
**프로젝트**: easyK (외국인 맞춤형 정착 지원 플랫폼)

---

## 문서 목적

이 문서는 **실행 가능한 개발 큐(Execution Queue)**이자 프로젝트 진행 상황의 참조 문서입니다.

각 Task는:
- 하나의 테스트로 검증 가능
- 단일 책임 원칙 준수
- 가능한 최소 실행 단위
- STRUCTURAL / BEHAVIORAL 타입 명확히 구분

---

## Task 상태 정의

- **TODO**: 아직 시작하지 않음
- **IN_PROGRESS**: 현재 진행 중
- **DONE**: 완료됨
- **BLOCKED**: 외부 의존성으로 대기 중
- **SKIPPED**: 범위 외로 건너뜀

---

## Phase 1: 프로젝트 초기 설정 (Infrastructure)

### TASK-001: 프로젝트 저장소 구조 생성
- **타입**: STRUCTURAL
- **상태**: DONE ✅
- **설명**: 프론트엔드/백엔드 폴더 구조 생성
- **상세**:
  - `frontend/` 폴더: Next.js 프로젝트 초기화
  - `backend/` 폴더: FastAPI 프로젝트 초기화
  - `.gitignore`, `README.md` 생성
- **검증**: 폴더 구조가 Coding Convention 섹션 3과 일치
- **의존성**: 없음
- **완료 내용**:
  - ✅ frontend/ 및 backend/ 최상위 폴더 생성
  - ✅ 프론트엔드 전체 폴더 구조 생성 (src/app, components, lib, styles, types, context)
  - ✅ 백엔드 전체 폴더 구조 생성 (routers, models, schemas, services, middleware, utils, tests)
  - ✅ .gitignore 파일 생성 (Node.js, Python, IDE, 환경변수 제외)
  - ✅ README.md 생성 (프로젝트 개요, 기술 스택, 시작 가이드)

### TASK-002: 프론트엔드 개발 환경 설정
- **타입**: STRUCTURAL
- **상태**: DONE ✅
- **설명**: Next.js, TypeScript, Tailwind CSS 설정
- **상세**:
  - `npx create-next-app@latest` 실행
  - TypeScript 설정
  - Tailwind CSS 설치 및 설정
  - ESLint, Prettier 설정
- **검증**: `npm run dev` 실행 성공, TypeScript 컴파일 에러 없음
- **의존성**: TASK-001
- **완료 내용**:
  - ✅ Next.js 16, React 19, TypeScript 5 설치
  - ✅ Tailwind CSS 4 설치 및 설정 (Design System 색상 팔레트 적용)
  - ✅ tsconfig.json 생성 (strict mode, path aliases 설정)
  - ✅ next.config.js 생성 (React strict mode 활성화)
  - ✅ ESLint 설정 (.eslintrc.json)
  - ✅ PostCSS 설정 (Tailwind, Autoprefixer)
  - ✅ 기본 레이아웃 및 페이지 생성 (layout.tsx, page.tsx)
  - ✅ globals.css 생성 (Design System 타이포그래피 적용)
  - ✅ .env.example 생성
  - ✅ npm run dev 실행 성공 확인
  - ✅ TypeScript 컴파일 에러 없음 확인

### TASK-003: 백엔드 개발 환경 설정
- **타입**: STRUCTURAL
- **상태**: DONE ✅
- **설명**: FastAPI, SQLAlchemy, PostgreSQL 연결 설정
- **상세**:
  - `requirements.txt` 생성 (FastAPI, SQLAlchemy, asyncpg, pydantic, python-jose)
  - `.env` 파일 템플릿 생성
  - `src/main.py` 메인 앱 생성
  - `src/database.py` DB 연결 설정
- **검증**: `uvicorn src.main:app --reload` 실행 성공
- **의존성**: TASK-001
- **완료 내용**:
  - ✅ requirements.txt 생성 (FastAPI 0.115.6, SQLAlchemy 2.0.36, asyncpg, pydantic, python-jose 등)
  - ✅ .env.example 생성 (DATABASE_URL, SECRET_KEY, SMTP, TOSS 설정)
  - ✅ src/main.py 생성 (FastAPI 앱, CORS 설정, Health check 엔드포인트)
  - ✅ src/config.py 생성 (pydantic-settings 기반 설정 관리)
  - ✅ src/database.py 생성 (SQLAlchemy 엔진, 세션, get_db 의존성)
  - ✅ 모든 서브 패키지에 __init__.py 생성
  - ✅ Python 가상환경 생성 (venv)
  - ✅ 패키지 설치 완료
  - ✅ uvicorn 서버 실행 성공 (http://127.0.0.1:8000)
  - ✅ API 문서 자동 생성 확인 가능 (/docs)

### TASK-004: 데이터베이스 초기 스키마 생성
- **타입**: STRUCTURAL
- **상태**: DONE ✅
- **설명**: Users 테이블 생성
- **상세**:
  - Database Design 섹션 1의 Users 테이블 SQL을 SQLAlchemy 모델로 변환
  - `src/models/user.py` 생성
  - Alembic 마이그레이션 초기화
  - 첫 마이그레이션 생성 및 적용
- **검증**: Supabase에서 `users` 테이블 확인 (마이그레이션 적용 전 대기)
- **의존성**: TASK-003
- **완료 내용**:
  - ✅ src/models/user.py 생성 (User 모델: id, email, password_hash, role, profile 등 전체 필드)
  - ✅ src/models/__init__.py 업데이트 (User 모델 export)
  - ✅ Alembic 초기화 완료 (alembic/ 폴더, alembic.ini 생성)
  - ✅ alembic/env.py 수정 (config.py에서 DATABASE_URL 가져오기, Base.metadata 설정)
  - ✅ 첫 마이그레이션 파일 생성 (352b2bc8f04d_create_users_table.py)
  - ✅ upgrade() / downgrade() 함수 작성 (users 테이블 생성/삭제, 인덱스 생성/삭제)
  - ⏸️  실제 DB 적용은 Supabase 연결 후 `alembic upgrade head` 실행 필요

---

## Phase 2: 인증 시스템 (FEAT-0: Authentication)

### TASK-005: 회원가입 API - 테스트 작성
- **타입**: BEHAVIORAL
- **상태**: DONE ✅
- **설명**: 회원가입 API에 대한 실패하는 테스트 작성 (RED)
- **상세**:
  - `tests/test_auth.py` 생성
  - `test_signup_success()`: 유효한 데이터로 회원가입 성공
  - `test_signup_invalid_email()`: 잘못된 이메일 형식 검증
  - `test_signup_duplicate_email()`: 중복 이메일 검증
- **검증**: 테스트 실행 시 모두 실패 (코드 미구현)
- **의존성**: TASK-004
- **완료 내용**:
  - ✅ src/tests/test_auth.py 생성 (5개 테스트 케이스)
  - ✅ test_signup_success(): 유효한 데이터로 회원가입 성공 테스트
  - ✅ test_signup_invalid_email(): 잘못된 이메일 형식 검증 테스트
  - ✅ test_signup_duplicate_email(): 중복 이메일 검증 테스트
  - ✅ test_signup_missing_required_fields(): 필수 필드 누락 검증
  - ✅ test_signup_weak_password(): 약한 비밀번호 검증
  - ✅ pytest.ini 설정 파일 생성
  - ✅ 테스트 실행 확인: 5 failed (모두 404 - 엔드포인트 미구현)
  - ✅ TDD RED 단계 완료

### TASK-006: 회원가입 API - 최소 구현
- **타입**: BEHAVIORAL
- **상태**: DONE ✅
- **설명**: 테스트를 통과시키는 최소 코드 작성 (GREEN)
- **상세**:
  - `src/schemas/user.py`: UserCreateSchema, UserResponseSchema 정의
  - `src/routers/auth.py`: POST /api/auth/signup 엔드포인트
  - 비밀번호 bcrypt 해싱
  - DB에 사용자 저장
- **검증**: TASK-005의 모든 테스트 통과
- **의존성**: TASK-005
- **완료 내용**:
  - ✅ src/schemas/user.py 생성 (UserCreate, UserResponse Pydantic 스키마)
  - ✅ src/schemas/__init__.py 업데이트 (schemas export)
  - ✅ src/routers/auth.py 생성 (POST /api/auth/signup 엔드포인트)
  - ✅ hash_password() 함수 구현 (bcrypt 직접 사용, 72바이트 제한 처리)
  - ✅ 사용자 생성 로직 구현 (DB 저장, IntegrityError 처리)
  - ✅ src/routers/__init__.py 업데이트 (routers export)
  - ✅ src/main.py 업데이트 (auth router 등록)
  - ✅ models/user.py 수정 (SQLite 호환성을 위해 email CHECK 제약 제거)
  - ✅ email-validator 패키지 설치 (EmailStr 지원)
  - ✅ 모든 테스트 통과 (5 passed): test_signup_success, test_signup_invalid_email, test_signup_duplicate_email, test_signup_missing_required_fields, test_signup_weak_password
  - ✅ TDD GREEN 단계 완료

### TASK-007: 회원가입 API - 리팩토링
- **타입**: STRUCTURAL
- **상태**: DONE ✅
- **설명**: 중복 제거 및 구조 개선 (REFACTOR)
- **상세**:
  - 비밀번호 해싱 로직을 `src/utils/auth.py`로 추출
  - 사용자 생성 로직을 `src/services/auth_service.py`로 이동
  - 중복 제거
- **검증**: 테스트 여전히 모두 통과, 동작 변경 없음
- **의존성**: TASK-006
- **완료 내용**:
  - ✅ src/utils/auth.py 생성 (hash_password() 함수 추출)
  - ✅ src/utils/__init__.py 업데이트 (hash_password export)
  - ✅ src/services/auth_service.py 생성 (create_user() 함수)
  - ✅ src/services/__init__.py 업데이트 (auth_service export)
  - ✅ src/routers/auth.py 리팩토링 (비즈니스 로직 제거, 서비스 레이어 호출로 변경)
  - ✅ 모든 테스트 통과 (5 passed): 동작 변경 없이 코드 구조만 개선
  - ✅ TDD REFACTOR 단계 완료

### TASK-008: 로그인 API - 테스트 작성
- **타입**: BEHAVIORAL
- **상태**: DONE ✅
- **설명**: 로그인 API에 대한 실패하는 테스트 작성 (RED)
- **상세**:
  - `test_login_success()`: 유효한 자격 증명으로 로그인 성공, JWT 토큰 반환
  - `test_login_invalid_credentials()`: 잘못된 비밀번호 검증
  - `test_login_nonexistent_user()`: 존재하지 않는 사용자 검증
- **검증**: 테스트 실행 시 모두 실패
- **의존성**: TASK-007
- **완료 내용**:
  - ✅ src/tests/test_login.py 생성 (6개 테스트 케이스)
  - ✅ test_login_success(): 유효한 자격 증명으로 로그인 성공, JWT 토큰 반환 테스트
  - ✅ test_login_invalid_password(): 잘못된 비밀번호 검증 테스트
  - ✅ test_login_nonexistent_user(): 존재하지 않는 사용자 검증 테스트
  - ✅ test_login_missing_email(): 이메일 누락 검증 테스트
  - ✅ test_login_missing_password(): 비밀번호 누락 검증 테스트
  - ✅ test_login_invalid_email_format(): 잘못된 이메일 형식 검증 테스트
  - ✅ 테스트 실행 확인: 6 failed (모두 404 - 엔드포인트 미구현)
  - ✅ TDD RED 단계 완료

### TASK-009: 로그인 API - 최소 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 테스트를 통과시키는 최소 코드 작성 (GREEN)
- **상세**:
  - POST /api/auth/login 엔드포인트
  - 이메일/비밀번호 검증
  - JWT 토큰 생성 (python-jose)
  - 토큰 반환
- **검증**: TASK-008의 모든 테스트 통과
- **의존성**: TASK-008

### TASK-010: JWT 인증 미들웨어 - 테스트 작성
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: JWT 토큰 검증 미들웨어 테스트 작성 (RED)
- **상세**:
  - `test_protected_route_with_valid_token()`: 유효한 토큰으로 보호된 라우트 접근 성공
  - `test_protected_route_without_token()`: 토큰 없이 접근 시 401 에러
  - `test_protected_route_with_invalid_token()`: 잘못된 토큰으로 접근 시 401 에러
- **검증**: 테스트 실행 시 모두 실패
- **의존성**: TASK-009

### TASK-011: JWT 인증 미들웨어 - 최소 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 테스트를 통과시키는 최소 코드 작성 (GREEN)
- **상세**:
  - `src/middleware/auth.py`: get_current_user() 의존성 함수
  - JWT 토큰 검증 로직
  - Authorization 헤더 파싱
- **검증**: TASK-010의 모든 테스트 통과
- **의존성**: TASK-010

### TASK-012: 프론트엔드 회원가입 폼 - UI 컴포넌트
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: Design System 기반 회원가입 폼 컴포넌트 생성
- **상세**:
  - `src/components/ui/Input.tsx`: Design System 섹션 4.2 명세 구현
  - `src/components/ui/Button.tsx`: Design System 섹션 4.1 명세 구현
  - TypeScript Props 타입 정의
- **검증**: Storybook 또는 수동 테스트로 디자인 확인
- **의존성**: TASK-002

### TASK-013: 프론트엔드 회원가입 페이지 - 테스트 작성
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 회원가입 페이지 컴포넌트 테스트 작성 (RED)
- **상세**:
  - `src/app/(auth)/signup/page.test.tsx` 생성
  - 폼 입력 시 상태 업데이트 테스트
  - 제출 시 API 호출 테스트
  - 에러 표시 테스트
- **검증**: 테스트 실행 시 모두 실패
- **의존성**: TASK-012

### TASK-014: 프론트엔드 회원가입 페이지 - 최소 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 테스트를 통과시키는 최소 코드 작성 (GREEN)
- **상세**:
  - `src/app/(auth)/signup/page.tsx` 생성
  - React Hook Form으로 폼 관리
  - API 호출 (`/api/auth/signup`)
  - 성공 시 로그인 페이지로 리다이렉트
- **검증**: TASK-013의 모든 테스트 통과
- **의존성**: TASK-013

### TASK-015: 프론트엔드 로그인 페이지 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 로그인 페이지 전체 구현 (테스트 → 구현)
- **상세**:
  - TASK-013, 014와 동일한 TDD 사이클
  - `src/app/(auth)/login/page.tsx`
  - JWT 토큰을 쿠키 또는 localStorage 저장 (보안: HttpOnly 쿠키 권장)
- **검증**: 로그인 성공 시 대시보드로 이동
- **의존성**: TASK-014

---

## Phase 3: 사용자 프로필 관리

### TASK-016: 사용자 프로필 API - 테스트 작성
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 프로필 조회/수정 API 테스트 (RED)
- **상세**:
  - `test_get_profile()`: 자신의 프로필 조회 성공
  - `test_update_profile()`: 프로필 수정 성공
  - `test_update_profile_unauthorized()`: 다른 사용자 프로필 수정 시 403 에러
- **검증**: 테스트 실행 시 모두 실패
- **의존성**: TASK-011

### TASK-017: 사용자 프로필 API - 최소 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 테스트를 통과시키는 최소 코드 작성 (GREEN)
- **상세**:
  - GET /api/users/me: 현재 사용자 정보 반환
  - PUT /api/users/me: 프로필 업데이트
  - 권한 검증 (자신의 프로필만 수정 가능)
- **검증**: TASK-016의 모든 테스트 통과
- **의존성**: TASK-016

### TASK-018: 프론트엔드 프로필 페이지 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 프로필 조회/수정 페이지 (TDD 사이클)
- **상세**:
  - `src/app/(dashboard)/profile/page.tsx`
  - 프로필 정보 표시
  - 수정 폼 (국적, 비자 종류, 선호 언어, 거주 지역)
- **검증**: 프로필 수정 후 변경 사항 반영 확인
- **의존성**: TASK-017

---

## Phase 4: 법률 상담 시스템 (FEAT-1)

### TASK-019: Consultants 테이블 생성
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 전문가 정보 테이블 추가
- **상세**:
  - Database Design 섹션 2의 Consultants 테이블을 SQLAlchemy 모델로 변환
  - `src/models/consultant.py` 생성
  - 마이그레이션 생성 및 적용
- **검증**: Supabase에서 `consultants` 테이블 확인
- **의존성**: TASK-004

### TASK-020: Consultations 테이블 생성
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 상담 신청 테이블 추가
- **상세**:
  - Database Design 섹션 3의 Consultations 테이블을 SQLAlchemy 모델로 변환
  - `src/models/consultation.py` 생성
  - 외래키 관계 설정 (user_id, consultant_id)
  - 마이그레이션 생성 및 적용
- **검증**: Supabase에서 `consultations` 테이블 확인
- **의존성**: TASK-019

### TASK-021: 상담 신청 API - 테스트 작성
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 상담 신청 생성 API 테스트 (RED)
- **상세**:
  - `tests/test_consultations.py` 생성
  - `test_create_consultation_success()`: 유효한 데이터로 상담 신청 성공
  - `test_create_consultation_invalid_type()`: 잘못된 상담 유형 검증
  - `test_create_consultation_missing_content()`: 내용 누락 검증
  - `test_create_consultation_unauthorized()`: 인증 없이 요청 시 401 에러
- **검증**: 테스트 실행 시 모두 실패
- **의존성**: TASK-020

### TASK-022: 상담 신청 API - 최소 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 테스트를 통과시키는 최소 코드 작성 (GREEN)
- **상세**:
  - `src/schemas/consultation.py`: ConsultationCreateSchema, ConsultationResponseSchema
  - POST /api/consultations 엔드포인트
  - 요청 데이터 검증 (Pydantic)
  - DB에 상담 신청 저장 (status: 'requested')
- **검증**: TASK-021의 모든 테스트 통과
- **의존성**: TASK-021

### TASK-023: 상담 신청 API - 리팩토링
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 비즈니스 로직을 서비스 레이어로 이동
- **상세**:
  - `src/services/consultation_service.py` 생성
  - `create_consultation()` 함수로 로직 추출
  - 라우터는 얇게 유지 (요청 검증, 서비스 호출, 응답 반환만)
- **검증**: 테스트 여전히 모두 통과, 동작 변경 없음
- **의존성**: TASK-022

### TASK-024: 전문가 매칭 로직 - 테스트 작성
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 조건 기반 전문가 매칭 테스트 (RED)
- **상세**:
  - `tests/test_matching.py` 생성
  - `test_match_consultant_by_specialty()`: 전문 분야 일치하는 전문가 찾기
  - `test_match_consultant_by_rating()`: 평점 높은 순으로 정렬
  - `test_match_consultant_no_match()`: 일치하는 전문가 없을 때 처리
- **검증**: 테스트 실행 시 모두 실패
- **의존성**: TASK-023

### TASK-025: 전문가 매칭 로직 - 최소 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 테스트를 통과시키는 최소 코드 작성 (GREEN)
- **상세**:
  - `src/services/matching_service.py` 생성
  - `find_matching_consultant()` 함수
  - 상담 유형(consultation_type)과 전문가의 specialties 매칭
  - 평점 높은 순으로 정렬, 첫 번째 반환
- **검증**: TASK-024의 모든 테스트 통과
- **의존성**: TASK-024

### TASK-026: 상담 신청 시 자동 매칭 통합
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 상담 신청 생성 시 자동으로 전문가 매칭
- **상세**:
  - `consultation_service.create_consultation()`에서 `matching_service.find_matching_consultant()` 호출
  - 매칭된 전문가 ID를 consultation.consultant_id에 저장
  - 상태를 'matched'로 업데이트
  - 매칭 실패 시 'requested' 상태 유지
- **검증**: 상담 신청 후 consultant_id 자동 할당 확인
- **의존성**: TASK-025

### TASK-027: 전문가 상담 요청 목록 조회 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 전문가가 자신에게 들어온 상담 요청 조회 (TDD 사이클)
- **상세**:
  - GET /api/consultations/incoming 엔드포인트
  - 현재 로그인한 전문가의 consultant_id로 필터링
  - 상태별 필터링 옵션 (requested, matched, scheduled)
- **검증**: 전문가 계정으로 요청 시 자신의 상담만 조회
- **의존성**: TASK-026

### TASK-028: 전문가 상담 수락/거절 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 전문가가 상담 요청 수락/거절 (TDD 사이클)
- **상세**:
  - POST /api/consultations/{id}/accept 엔드포인트
  - POST /api/consultations/{id}/reject 엔드포인트
  - 상태 업데이트 (matched → scheduled 또는 rejected)
  - 권한 검증 (해당 전문가만 수락/거절 가능)
- **검증**: 수락 시 상태 변경, 거절 시 다른 전문가 재매칭
- **의존성**: TASK-027

### TASK-029: 프론트엔드 상담 신청 폼 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 외국인이 상담 신청하는 폼 페이지 (TDD 사이클)
- **상세**:
  - `src/app/(dashboard)/consultations/new/page.tsx`
  - 상담 유형 선택 (Select 컴포넌트)
  - 상담 내용 입력 (Textarea)
  - 제출 시 POST /api/consultations 호출
- **검증**: 제출 후 대시보드로 이동, 신청 목록에 표시
- **의존성**: TASK-028

### TASK-030: 프론트엔드 상담 목록 페이지 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 외국인이 자신의 상담 신청 목록 조회 (TDD 사이클)
- **상세**:
  - `src/app/(dashboard)/consultations/page.tsx`
  - GET /api/consultations?user_id=me 호출
  - 상태별 배지 표시 (requested, matched, scheduled, completed)
  - 상세 페이지 링크
- **검증**: 신청한 상담 목록이 카드 형태로 표시
- **의존성**: TASK-029

---

## Phase 5: 결제 시스템 (FEAT-1 확장)

### TASK-031: Payments 테이블 생성
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 결제 기록 테이블 추가
- **상세**:
  - Database Design 섹션 5의 Payments 테이블을 SQLAlchemy 모델로 변환
  - `src/models/payment.py` 생성
  - 외래키 관계 설정 (consultation_id, user_id)
- **검증**: Supabase에서 `payments` 테이블 확인
- **의존성**: TASK-020

### TASK-032: 토스페이먼츠 연동 준비
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 토스페이먼츠 SDK 설치 및 설정
- **상세**:
  - 프론트엔드: 토스페이먼츠 SDK 설치
  - 백엔드: 토스페이먼츠 API 클라이언트 설정
  - 환경 변수에 API 키 추가
- **검증**: SDK 로드 확인
- **의존성**: TASK-031

### TASK-033: 결제 생성 API - 테스트 작성
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 결제 요청 생성 API 테스트 (RED)
- **상세**:
  - `tests/test_payments.py` 생성
  - `test_create_payment()`: 상담에 대한 결제 생성
  - `test_create_payment_duplicate()`: 중복 결제 방지
  - `test_create_payment_invalid_consultation()`: 존재하지 않는 상담
- **검증**: 테스트 실행 시 모두 실패
- **의존성**: TASK-032

### TASK-034: 결제 생성 API - 최소 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 테스트를 통과시키는 최소 코드 작성 (GREEN)
- **상세**:
  - POST /api/payments 엔드포인트
  - consultation_id 받아서 금액 계산
  - 토스페이먼츠 결제 요청 생성
  - DB에 결제 기록 저장 (status: 'pending')
- **검증**: TASK-033의 모든 테스트 통과
- **의존성**: TASK-033

### TASK-035: 결제 완료 콜백 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 토스페이먼츠 결제 완료 후 콜백 처리 (TDD 사이클)
- **상세**:
  - POST /api/payments/callback 엔드포인트
  - 토스페이먼츠 서명 검증
  - 결제 상태를 'completed'로 업데이트
  - 상담 상태를 'scheduled'로 업데이트
- **검증**: 결제 완료 후 상담 예약 가능 상태
- **의존성**: TASK-034

### TASK-036: 프론트엔드 결제 페이지 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 상담료 결제 페이지 (TDD 사이클)
- **상세**:
  - `src/app/(dashboard)/consultations/[id]/payment/page.tsx`
  - 상담 정보 표시 (전문가, 금액)
  - 토스페이먼츠 결제창 연동
  - 결제 성공 시 예약 페이지로 이동
- **검증**: 결제 완료 후 상담 상태 변경 확인
- **의존성**: TASK-035

---

## Phase 6: 평가 및 후기 시스템

### TASK-037: Reviews 테이블 생성
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 평가 테이블 추가
- **상세**:
  - Database Design 섹션 4의 Reviews 테이블을 SQLAlchemy 모델로 변환
  - `src/models/review.py` 생성
- **검증**: Supabase에서 `reviews` 테이블 확인
- **의존성**: TASK-031

### TASK-038: 후기 작성 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 상담 완료 후 후기 작성 (TDD 사이클)
- **상세**:
  - POST /api/reviews 엔드포인트
  - consultation_id, rating (1-5), comment 받기
  - 중복 후기 방지 (1 상담당 1 후기)
  - 전문가의 평균 평점 자동 업데이트
- **검증**: 후기 작성 후 전문가 평점 갱신 확인
- **의존성**: TASK-037

### TASK-039: 후기 목록 조회 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 전문가별 후기 목록 조회 (TDD 사이클)
- **상세**:
  - GET /api/consultants/{id}/reviews 엔드포인트
  - 최신순 정렬
  - 페이지네이션 (limit, offset)
- **검증**: 전문가 프로필 페이지에서 후기 표시
- **의존성**: TASK-038

### TASK-040: 프론트엔드 후기 작성 페이지 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 상담 완료 후 후기 작성 폼 (TDD 사이클)
- **상세**:
  - `src/app/(dashboard)/consultations/[id]/review/page.tsx`
  - 별점 선택 (1-5)
  - 후기 텍스트 입력
  - 제출 시 POST /api/reviews 호출
- **검증**: 후기 작성 후 완료 메시지 표시
- **의존성**: TASK-039

---

## Phase 7: 일자리 시스템 (FEAT-2)

### TASK-041: Jobs 테이블 생성
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 일자리 공고 테이블 추가
- **상세**:
  - Database Design 섹션 6의 Jobs 테이블을 SQLAlchemy 모델로 변환
  - `src/models/job.py` 생성
- **검증**: Supabase에서 `jobs` 테이블 확인
- **의존성**: TASK-004

### TASK-042: Job_Applications 테이블 생성
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 일자리 지원 테이블 추가
- **상세**:
  - Database Design 섹션 7의 Job_Applications 테이블을 SQLAlchemy 모델로 변환
  - `src/models/job_application.py` 생성
  - 외래키 관계 설정 (job_id, user_id)
  - UNIQUE 제약 (job_id, user_id) - 중복 지원 방지
- **검증**: Supabase에서 `job_applications` 테이블 확인
- **의존성**: TASK-041

### TASK-043: 일자리 공고 목록 조회 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 일자리 목록 조회 및 검색 (TDD 사이클)
- **상세**:
  - GET /api/jobs 엔드포인트
  - 필터링: 지역, 고용 형태, 직종
  - 검색: 키워드 (position, company_name)
  - 페이지네이션
- **검증**: 필터 적용 시 올바른 결과 반환
- **의존성**: TASK-042

### TASK-044: 일자리 상세 조회 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 특정 일자리 상세 정보 조회 (TDD 사이클)
- **상세**:
  - GET /api/jobs/{id} 엔드포인트
  - 공고 상세 정보 반환
  - 지원 여부 확인 (현재 사용자가 이미 지원했는지)
- **검증**: 상세 페이지에서 모든 정보 표시
- **의존성**: TASK-043

### TASK-045: 일자리 지원 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 외국인이 일자리에 지원 (TDD 사이클)
- **상세**:
  - POST /api/jobs/{id}/apply 엔드포인트
  - cover_letter, resume_url 받기
  - 중복 지원 방지 (UNIQUE 제약)
  - DB에 지원 기록 저장 (status: 'applied')
- **검증**: 지원 후 지원 내역에 표시
- **의존성**: TASK-044

### TASK-046: 프론트엔드 일자리 목록 페이지 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 일자리 검색 및 목록 표시 (TDD 사이클)
- **상세**:
  - `src/app/(dashboard)/jobs/page.tsx`
  - 검색창 (키워드)
  - 필터 (지역, 고용 형태, 직종)
  - 카드 형태로 공고 목록 표시
  - 상세 페이지 링크
- **검증**: 검색/필터 작동 확인
- **의존성**: TASK-045

### TASK-047: 프론트엔드 일자리 상세 페이지 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 일자리 상세 정보 및 지원 (TDD 사이클)
- **상세**:
  - `src/app/(dashboard)/jobs/[id]/page.tsx`
  - 공고 상세 정보 표시
  - 지원 버튼 (이미 지원했으면 비활성화)
  - 지원 모달 (자기소개서 입력)
- **검증**: 지원 완료 후 버튼 비활성화
- **의존성**: TASK-046

### TASK-048: 지자체 일자리 공고 관리 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 지자체가 공고 작성/수정/삭제 (TDD 사이클)
- **상세**:
  - POST /api/jobs: 새 공고 작성
  - PUT /api/jobs/{id}: 공고 수정
  - DELETE /api/jobs/{id}: 공고 삭제
  - 권한 검증 (role: 'admin')
- **검증**: 지자체 계정으로만 작성/수정/삭제 가능
- **의존성**: TASK-047

### TASK-049: 지자체 지원자 목록 조회 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 지자체가 공고별 지원자 조회 (TDD 사이클)
- **상세**:
  - GET /api/jobs/{id}/applications 엔드포인트
  - 지원자 정보 (이름, 이메일, 지원 날짜, 자기소개서)
  - 상태별 필터링 (applied, in_review, accepted, rejected)
- **검증**: 지자체 계정으로 자신의 공고 지원자만 조회
- **의존성**: TASK-048

### TASK-050: 프론트엔드 지자체 관리 페이지 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 지자체 일자리 관리 대시보드 (TDD 사이클)
- **상세**:
  - `src/app/(dashboard)/admin/jobs/page.tsx`
  - 공고 목록 (작성, 수정, 삭제 버튼)
  - 공고 작성 폼
  - 지원자 목록 조회
  - 지원자 상태 변경 (채용/거절)
- **검증**: 공고 작성/수정/삭제, 지원자 관리 모두 작동
- **의존성**: TASK-049

---

## Phase 8: 정부 지원 정보 (FEAT-3)

### TASK-051: Government_Supports 테이블 생성
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 정부 지원 프로그램 테이블 추가
- **상세**:
  - Database Design 섹션 8의 Government_Supports 테이블을 SQLAlchemy 모델로 변환
  - `src/models/government_support.py` 생성
- **검증**: Supabase에서 `government_supports` 테이블 확인
- **의존성**: TASK-004

### TASK-052: Support_Keywords 테이블 생성
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 정부 지원 검색 키워드 테이블 추가
- **상세**:
  - Database Design 섹션 9의 Support_Keywords 테이블을 SQLAlchemy 모델로 변환
  - `src/models/support_keyword.py` 생성
  - 외래키 관계 설정 (support_id)
- **검증**: Supabase에서 `support_keywords` 테이블 확인
- **의존성**: TASK-051

### TASK-053: 정부 지원 정보 목록 조회 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 정부 지원 프로그램 목록 조회 (TDD 사이클)
- **상세**:
  - GET /api/supports 엔드포인트
  - 카테고리별 필터링 (subsidy, education, training)
  - 검색 (키워드)
- **검증**: 카테고리 필터 적용 시 올바른 결과 반환
- **의존성**: TASK-052

### TASK-054: 정부 지원 상세 조회 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 특정 지원 프로그램 상세 정보 조회 (TDD 사이클)
- **상세**:
  - GET /api/supports/{id} 엔드포인트
  - 지원 내용, 자격 조건, 신청 방법 반환
- **검증**: 상세 페이지에서 모든 정보 표시
- **의존성**: TASK-053

### TASK-055: 프론트엔드 정부 지원 목록 페이지 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 정부 지원 검색 및 목록 표시 (TDD 사이클)
- **상세**:
  - `src/app/(dashboard)/supports/page.tsx`
  - 카테고리 탭 (장려금, 교육, 훈련)
  - 검색창
  - 카드 형태로 프로그램 목록 표시
- **검증**: 카테고리 전환 및 검색 작동
- **의존성**: TASK-054

### TASK-056: 프론트엔드 정부 지원 상세 페이지 - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 정부 지원 프로그램 상세 정보 (TDD 사이클)
- **상세**:
  - `src/app/(dashboard)/supports/[id]/page.tsx`
  - 프로그램 설명
  - 자격 조건 (비자 종류 등)
  - 신청 방법 및 링크
- **검증**: 외부 링크 클릭 시 신청 페이지로 이동
- **의존성**: TASK-055

### TASK-057: 관리자 정부 지원 정보 관리 API - 구현
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 관리자가 정부 지원 정보 추가/수정/삭제 (TDD 사이클)
- **상세**:
  - POST /api/supports: 새 프로그램 추가
  - PUT /api/supports/{id}: 프로그램 수정
  - DELETE /api/supports/{id}: 프로그램 삭제
  - 권한 검증 (role: 'admin')
- **검증**: 관리자 계정으로만 관리 가능
- **의존성**: TASK-056

---

## Phase 9: 다국어 지원 (i18n)

### TASK-058: 프론트엔드 다국어 설정
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: react-i18next 설치 및 설정
- **상세**:
  - `react-i18next`, `i18next` 설치
  - `src/lib/i18n.ts` 설정 파일 생성
  - 언어 전환 컨텍스트 생성
  - 한국어/영어 번역 파일 생성 (`public/locales/ko.json`, `en.json`)
- **검증**: 언어 전환 시 UI 텍스트 변경 확인
- **의존성**: TASK-002

### TASK-059: 주요 페이지 다국어 적용
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 홈, 회원가입, 로그인 페이지 다국어 적용
- **상세**:
  - `useTranslation` 훅 사용
  - 버튼, 라벨, 메시지 등 번역
  - 언어 선택 드롭다운 추가 (Header)
- **검증**: 언어 전환 시 모든 텍스트 변경
- **의존성**: TASK-058

### TASK-060: 백엔드 에러 메시지 다국어 지원
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: API 에러 메시지를 다국어로 반환 (선택적)
- **상세**:
  - Accept-Language 헤더 읽기
  - 에러 메시지를 언어별로 반환
  - 기본값: 한국어
- **검증**: 헤더에 따라 다른 언어 에러 메시지 반환
- **의존성**: TASK-059

---

## Phase 10: 성능 최적화 및 배포 준비

### TASK-061: 프론트엔드 성능 최적화
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 코드 분할, 이미지 최적화
- **상세**:
  - Next.js Dynamic Import로 코드 분할
  - 이미지 최적화 (Next.js Image 컴포넌트)
  - Lighthouse 점수 측정 (목표: 90+)
- **검증**: 페이지 로드 시간 < 2초
- **의존성**: TASK-059

### TASK-062: 백엔드 DB 쿼리 최적화
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 인덱스 추가 및 N+1 쿼리 제거
- **상세**:
  - Database Design의 인덱싱 전략 적용
  - SQLAlchemy의 `joinedload`, `selectinload` 사용
  - 쿼리 성능 측정 (목표: < 100ms)
- **검증**: API 응답 시간 < 500ms (P95)
- **의존성**: TASK-057

### TASK-063: 보안 강화
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: OWASP Top 10 검토 및 보안 조치
- **상세**:
  - CORS 설정 (신뢰할 수 있는 도메인만)
  - Rate Limiting 추가 (slowapi)
  - 환경 변수 검증 (민감 정보 코드에 미포함)
  - HTTPS 강제
- **검증**: 보안 체크리스트 모두 통과
- **의존성**: TASK-062

### TASK-064: 프론트엔드 Vercel 배포
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: Vercel에 프론트엔드 배포
- **상세**:
  - Vercel 프로젝트 생성
  - GitHub 저장소 연동
  - 환경 변수 설정
  - 자동 배포 설정 (main 브랜치)
- **검증**: 배포된 URL에서 앱 접근 가능
- **의존성**: TASK-063

### TASK-065: 백엔드 Railway 배포
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: Railway에 백엔드 배포
- **상세**:
  - Railway 프로젝트 생성
  - PostgreSQL 데이터베이스 연결
  - 환경 변수 설정
  - 자동 배포 설정
- **검증**: 배포된 API 엔드포인트에서 응답 확인
- **의존성**: TASK-064

### TASK-066: 모니터링 및 로깅 설정
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: Sentry, Google Analytics 연동
- **상세**:
  - Sentry 프로젝트 생성 (프론트/백엔드 각각)
  - 에러 추적 설정
  - Google Analytics 설정 (사용자 행동 분석)
- **검증**: 테스트 에러 발생 시 Sentry에 기록 확인
- **의존성**: TASK-065

---

## Phase 11: 테스트 커버리지 향상

### TASK-067: 단위 테스트 커버리지 80% 달성
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 주요 비즈니스 로직 테스트 추가
- **상세**:
  - 서비스 레이어 테스트 추가
  - 유틸리티 함수 테스트
  - coverage 도구로 측정
- **검증**: 커버리지 리포트 80% 이상
- **의존성**: TASK-066

### TASK-068: E2E 테스트 추가 (선택적)
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: Playwright로 주요 사용자 흐름 테스트
- **상세**:
  - Playwright 설치
  - 상담 신청 전체 흐름 테스트
  - 일자리 지원 전체 흐름 테스트
- **검증**: E2E 테스트 모두 통과
- **의존성**: TASK-067

---

## Phase 12: MVP 출시 및 피드백

### TASK-069: 초기 데이터 시딩
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 테스트용 초기 데이터 생성
- **상세**:
  - 전문가 5명 생성 (다양한 전문 분야)
  - 일자리 공고 15건 생성
  - 정부 지원 정보 10건 생성
- **검증**: 앱 접속 시 샘플 데이터 표시
- **의존성**: TASK-068

### TASK-070: 사용자 가이드 문서 작성
- **타입**: STRUCTURAL
- **상태**: TODO
- **설명**: 사용자를 위한 가이드 문서
- **상세**:
  - 회원가입 방법
  - 상담 신청 방법
  - 일자리 지원 방법
  - 정부 지원 조회 방법
  - FAQ 작성
- **검증**: 문서 작성 완료, 앱 내 링크 추가
- **의존성**: TASK-069

### TASK-071: MVP 출시 및 피드백 수집
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 고양시 파일럿 사용자 모집 및 피드백
- **상세**:
  - 외국인 50명 초대
  - 법조회사 1곳 협력
  - 지자체 담당자 1명 교육
  - 1주일간 사용 후 피드백 수집
- **검증**: 피드백 30건 이상 수집
- **의존성**: TASK-070

### TASK-072: 피드백 반영 및 개선
- **타입**: BEHAVIORAL
- **상태**: TODO
- **설명**: 수집한 피드백을 바탕으로 개선
- **상세**:
  - 버그 수정
  - UX 개선
  - 추가 요청 기능 검토
  - 우선순위에 따라 구현
- **검증**: 주요 피드백 80% 이상 반영
- **의존성**: TASK-071

---

## Task 관리 규칙

### Task 시작 전
1. **의존성 확인**: 이전 Task가 DONE 상태인지 확인
2. **테스트 먼저**: BEHAVIORAL Task는 반드시 테스트부터 작성 (RED)
3. **컨텍스트 검토**: 관련 문서 (PRD, TRD, Design System) 다시 읽기

### Task 진행 중
1. **TDD 사이클 준수**: Red → Green → Refactor
2. **작은 단위**: 한 번에 하나의 변경만
3. **자주 테스트**: 매 변경마다 테스트 실행

### Task 완료 시
1. **상태 업데이트**: 이 문서에서 상태를 DONE으로 변경
2. **변경 사항 기록**: 주요 변경 내용 간략히 기록
3. **커밋**: 적절한 커밋 메시지로 커밋
4. **즉시 중지**: 다음 Task로 자동 진행하지 않고 대기

### Task가 막혔을 때
1. **BLOCKED 상태 표시**
2. **이유 기록**: 무엇이 막혔는지 명확히
3. **대체 Task**: 의존성 없는 다른 Task 진행 검토

---

## 진행 상황 추적

### 현재 진행 상황
- **완료된 Task**: 0 / 72
- **진행률**: 0%
- **현재 Phase**: Phase 1 (프로젝트 초기 설정)
- **다음 Task**: TASK-001

### Milestone
- **Milestone 1** (TASK-001 ~ TASK-015): 인증 시스템 완료
- **Milestone 2** (TASK-016 ~ TASK-040): 상담 시스템 완료
- **Milestone 3** (TASK-041 ~ TASK-050): 일자리 시스템 완료
- **Milestone 4** (TASK-051 ~ TASK-057): 정부 지원 시스템 완료
- **Milestone 5** (TASK-058 ~ TASK-072): MVP 출시

---

## 우선순위 및 리스크

### 높은 우선순위 (Critical Path)
- TASK-001 ~ TASK-015: 인증 없이는 다른 기능 사용 불가
- TASK-019 ~ TASK-030: 핵심 기능 (상담 신청)
- TASK-031 ~ TASK-036: 수익 모델 (결제)

### 중간 우선순위
- TASK-041 ~ TASK-050: 일자리 (지자체 협력 필요)
- TASK-051 ~ TASK-057: 정부 지원 (데이터 확보 필요)

### 낮은 우선순위 (Nice to Have)
- TASK-058 ~ TASK-060: 다국어 (MVP 후 추가 가능)
- TASK-068: E2E 테스트 (선택적)

### 리스크 높은 Task
- TASK-032 ~ TASK-036: 토스페이먼츠 연동 (외부 API 의존성)
- TASK-071: 파일럿 사용자 모집 (외부 협력 필요)

---

**이 문서는 살아있는 문서입니다.**
**Task 진행 상황에 따라 지속적으로 업데이트됩니다.**
