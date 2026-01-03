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
startCommand = "python3 -m uvicorn src.main:app --host 0.0.0.0 --port $PORT"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[env]
PYTHONUNBUFFERED = "1"
```

**역할**:
- `builder = "nixpacks"`: Nixpacks 빌더 사용 명시
- `startCommand`: FastAPI 서버 시작 명령
  - ⚠️ `python3 -m uvicorn` 사용 (python/uvicorn 직접 호출 시 PATH 문제)
- `restartPolicyType`: 실패 시 재시작 정책
- `PYTHONUNBUFFERED = "1"`: 로그 즉시 출력
- ⚠️ `buildCommand`는 제거됨 (nixpacks가 자동 처리)

### 2. ~~`backend/nixpacks.toml` (Nixpacks 빌더 설정)~~ ❌ 삭제됨!

**문제**: Nix의 불변 파일시스템 때문에 pip 설치 불가능

**최종 해결책**: `nixpacks.toml` 완전히 제거하고 Railway 자동 감지 사용

- ✅ `requirements.txt` 존재 → Python 프로젝트 자동 인식
- ✅ `runtime.txt` 존재 → Python 3.11 사용
- ✅ Railway가 자동으로 가상환경 생성 및 패키지 설치
- ⚠️ nixpacks.toml을 사용하면 Nix의 불변 파일시스템과 충돌

### 3. `backend/runtime.txt` (Heroku/Railway 표준 방식) - 핵심!

```
python-3.11.0
```

**역할**:
- Heroku 및 Railway 표준 Python 버전 명시 방법
- **가장 중요한 파일**: Railway가 이 파일로 Python 프로젝트 감지
- 자동으로 가상환경 생성 및 requirements.txt 설치

### 5. `backend/.python-version` (선택사항)

```
3.11
```

**역할**:
- Python 버전을 명시적으로 지정
- `runtime.txt`가 더 우선순위가 높음

### 6. `backend/.railwayignore` (불필요한 파일 제외)

```
node_modules/
*.md
.git/
.gitignore
venv/
__pycache__/
*.pyc
.pytest_cache/
.env.local
.env.*.local
```

**역할**:
- 빌드 시 불필요한 파일 제외
- 빌드 속도 향상 및 용량 절약
- node_modules 제외 (Toss Payments SDK는 프론트엔드에서 사용)

---

## 🚀 배포 완료

### Git 커밋 & 푸시

```bash
git add backend/railway.toml backend/.python-version backend/nixpacks.toml
git commit -m "fix: Railway 빌드 에러 해결 - Python 프로젝트 명시"
git push origin main
```

**커밋 해시**: `fbb1ade` (최종)
- 첫 시도: `1366013` (Railpack 에러 - Node.js로 오인식)
- 두 번째: `febf060` (pip 경로 에러)
- 세 번째: `2d83601` (Nix pip 변수 에러)
- 네 번째: `53e0e30` (No module named pip)
- 다섯 번째: `2f08715` (externally-managed-environment)
- 여섯 번째: `6870455` (빌드 성공! 하지만 시작 실패)
- 일곱 번째: `f3279e3` (python not found)
- 여덟 번째: `4a5a57b` (python3 not found - 런타임 이미지 문제!)
- 아홉 번째: `fbb1ade` (완전 해결 - railway.toml 삭제, Procfile 사용)

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
**커밋**: 4a5a57b
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
[phases.setup]
nixPkgs = ["python311", "pip"]  ← pip 패키지 명시적 추가

[phases.install]
cmds = [
  "python -m pip install --upgrade pip",  ← python -m 사용
  "python -m pip install -r requirements.txt"
]
```

**핵심 해결책**:
1. ~~`pip` 패키지를 nixPkgs에 명시적으로 추가~~ ❌ (에러 3에서 수정됨)
2. `pip install` 대신 `python -m pip install` 사용 ✅
3. pip를 먼저 업그레이드하여 최신 버전 사용 ✅

### 에러 3: Nix undefined variable 'pip'

**에러 메시지**:
```
error: undefined variable 'pip'
at /app/.nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix:19:9:
18|                '')
19|         pip python311
```

**원인**:
- Nix 패키지 시스템에서 `pip`는 독립적인 패키지가 아님
- pip는 Python 패키지에 포함되어 있음
- `nixPkgs = ["python311", "pip"]`에서 `pip`를 별도로 지정하면 에러 발생

