# Railway 환경 변수 설정 가이드

## 🚨 현재 에러 원인

```
pydantic_core._pydantic_core.ValidationError: 2 validation errors for Settings
DATABASE_URL
  Field required [type=missing, input_value={}, input_type=dict]
SECRET_KEY
  Field required [type=missing, input_value={}, input_type=dict]
```

**원인**: Railway에 환경 변수가 설정되지 않아서 FastAPI 서버 시작 실패

**해결**: Railway Variables에 필수 환경 변수 추가

---

## ⚡ 빠른 설정 방법 (RAW Editor 사용)

### 1단계: Railway Dashboard 이동

1. Railway Dashboard 열기
2. 프로젝트 선택 (easyk)
3. 상단 메뉴에서 **"Settings"** 클릭
4. 좌측 메뉴에서 **"Variables"** 선택

### 2단계: RAW Editor로 한 번에 추가

1. **"RAW Editor"** 버튼 클릭 (Variables 페이지 우측 상단)
2. 아래 내용을 **전체 복사하여 붙여넣기**:

```env
DATABASE_URL=postgresql://postgres.rrcjacymjsvgzjfhghzl:Choiwjun1!!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres
SECRET_KEY=sb_secret_0pDju12M46mwq_HE54dobQ_qhuEfSHE
SUPABASE_URL=https://rrcjacymjsvgzjfhghzl.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2phY3ltanN2Z3pqZmhnaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNzg0OTAsImV4cCI6MjA4Mjc1NDQ5MH0.HmdF-L9tY-10QBT-hedo-0wCK2OKt5oSGVjyUkQKsSA
DEBUG=False
ALLOWED_ORIGINS=https://easyk.vercel.app,http://localhost:3000
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

3. **"Update Variables"** 또는 **"Save"** 버튼 클릭

### 3단계: 자동 재배포 대기

- Railway가 환경 변수 변경을 감지하고 **자동으로 재배포** 시작
- **Deployments** 탭으로 이동하여 진행 상황 확인

---

## 📋 개별 추가 방법 (New Variable 사용)

RAW Editor가 없다면 개별적으로 추가:

### 필수 변수 (반드시 추가)

| Variable Name | Value |
|--------------|-------|
| `DATABASE_URL` | `postgresql://postgres.rrcjacymjsvgzjfhghzl:Choiwjun1!!@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres` |
| `SECRET_KEY` | `sb_secret_0pDju12M46mwq_HE54dobQ_qhuEfSHE` |

### 권장 변수

| Variable Name | Value |
|--------------|-------|
| `SUPABASE_URL` | `https://rrcjacymjsvgzjfhghzl.supabase.co` |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyY2phY3ltanN2Z3pqZmhnaHpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNzg0OTAsImV4cCI6MjA4Mjc1NDQ5MH0.HmdF-L9tY-10QBT-hedo-0wCK2OKt5oSGVjyUkQKsSA` |
| `DEBUG` | `False` |
| `ALLOWED_ORIGINS` | `https://easyk.vercel.app,http://localhost:3000` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |

---

## ✅ 설정 완료 확인

### 성공 시 로그:

```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:XXXX (Press CTRL+C to quit)
```

### 실패 시 로그:

```
pydantic_core._pydantic_core.ValidationError: 2 validation errors for Settings
DATABASE_URL
  Field required [type=missing, input_value={}, input_type=dict]
SECRET_KEY
  Field required [type=missing, input_value={}, input_type=dict]
```

→ 환경 변수가 제대로 설정되지 않았음. Variables 페이지에서 다시 확인.

---

## 🔍 Railway Variables 설정 화면 찾기

### 방법 1: Settings → Variables
1. Railway Dashboard 상단 메뉴: **Architecture** | Observability | Logs | **Settings**
2. **Settings** 클릭
3. 좌측 메뉴에서 **Variables** 선택

### 방법 2: 직접 URL 접근
- `https://railway.app/project/[YOUR_PROJECT_ID]/service/[YOUR_SERVICE_ID]/variables`

---

## 🎯 다음 단계 (환경 변수 설정 후)

### 1. Railway 배포 성공 확인
- Deployments 탭 → 최신 배포 상태 **"ACTIVE"** 확인
- Logs 탭 → "Application startup complete" 메시지 확인

### 2. Railway 서비스 URL 확인
- Settings → Domains 또는 Overview 페이지
- 예: `https://easyk-production.up.railway.app`

### 3. Vercel 환경 변수 업데이트
- Vercel Dashboard → easyk 프로젝트 → Settings → Environment Variables
- `NEXT_PUBLIC_BACKEND_URL` 값을 Railway URL로 변경
- Vercel 재배포

### 4. API 테스트
```bash
# Health check
curl https://your-railway-url.up.railway.app/

# API 테스트
curl https://your-railway-url.up.railway.app/api/consultants
```

---

## 📝 환경 변수 설명

| 변수 | 설명 | 필수 여부 |
|-----|------|----------|
| `DATABASE_URL` | Supabase PostgreSQL 연결 문자열 | ✅ 필수 |
| `SECRET_KEY` | JWT 토큰 서명용 시크릿 키 | ✅ 필수 |
| `SUPABASE_URL` | Supabase 프로젝트 URL | ⚠️ 권장 |
| `SUPABASE_KEY` | Supabase anon public key | ⚠️ 권장 |
| `DEBUG` | 디버그 모드 (프로덕션: False) | ⚠️ 권장 |
| `ALLOWED_ORIGINS` | CORS 허용 도메인 (쉼표 구분) | ⚠️ 권장 |
| `ALGORITHM` | JWT 알고리즘 (기본: HS256) | ❌ 선택 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 토큰 만료 시간 (기본: 30분) | ❌ 선택 |

---

## 🚨 문제 해결

### "Variables" 메뉴가 안 보이는 경우
1. Railway 프로젝트가 제대로 선택되었는지 확인
2. Settings 탭에서 좌측 사이드바 확인
3. 브라우저 캐시 삭제 후 재접속

### 환경 변수 추가했는데도 에러가 계속 나는 경우
1. Variables 페이지에서 변수 이름 철자 확인 (`DATABASE_URL`, `SECRET_KEY`)
2. 값에 공백이나 따옴표가 들어가지 않았는지 확인
3. "Update Variables" 또는 "Save" 버튼을 눌렀는지 확인
4. Deployments 탭에서 재배포가 진행되었는지 확인

### 재배포가 자동으로 안 되는 경우
1. Deployments 탭으로 이동
2. 우측 상단 **"Deploy"** 버튼 클릭하여 수동 재배포

---

**작성일**: 2026-01-03
**관련 문서**: [RAILWAY_BUILD_FIX.md](./RAILWAY_BUILD_FIX.md)
**상태**: 환경 변수 설정 대기 중
