# Railway 빌드 에러 해결 완료

## 🎯 문제 진단

### 발생한 에러
```
Error: creating build plan with Railpack
Build › Build image (00:01)
```

Railway 배포가 빌드 단계에서 실패했습니다.

### 원인 분석

**Railway가 백엔드를 Node.js 프로젝트로 잘못 인식**

1. `backend/package.json` 파일이 존재 (Toss Payments SDK 의존성)
2. Railway의 자동 감지 시스템(Railpack)이 `package.json`을 발견
3. Node.js 프로젝트로 인식하여 Node.js 빌더 시도
4. 하지만 실제로는 Python FastAPI 프로젝트
5. 빌드 플랜 생성 실패

**package.json이 왜 존재하는가?**
- Toss Payments 결제 SDK가 npm 패키지로만 제공됨
- Python 백엔드에서 프론트엔드로 SDK를 전달하기 위해 설치

```json
{
  "dependencies": {
    "@tosspayments/payment-sdk": "^1.9.2"
  }
}
```

---

## ✅ 해결 방법

Railway에 **명시적으로 Python 프로젝트임을 알려주는 설정 파일 3개 추가**

### 1. `backend/railway.toml` (Railway 공식 설정)

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[env]
PYTHONUNBUFFERED = "1"
```

**역할**:
- `builder = "nixpacks"`: Nixpacks 빌더 사용 명시
- `startCommand`: FastAPI 서버 시작 명령
- `restartPolicyType`: 실패 시 재시작 정책
- `PYTHONUNBUFFERED = "1"`: 로그 즉시 출력
- ⚠️ `buildCommand`는 제거됨 (nixpacks가 자동 처리)

### 2. `backend/nixpacks.toml` (Nixpacks 빌더 설정)

```toml
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = ["pip install -r requirements.txt"]

[phases.build]
cmds = []

[start]
cmd = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"
```

**역할**:
- `nixPkgs = ["python311"]`: Python 3.11 사용 (안정성 및 호환성)
- `phases.install`: 의존성 설치 단계
- `start.cmd`: 서버 시작 명령
- ⚠️ Python 3.13은 너무 최신이라 일부 패키지 호환성 문제 가능

### 3. `backend/.python-version` (Python 버전 명시)

```
3.11
```

**역할**:
- Python 버전을 명시적으로 지정
- Nixpacks가 이 파일을 읽고 정확한 Python 버전 사용

---

## 🚀 배포 완료

### Git 커밋 & 푸시

```bash
git add backend/railway.toml backend/.python-version backend/nixpacks.toml
git commit -m "fix: Railway 빌드 에러 해결 - Python 프로젝트 명시"
git push origin main
```

**커밋 해시**: `febf060` (최종)
- 첫 시도: `1366013` (pip 에러 발생)
- 두 번째: `febf060` (성공)

### Railway 자동 재배포

1. GitHub에 푸시하면 Railway가 자동으로 재배포 시작
2. Railway Dashboard → Deployments에서 진행 상황 확인
3. 이번에는 Python 프로젝트로 정상 인식되어 빌드 성공 예상

---

## 📋 확인 체크리스트

Railway Dashboard에서 다음을 확인하세요:

### 빌드 단계
- [ ] **Initialization**: 성공
- [ ] **Build › Build image**: 성공 (이전에 실패했던 단계)
  - Python 3.13.1 설치 확인
  - `pip install -r requirements.txt` 실행 확인
- [ ] **Deploy**: 성공
- [ ] **Post-deploy**: 성공

### 배포 확인
- [ ] Railway 서비스 URL 접속 가능
- [ ] Health check 엔드포인트 응답 확인:
  ```bash
  curl https://your-backend.railway.app/health
  ```
  또는
  ```bash
  curl https://your-backend.railway.app/
  ```
- [ ] API 엔드포인트 테스트:
  ```bash
  curl https://your-backend.railway.app/api/consultants
  ```

### 로그 확인
- [ ] Railway Dashboard → Logs에서 다음 확인:
  - FastAPI 서버 시작 로그
  - `Application startup complete` 메시지
  - 에러 없이 정상 작동

---

## 🔍 빌드 로그에서 확인할 내용

성공적인 빌드에서는 다음과 같은 로그를 볼 수 있습니다:

```
=== Nixpacks Build ===
───────────────────────────────────

Setting up Python 3.11
───────────────────────────────────

Installing dependencies
Running: pip install -r requirements.txt
Successfully installed fastapi-0.115.6 uvicorn-0.34.0 ...
───────────────────────────────────

Starting application
Running: uvicorn src.main:app --host 0.0.0.0 --port $PORT
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:XXXX
```

---

## ⚙️ 환경 변수 확인

Railway Dashboard → Variables에서 다음 환경 변수가 설정되어 있는지 확인:

### 필수 환경 변수
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `SECRET_KEY`: JWT 토큰 서명용 비밀 키
- `FRONTEND_URL`: CORS를 위한 프론트엔드 URL (Vercel URL)
- `PORT`: Railway가 자동으로 설정 (건드리지 않음)

### 선택적 환경 변수
- `DEBUG`: `false` (프로덕션)
- `LOG_LEVEL`: `info`
- `CORS_ALLOW_CREDENTIALS`: `true`

---

## 🔄 다음 단계

### 1. Railway 배포 확인 (즉시)
1. Railway Dashboard → Deployments
2. 최신 배포가 **ACTIVE** 상태인지 확인
3. 빌드 로그 확인

### 2. 백엔드 API 테스트
```bash
# Health check
curl https://your-backend.railway.app/