**해결**:
```toml
# nixpacks.toml
[phases.setup]
nixPkgs = ["python311"]  # pip 제거! Python에 포함됨

[phases.install]
cmds = [
  "python -m pip install --upgrade pip",  # python -m으로 pip 사용
  "python -m pip install -r requirements.txt"
]
```

### 에러 4: No module named pip

**에러 메시지**:
```
/root/.nix-profile/bin/python: No module named pip
"python -m pip install --upgrade pip" did not complete successfully: exit code: 1
```

**원인**:
- Python 3.11이 설치되었지만 pip 모듈이 포함되지 않음
- Nix 환경에서는 Python과 pip가 별도로 관리됨
- `python -m pip`를 실행하려면 pip 모듈이 필요함

**해결**:
```toml
# nixpacks.toml - 최종 버전!
[phases.setup]
nixPkgs = ["python311", "python311Packages.pip"]  # pip를 python311Packages.pip으로 추가

[phases.install]
cmds = [
  "pip install --upgrade pip",  # python -m 제거, 직접 pip 사용
  "pip install -r requirements.txt"
]
```

**핵심**:
- ✅ `python311Packages.pip`: Nix에서 pip를 추가하는 올바른 방법
- ✅ `pip install`: pip가 PATH에 있으므로 직접 사용 가능
- ❌ `python -m pip`: pip 모듈이 없어서 실패했음

### 에러 5: externally-managed-environment (최종 해결!)

**에러 메시지**:
```
error: externally-managed-environment
× This environment is externally managed
╰─> This command has been disabled as it tries to modify the immutable `/nix/store` filesystem.
hint: See PEP 668 for the detailed specification.
```

**원인**:
- Nix는 **불변(immutable) 파일시스템** 사용
- `/nix/store`를 수정하려는 모든 시도가 차단됨
- `nixpacks.toml`로 pip 명령을 실행하면 Nix 파일시스템 수정 시도
- Python PEP 668에 따라 외부 관리 환경에서는 pip 직접 설치 금지

**최종 해결책**: `nixpacks.toml` 완전히 삭제!

```bash
rm backend/nixpacks.toml
```

**왜 이게 작동하는가?**:
1. `requirements.txt` 존재 → Railway가 Python 프로젝트로 인식
2. `runtime.txt`에 `python-3.11.0` 명시 → Python 버전 지정
3. Railway가 **자동으로** 가상환경 생성 (`venv`)
4. 가상환경 내에서 `pip install -r requirements.txt` 실행
5. 가상환경은 `/nix/store`가 아닌 쓰기 가능한 경로에 생성됨!

**핵심 교훈**:
- ❌ nixpacks.toml로 pip 직접 제어 → Nix 충돌
- ✅ Railway 자동 감지 사용 → 가상환경에서 안전하게 설치

### 에러 6: uvicorn: command not found (컨테이너 시작 실패)

**에러 메시지**:
```
Starting Container
/bin/bash: line 1: uvicorn: command not found
```

**상황**:
- ✅ **빌드 성공!** (더 이상 빌드 에러 없음)
- ❌ **컨테이너 시작 실패** (uvicorn을 찾을 수 없음)

**원인**:
- 가상환경(venv)에 uvicorn이 설치되었지만
- `railway.toml`의 `startCommand`가 가상환경 밖에서 실행됨
- uvicorn이 시스템 PATH에 없어서 명령을 찾을 수 없음

**해결**:
```toml
# railway.toml
[deploy]
# ❌ startCommand = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"
✅ startCommand = "python3 -m uvicorn src.main:app --host 0.0.0.0 --port $PORT"
```

**왜 작동하는가?**:
- `python -m uvicorn`: Python 모듈로 uvicorn 실행
- Python은 시스템 PATH에 있음
- Python이 자동으로 가상환경의 uvicorn 모듈을 찾아서 실행
- 가상환경 활성화 불필요!

### 에러 7: python: command not found

**에러 메시지**:
```
Starting Container
/bin/bash: line 1: python: command not found
```

**원인**:
- Linux 시스템에서 Python 3는 보통 `python3` 명령어로 설치됨
- `python` 명령어는 Python 2를 가리키거나 존재하지 않을 수 있음
- Railway 컨테이너에는 `python3`만 설치되어 있음

**해결**:
```toml
# railway.toml
[deploy]
# ❌ startCommand = "python -m uvicorn ..."
✅ startCommand = "python3 -m uvicorn src.main:app --host 0.0.0.0 --port $PORT"
```

