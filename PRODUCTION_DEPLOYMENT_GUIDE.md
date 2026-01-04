# 🚀 easyK 프로덕션 배포 가이드

이 가이드는 easyK 프로덕션 배포를 위한 필수 설정 사항을 안내합니다.

---

## 📋 배포 체크리스트

### ✅ 필수 설정 (배포 전 완료)

- [ ] **프론트엔드 환경 변수 설정** (`frontend/.env.local`)
- [ ] **백엔드 환경 변수 설정** (`backend/.env`)
- [ ] **Supabase 데이터베이스 생성**
- [ ] **Toss Payments 계정 설정**
- [ ] **CORS origins 설정**

---

## 🌐 프론트엔드 배포 (Vercel)

### 1. 환경 변수 설정

`frontend/.env.local` 파일 생성:

```env
# 필수: 백엔드 API URL
# Railway 배포된 백엔드 URL 입력
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app

# 선택: Toss Payments 클라이언트 키
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_gck_docs_Ovk5rk1EWOEbGQ2azNtX92tL1fK0v0Z0L0
```

### 2. Vercel 배포

```bash
cd frontend
vercel
```

Vercel 대시보드에서 환경 변수 설정:
1. 프로젝트 → **Settings** → **Environment Variables**
2. `NEXT_PUBLIC_BACKEND_URL` 추가 (Railway 백엔드 URL)
3. `NEXT_PUBLIC_TOSS_CLIENT_KEY` 추가 (선택)

### 3. 배포 확인

- [ ] Vercel 대시보드에서 배포 성공 확인
- [ ] 배포된 URL 접속하여 랜딩 페이지 확인

---

## 🐍 백엔드 배포 (Railway)

### 1. 환경 변수 설정

`backend/.env` 파일 생성:

```env
# 데이터베이스 (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_KEY=your-supabase-anon-key

# JWT 시크릿 키 (강력한 랜덤 값)
SECRET_KEY=your-strong-secret-key-here

# CORS 설정 (프론트엔드 URL)
ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app

# Toss Payments
TOSS_CLIENT_KEY=test_gck_docs_Ovk5rk1EWOEbGQ2azNtX92tL1fK0v0Z0L
TOSS_SECRET_KEY=test_sk_zOaXBwz7gRZm3JQkL7L8z9kz9kz
TOSS_WEBHOOK_SECRET=your-webhook-secret-here

# SMTP (선택)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# 애플리케이션
DEBUG=False
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 2. Railway 배포

1. [Railway](https://railway.app) 접속
2. **New Project** → **Deploy from GitHub repo**
3. `easyk` 레포지토리 선택
4. **backend** 디렉토리를 루트로 설정:
   ```
   Root Directory: backend
   ```
5. **Environment Variables** 탭에서 위 환경 변수들 추가

### 3. 데이터베이스 마이그레이션 실행

Railway 대시보드에서:
1. **Deployments** → 최신 배포 클릭
2. **Logs** 탭에서 로그 확인
3. 데이터베이스 연결 확인

또는 Railway 터미널에서:
```bash
cd backend
alembic upgrade head
```

### 4. 배포 확인

- [ ] Railway 대시보드에서 배포 성공 확인
- [ ] 백엔드 URL 접속하여 API 확인: `https://your-backend.railway.app/docs`

---

## 🗄️ Supabase 설정

### 1. 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. **New Project** 생성
3. **Database** → **Connection String** 복사

### 2. 데이터베이스 URL 복사

```env
# PostgreSQL Connection String
postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
```

### 3. API Key 복사

**Settings** → **API** → **Project API keys**:
- `anon/public` 키 (프론트엔드)
- `service_role` 키 (백엔드)

---

## 💳 Toss Payments 설정

### 1. 테스트 계정 설정

1. [Toss Developers](https://developers.tosspayments.com) 접속
2. **API 테스트 연동** → **상점 정보 등록**
3. **클라이언트 키** 복사: `test_gck_docs_xxx`
4. **시크릿 키** 복사: `test_sk_zOaXBwz7gRZm3JQkL7L8z9kz9kz`

### 2. 웹훅 설정 (선택)

**상점 정보** → **웹훅**:
- 웹훅 URL: `https://your-backend.railway.app/api/payments/callback`
- 웹훅 시크릿 생성

---

## 🔄 CORS 설정 확인

### 프론트엔드 URL 확인

백엔드 `.env`에 정확한 URL 설정:

```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

### 테스트

```bash
# curl로 CORS 테스트
curl -H "Origin: https://your-vercel-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: content-type" \
     -X OPTIONS \
     https://your-backend.railway.app/api/consultations
```

---

## 🔒 보안 체크리스트

### 필수 보안 설정

- [ ] **SECRET_KEY** 강력한 랜덤 값으로 변경
- [ ] **DEBUG=False** (프로덕션)
- [ ] **TOSS_WEBHOOK_SECRET** 설정
- [ ] **DATABASE_URL** 노출 방지 (GitHub 비공개 레포)

### 권장 보안 설정

- [ ] **httpOnly 쿠키** (localStorage 대신)
- [ ] **IP 화이트리스트** (웹훅)
- [ ] **HTTPS 강제** (프로덕션)

---

## 🧪 배포 후 테스트

### 1. API 테스트

```bash
# 헬스 체크
curl https://your-backend.railway.app/health

# API 문서 확인
https://your-backend.railway.app/docs
```

### 2. 프론트엔드 테스트

1. 랜딩 페이지 접속
2. 회원가입 테스트
3. 로그인 테스트
4. 대시보드 접속

### 3. 기능 테스트

- [ ] 상담 신청
- [ ] 일자리 조회
- [ ] 정부 지원 조회
- [ ] 결제 기능 (선택)

---

## 📊 모니터링

### Vercel
- **Deployments**: 배포 상태 확인
- **Logs**: 에러 로그 확인
- **Analytics**: 트래픽 모니터링

### Railway
- **Deployments**: 배포 상태 확인
- **Logs**: 백엔드 로그 확인
- **Metrics**: 성능 모니터링

### Supabase
- **Database**: DB 상태 확인
- **Logs**: 쿼리 로그 확인

---

## 🐛 트러블슈팅

### CORS 에러

**문제**: `Access-Control-Allow-Origin` 에러
**해결**: `ALLOWED_ORIGINS`에 정확한 프론트엔드 URL 설정

### API 연결 실패

**문제**: `Network Error` 또는 `502 Bad Gateway`
**해결**:
1. 백엔드 배포 상태 확인
2. `NEXT_PUBLIC_BACKEND_URL` 확인
3. 환경 변수 재설정 및 재배포

### 데이터베이스 연결 실패

**문제**: `Could not connect to database`
**해결**:
1. Supabase 프로젝트 활성화 확인
2. `DATABASE_URL` 확인
3. IP 화이트리스트 확인 (Supabase)

### 결제 실패

**문제**: 토스페이먼츠 에러
**해결**:
1. Toss 키 확인
2. 웹훅 URL 확인
3. `TOSS_WEBHOOK_SECRET` 확인

---

## 📞 지원

- **GitHub Issues**: https://github.com/choiwjun/easyk/issues
- **문서**: `/docs` 디렉토리 참고

---

**마지막 업데이트**: 2026-01-03




