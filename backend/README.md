# easyK Backend API

한국에서 입국한 외국인들의 정착을 돕는 플랫폼의 백엔드 API입니다.

## 📋 목차

- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [API 문서](#api-문서)
- [환경 설정](#환경-설정)
- [테스트](#테스트)

## 기술 스택

- **Python**: 3.11+
- **FastAPI**: 0.115.6
- **PostgreSQL**: Supabase / Railway
- **SQLAlchemy**: 2.0.36
- **Pydantic**: 2.10.5
- **PyJWT**: 3.3.0
- **Passlib**: 1.7.4

## 시작하기

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/easyk

# Supabase (Alternative to local PostgreSQL)
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_DB_URL=

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# SMTP
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Application
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000

# Payment
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
```

**⚠️ 중요**: `.env` 파일을 절대로 커밋에 올리지 마세요!

### 3. 데이터베이스 마이그레이션 실행

```bash
cd backend
alembic upgrade head
```

### 3-1. 초기 데이터 시딩 (선택적)

개발/테스트용 샘플 데이터를 생성하려면:

```bash
cd backend
python seed_data.py
```

이 스크립트는 다음 데이터를 생성합니다:
- 전문가 5명 (다양한 전문 분야)
- 일자리 공고 15건
- 정부 지원 정보 10건

⚠️ **주의**: 이미 데이터가 있는 경우 스크립트가 자동으로 건너뜁니다.

### 4. 개발 서버 실행

```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

서버가 `http://localhost:8000`에서 실행됩니다.

## API 문서

API 문서는 Swagger UI를 통해 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8000/docs
- **OpenAPI JSON**: http://localhost:8000/openapi.json
- **ReDoc**: http://localhost:8000/redoc

### 주요 엔드포인트

#### 인증 (Authentication)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|---------|
| `/api/auth/signup` | POST | 회원가입 |
| `/api/auth/login` | POST | 로그인 |
| `/api/users/me` | GET | 프로필 조회 |
| `/api/users/me` | PUT | 프로필 업데이트 |

#### 상담 (Consultations)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|---------|
| `/api/consultations` | POST | 상담 신청 |
| `/api/consultations` | GET | 상담 목록 조회 |
| `/api/consultations/{id}` | GET | 상담 상세 조회 |
| `/api/consultations/{id}` | PUT | 상담 수정 (전문가) |
| `/api/consultations/incoming` | GET | 진입 상담 목록 (전문가) |
| `/api/consultations/{id}/accept` | POST | 상담 수락 (전문가) |
| `/api/consultations/{id}/reject` | POST | 상담 거절 (전문가) |

#### 전문가 (Consultants)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|---------|
| `/api/consultants` | POST | 전문가 등록 |

#### 일자리 (Jobs)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|---------|
| `/api/jobs` | GET | 일자리 목록 |
| `/api/jobs/{id}` | GET | 일자리 상세 |
| `/api/jobs/{id}/apply` | POST | 일자리 지원 |
| `/api/jobs/{id}/applications` | GET | 지원 내역 조회 |
| `/api/jobs` | POST | 일자리 생성 (관리자) |
| `/api/jobs/{id}` | PUT | 일자리 수정 (관리자) |
| `/api/jobs/{id}` | DELETE | 일자리 삭제 (관리자) |

#### 결제 (Payments)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|---------|
| `/api/payments` | POST | 결제 생성 |
| `/api/payments/callback` | POST | 결제 완료 콜백 |
| `/api/payments/{id}` | GET | 결제 상세 |

#### 후기 (Reviews)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|---------|
| `/api/reviews` | POST | 후기 작성 |
| `/api/consultants/{id}/reviews` | GET | 전문가 후기 조회 |

#### 정부 지원 (Government Supports)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|---------|
| `/api/supports` | GET | 지원 프로그램 목록 |
| `/api/supports/{id}` | GET | 지원 상세 |
| `/api/supports` | POST | 지원 생성 (관리자) |
| `/api/supports/{id}` | PUT | 지원 수정 (관리자) |
| `/api/supports/{id}` | DELETE | 지원 삭제 (관리자) |

#### 지원 키워드 (Support Keywords)

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|---------|
| `/api/support-keywords` | GET | 키워드 목록 (관리자) |
| `/api/support-keywords` | POST | 키워드 생성 (관리자) |

## 환경 설정

### 로컬 개발 환경

- **DEBUG**: `True` - 디버그 모드 활성화
- **DATABASE_URL**: PostgreSQL 데이터베이스 연결 문자열
- **SECRET_KEY**: JWT 토큰 서명 키
- **ALLOWED_ORIGINS**: CORS 허용 오리진 목록

### 프로덕션 환경

- **DEBUG**: `False` - 디버그 모드 비활성화
- **DATABASE_URL**: 프로덕션 데이터베이스 URL (Railway, Supabase 등)
- **SECRET_KEY**: 안전한 랜덤 시크릿 키 (환경 변수에서 가져오지 않음!)
- **ALLOWED_ORIGINS**: 프론트엔드 배포 URL 목록

## 테스트

테스트를 실행하려면:

```bash
cd backend
pytest src/tests/ -v
```

### 테스트 커버리지

- 인증 테스트 (`test_auth.py`)
- 로그인 테스트 (`test_login.py`)
- 상담 테스트 (`test_consultations.py`)
- 일자리 테스트 (`test_jobs.py`)
- 결제 테스트 (`test_payments.py`)
- 후기 테스트 (`test_reviews.py`)
- 정부 지원 테스트 (`test_supports.py`)
- 보안 테스트 (`test_security.py`)
- 다국어 테스트 (`test_i18n.py`)

### 테스트 실행 옵션

```bash
# 모든 테스트 실행
pytest src/tests/ -v

# 특정 테스트 파일만 실행
pytest src/tests/test_auth.py -v

# 코드 커버리지 확인
pytest src/tests/ --cov=src --cov-report=html
```

## 데이터베이스 스키마

데이터베이스는 다음 8개 테이블로 구성되어 있습니다:

1. **users** - 사용자 정보
2. **consultants** - 전문가 정보
3. **consultations** - 상담 신청
4. **jobs** - 일자리 공고
5. **job_applications** - 일자리 지원
6. **reviews** - 상담 후기
7. **government_supports** - 정부 지원 정보
8. **support_keywords** - 지원 검색 키워드

## 에러 응답 형식

에러 응답은 다음 형식을 따릅니다:

```json
{
  "detail": "에러 메시지"
}
```

### 다국어 지원

`Accept-Language` 헤더를 통해 다국어 에러 메시지를 반환합니다:

```bash
# 한국어
curl -H "Accept-Language: ko" http://localhost:8000/api/auth/login

# 영어
curl -H "Accept-Language: en" http://localhost:8000/api/auth/login
```

## 성능 최적화

### 인덱싱 전략

자주 조회되는 컬럼에 인덱스를 추가하여 쿼리 성능을 향상했습니다:

- `users.email` (고유 인덱스)
- `users.role` (조회 인덱스)
- `consultations.status` (조회 인덱스)
- `consultations.consultation_type` (조회 인덱스)
- `jobs.status` (조회 인덱스)
- `government_supports.category` (조회 인덱스)

### N+1 쿼리 문제 해결

SQLAlchemy의 `joinedload()` 전략을 사용하여 불필요한 N+1 쿼리를 방지합니다.

## 배포

### Vercel (프론트엔드)

프론트엔드는 Vercel에 자동으로 배포됩니다.

### Railway (백엔드)

백엔드는 Railway에 배포됩니다.

배포 설정:

1. Railway 프로젝트 생성
2. GitHub 저장소 연결
3. `.railway.example` 파일 복사하여 `.env` 생성
4. 자동 배포

자세한 내용은 [Railway 배포 가이드](.railway.example)를 참고하세요.

## 라이선스

이 프로젝트는 오픈 소스입니다.

---

**개발팀**: easyK Team  
**버전**: 1.0.0  
**최종 업데이트**: 2026-01-02