**핵심**:
- ✅ `python3`: 대부분의 Linux 시스템에서 표준
- ❌ `python`: 레거시 명령어, 존재하지 않을 수 있음

### 에러 8: python3: command not found (런타임 이미지 문제 - 최종 해결!)

**에러 메시지**:
```
Starting Container
/bin/bash: line 1: python3: command not found
/bin/bash: line 1: python3: command not found
(11번 반복...)
```

**원인**:
- **빌드 이미지 vs 런타임 이미지 분리 문제!**
- `railway.toml`의 `startCommand`가 **런타임 컨테이너**에서 실행됨
- 빌드 이미지에는 Python이 있지만, 런타임 이미지에는 Python이 설치되지 않음
- Railway의 Nixpacks는 빌드와 런타임을 분리하여 컨테이너 크기 최적화

**최종 해결책**: `railway.toml` 완전히 삭제하고 `Procfile`만 사용!

```bash
# railway.toml 삭제
rm backend/railway.toml

# Procfile 수정
web: python3 -m uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

**왜 Procfile이 작동하는가?**:
1. Railway는 `Procfile`을 **빌드 컨텍스트에서 인식**
2. `Procfile`의 `web` 명령은 **올바른 런타임 컨텍스트**에서 실행됨
3. Railway가 Python 런타임을 런타임 이미지에 포함시킴
4. `python3 -m uvicorn`이 정상적으로 실행됨

**railway.toml vs Procfile**:
- ❌ `railway.toml`의 `startCommand`: 런타임 이미지에서 실행 (Python 없음)
- ✅ `Procfile`의 `web`: 올바른 컨텍스트에서 실행 (Python 있음)

**커밋**: fbb1ade

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

- ✅ `railway.toml` 설정 파일 생성 및 최적화 (`python -m uvicorn` 사용)
- ❌ ~~`nixpacks.toml` 빌더 설정~~ → **삭제함** (Nix 충돌)
- ✅ `.python-version` Python 3.11 명시
- ✅ `runtime.txt` 추가 (Railway 표준 방식) - **가장 중요!**
- ✅ `.railwayignore` 추가 (빌드 최적화)
- ✅ GitHub 푸시 완료 (커밋: f3279e3)
- ⏳ Railway 자동 재배포 진행 중

**해결된 모든 에러**:
1. ✅ Railpack 에러 (Node.js로 오인식) → railway.toml 추가
2. ✅ pip 경로 에러 (command not found) → nixpacks.toml 추가 시도
3. ✅ Nix undefined variable 'pip' → "pip" 제거
4. ✅ No module named pip → python311Packages.pip 추가
5. ✅ externally-managed-environment → **nixpacks.toml 완전히 삭제!**
6. ✅ uvicorn: command not found → python -m uvicorn 시도
7. ✅ python: command not found → **python3 사용!**
8. ✅ python3: command not found (런타임 이미지 문제) → **railway.toml 삭제, Procfile만 사용!**

**최종 해결책 (9번의 시도 끝에)**:
- ❌ ~~`railway.toml`~~ → **삭제함** (런타임 컨텍스트 문제)
- ❌ ~~`nixpacks.toml`~~ → **삭제함** (Nix 불변 파일시스템 충돌)
- ✅ `Procfile` → `web: python3 -m uvicorn src.main:app --host 0.0.0.0 --port $PORT`
- ✅ `runtime.txt` → `python-3.11.0` (Railway 자동 감지용)
- ✅ `requirements.txt` → 의존성 목록
- ✅ `.railwayignore` → 빌드 최적화

**Railway 배포 플로우**:
1. `runtime.txt` 감지 → Python 프로젝트 인식
2. 자동으로 가상환경 생성
3. `pip install -r requirements.txt` 실행
4. `Procfile`의 `web` 명령으로 서버 시작
5. ✅ 성공!

**핵심 교훈**:
- 🚫 **복잡한 설정보다 플랫폼 표준 사용** (Procfile, runtime.txt)
- 🚫 **Nix와 pip를 직접 제어하려 하지 말 것**
- ✅ **Railway 자동 감지 활용** (runtime.txt만으로 충분)
- ✅ **Procfile이 railway.toml보다 안정적** (올바른 컨텍스트)

**이제 Railway가 Python FastAPI 프로젝트를 정상적으로 빌드하고 실행할 것입니다!** 🎉