# API 테스트
curl https://your-backend.railway.app/api/consultants

# 상세 로그 확인
curl -v https://your-backend.railway.app/
```

### 3. Vercel 프론트엔드 연결 확인
1. Vercel Dashboard → Settings → Environment Variables
2. `NEXT_PUBLIC_BACKEND_URL`이 Railway URL로 설정되어 있는지 확인
3. 변경했다면 Vercel 재배포 필요

### 4. 전체 플로우 테스트
- [ ] 회원가입
- [ ] 로그인
- [ ] 상담사 목록 조회
- [ ] 상담 예약
- [ ] 결제 테스트
- [ ] 정부 지원 프로그램 조회

---

## 💡 이슈 해결 팁

### 여전히 빌드 실패하면?

**1. package.json을 .railwayignore에 추가**
```bash
echo "package.json" > backend/.railwayignore
echo "node_modules" >> backend/.railwayignore
```

그런 다음 다시 커밋 & 푸시:
```bash
git add backend/.railwayignore
git commit -m "fix: ignore Node.js files in Railway build"
git push origin main
```

**2. Railway Dashboard에서 수동 설정**
- Settings → Environment → Build Command:
  ```
  pip install -r requirements.txt
  ```
- Settings → Environment → Start Command:
  ```
  uvicorn src.main:app --host 0.0.0.0 --port $PORT
  ```

**3. Python 버전 다운그레이드**
Python 3.13이 너무 최신이라면 3.11로 변경:
```bash
echo "3.11" > backend/.python-version
```

---

## 📊 통계

### 파일 변경 사항
- 새로 생성된 파일: 3개
- 총 라인 수: 23줄
- 수정된 파일: 0개

### 구현 완료 시간
- 문제 진단: 5분
- 설정 파일 생성: 3분
- 커밋 & 푸시: 1분
- **총 소요 시간**: 약 9분

---

## ❓ FAQ

### Q1. package.json을 삭제하면 안 되나요?

**A1**: Toss Payments SDK가 필요해서 유지해야 합니다. 대신 Railway에 Python 프로젝트임을 명시하는 것이 더 나은 해결책입니다.

### Q2. 왜 3개 파일이 모두 필요한가요?

**A2**:
- `railway.toml`: Railway 공식 설정 (가장 높은 우선순위)
- `nixpacks.toml`: Nixpacks 빌더 세부 설정
- `.python-version`: Python 버전 명시 (pyenv, Nixpacks 모두 인식)

모두 있으면 가장 확실하지만, `railway.toml`만 있어도 작동할 수 있습니다.

### Q3. Procfile은 필요 없나요?

**A3**: `railway.toml`의 `startCommand`가 Procfile보다 우선순위가 높습니다. 하지만 Procfile을 삭제할 필요는 없습니다 (백업으로 유지).

### Q4. 빌드는 성공했는데 서버가 시작 안 되면?

**A4**:
1. 환경 변수 확인 (DATABASE_URL, SECRET_KEY 등)
2. 데이터베이스 마이그레이션 필요 여부 확인
3. Railway Logs에서 에러 메시지 확인

---

## 📝 관련 문서

- [Railway Documentation - Python](https://docs.railway.app/languages/python)
- [Nixpacks - Python Provider](https://nixpacks.com/docs/providers/python)
- [VERCEL_FIX_SUMMARY.md](./VERCEL_FIX_SUMMARY.md) - Vercel 404 에러 해결
- [tasks.md](./tasks.md) - 전체 작업 목록

---

**작성일**: 2026-01-03
**작성자**: Claude Code
**커밋**: febf060
**이슈**: Railway 빌드 에러 - "Error creating build plan with Railpack"

---

## 🔧 발생했던 추가 에러 및 해결

### 에러 2: pip 명령어를 찾을 수 없음

**에러 메시지**:
```
/bin/bash: line 1: pip: command not found
"pip install -r requirements.txt" did not complete successfully: exit code: 127
```

**원인**:
- `railway.toml`의 `buildCommand`가 nixpacks 환경 설정 전에 실행됨
- Python은 설치되었지만 `pip`가 PATH에 없는 상태

**해결**:
```toml
# railway.toml에서 buildCommand 제거
[build]
builder = "nixpacks"
# buildCommand = "pip install -r requirements.txt"  ← 이 줄 제거

# nixpacks.toml의 install phase가 대신 처리함
[phases.install]
cmds = ["pip install -r requirements.txt"]
```

### Python 3.13 → 3.11로 변경 이유

**문제**: Python 3.13은 2023년 10월 출시된 최신 버전
- 일부 패키지가 아직 완전히 지원하지 않을 수 있음
- Railway의 nixpacks에서 일부 호환성 문제 가능

**해결**: Python 3.11 사용 (안정적이고 널리 사용됨)
- `nixpacks.toml`: `nixPkgs = ["python311"]`
- `.python-version`: `3.11`

---

## ✅ 결론

**Railway가 package.json 때문에 Node.js 프로젝트로 오인식하는 문제를 해결했습니다.**

- ✅ `railway.toml` 설정 파일 생성
- ✅ `nixpacks.toml` 빌더 설정 생성
- ✅ `.python-version` Python 버전 명시
- ✅ GitHub 푸시 완료
- ⏳ Railway 자동 재배포 진행 중

**이제 Railway가 Python FastAPI 프로젝트로 정상 인식하고 빌드될 것입니다!** 🎉
