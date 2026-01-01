# Supabase 연결 가이드

이 문서는 easyK 프로젝트를 Supabase PostgreSQL 데이터베이스에 연결하는 방법을 설명합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정 생성/로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Project Name**: `easyk` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (반드시 기록해두세요!)
   - **Region**: 가장 가까운 리전 선택 (예: Northeast Asia (Seoul))
4. 프로젝트 생성 완료까지 2-3분 대기

## 2. 데이터베이스 연결 정보 확인

프로젝트 생성 후, 다음 정보를 확인합니다:

1. Supabase 대시보드에서 **Settings** → **Database** 이동
2. **Connection string** 섹션에서 다음 정보 확인:
   - **Connection string** (URI 형식)
   - 또는 개별 정보:
     - **Host**: `db.xxxxx.supabase.co`
     - **Database name**: `postgres`
     - **Port**: `5432`
     - **User**: `postgres`
     - **Password**: 프로젝트 생성 시 설정한 비밀번호

## 3. DATABASE_URL 형식

Supabase의 Connection string은 다음과 같은 형식입니다:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

또는 SSL 연결을 사용하는 경우:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

## 4. .env 파일 설정

`backend/` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require

# Supabase (선택사항 - 향후 Supabase 클라이언트 사용 시)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000

# SMTP (선택사항)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Payment (선택사항)
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
```

**중요**: 
- `[YOUR-PASSWORD]`를 실제 데이터베이스 비밀번호로 교체하세요
- `xxxxx`를 실제 Supabase 프로젝트 ID로 교체하세요
- `.env` 파일은 절대 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)

## 5. 연결 테스트

### 방법 1: Python 스크립트로 테스트

```bash
cd backend
python -c "from src.database import engine; from sqlalchemy import text; conn = engine.connect(); print('연결 성공!'); conn.close()"
```

### 방법 2: FastAPI 서버 실행

```bash
cd backend
.\venv\Scripts\uvicorn.exe src.main:app --reload
```

서버가 정상적으로 시작되면 연결이 성공한 것입니다.

## 6. 데이터베이스 마이그레이션 적용

Supabase에 테이블을 생성하기 위해 Alembic 마이그레이션을 적용합니다:

```bash
cd backend

# 현재 마이그레이션 상태 확인
.\venv\Scripts\alembic.exe current

# 모든 마이그레이션 적용
.\venv\Scripts\alembic.exe upgrade head

# 특정 마이그레이션까지 적용
.\venv\Scripts\alembic.exe upgrade <revision_id>
```

### 마이그레이션 순서

1. `352b2bc8f04d` - users 테이블 생성
2. `a716a520a00a` - consultants 테이블 생성

## 7. Supabase 대시보드에서 확인

1. Supabase 대시보드에서 **Table Editor** 이동
2. 다음 테이블들이 생성되었는지 확인:
   - `users`
   - `consultants`

## 8. 문제 해결

### 연결 오류가 발생하는 경우

1. **비밀번호 확인**: DATABASE_URL의 비밀번호가 정확한지 확인
2. **SSL 모드**: `?sslmode=require` 추가 시도
3. **방화벽**: Supabase 대시보드에서 IP 주소 허용 확인 (Settings → Database → Connection pooling)

### 마이그레이션 오류가 발생하는 경우

1. **이미 테이블이 존재하는 경우**: 
   ```bash
   # 마이그레이션 히스토리 확인
   .\venv\Scripts\alembic.exe history
   
   # 특정 리비전으로 다운그레이드 후 재적용
   .\venv\Scripts\alembic.exe downgrade <revision_id>
   .\venv\Scripts\alembic.exe upgrade head
   ```

2. **마이그레이션 파일 수정이 필요한 경우**: 
   - `backend/alembic/versions/` 폴더의 마이그레이션 파일 직접 수정 가능
   - 수정 후 `alembic upgrade head` 재실행

## 9. 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [PostgreSQL 연결 문자열 형식](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Alembic 마이그레이션 가이드](https://alembic.sqlalchemy.org/en/latest/tutorial.html)

---

**다음 단계**: 마이그레이션 적용 후 TASK-020 (Consultations 테이블 생성)을 진행하세요.


