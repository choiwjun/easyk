# Vercel 배포 문제 해결 가이드

**에러 코드**: `DEPLOYMENT_NOT_FOUND`

이 가이드는 Vercel 배포 시 발생하는 `404: DEPLOYMENT_NOT_FOUND` 에러를 해결하는 방법을 단계별로 설명합니다.

---

## 🔴 에러 원인

`DEPLOYMENT_NOT_FOUND` 에러는 다음과 같은 이유로 발생합니다:

1. **프로젝트 루트 디렉토리 설정 오류** - `frontend` 폴더를 루트로 지정하지 않음
2. **환경 변수 미설정** - 필수 환경 변수가 없어서 빌드 실패
3. **빌드 실패** - TypeScript 에러, 패키지 설치 실패 등
4. **잘못된 Vercel 설정 파일** - `vercel.json` 구성 오류

---

## ✅ 해결 방법 (단계별)

### 1단계: Vercel 프로젝트 설정 확인

#### 1-1. Root Directory 설정

**중요**: Next.js 프로젝트가 `frontend` 폴더에 있으므로 반드시 설정 필요!

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Settings** → **General**
4. **Root Directory** 찾기
5. **Edit** 클릭
6. `frontend` 입력 (정확히 소문자로)
7. **Save** 클릭

```
Root Directory: frontend
```

#### 1-2. Framework Preset 확인

자동으로 **Next.js**가 감지되어야 합니다.

만약 감지되지 않으면:
```
Framework Preset: Next.js
```

---

### 2단계: 환경 변수 설정 (필수!)

**Settings** → **Environment Variables**로 이동하여 다음 변수 추가:

#### Production 환경 변수

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend.railway.app` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_NAME` | `easyK` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

**⚠️ 중요 사항**:
- 변수명을 **정확히** 입력 (대소문자 구분)
- `NEXT_PUBLIC_BACKEND_URL`은 **백엔드 API URL**로 변경
- 모든 환경(Production, Preview, Development)에 동일하게 설정

#### 환경 변수 설정 스크린샷 예시

```
Name: NEXT_PUBLIC_BACKEND_URL
Value: https://easyk-api.railway.app
Environments: ✓ Production ✓ Preview ✓ Development
```

---

### 3단계: 빌드 설정 확인

**Settings** → **Build & Development Settings**

| 설정 항목 | 값 |
|-----------|-----|
| **Framework Preset** | Next.js |
| **Build Command** | `npm run build` (자동) |
| **Output Directory** | `.next` (자동) |
| **Install Command** | `npm install` (자동) |
| **Root Directory** | `frontend` |

---

### 4단계: 재배포 실행

1. **Deployments** 탭으로 이동
2. 최신 배포 항목 찾기
3. 우측 **⋯** (점 3개) 메뉴 클릭
4. **Redeploy** 선택
5. **Redeploy** 버튼 클릭하여 확인

---

### 5단계: 빌드 로그 확인

재배포 후 빌드 로그를 확인합니다:

1. **Deployments** 탭
2. 진행 중인 배포 클릭
3. **Building** 섹션에서 실시간 로그 확인

#### 성공 시 로그 예시:
```
✓ Compiled successfully
✓ Generating static pages
✓ Finalizing page optimization
Build Completed
```

#### 실패 시 로그 예시:
```
✗ Type error: ...
✗ Module not found: ...
Build Failed
```

---

## 🔍 추가 문제 해결

### 문제 1: TypeScript 에러

**증상**:
```
Type error: Cannot find module 'xyz'
```

**해결 방법**:
```bash
# 로컬에서 테스트
cd frontend
npm run build

# 에러 발생 시 수정 후
git add .
git commit -m "fix: TypeScript errors"
git push origin main
```

### 문제 2: 패키지 설치 실패

**증상**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**해결 방법**:
```bash
# package-lock.json 재생성
cd frontend
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "fix: update package-lock.json"
git push origin main
```

### 문제 3: 환경 변수가 적용되지 않음

**증상**:
- 배포는 성공했지만 `undefined` 에러 발생
- API 호출이 실패

**해결 방법**:
1. Vercel Dashboard → Settings → Environment Variables
2. 변수가 제대로 설정되었는지 확인
3. **반드시 재배포** 실행 (환경 변수 변경 시 필수)

### 문제 4: 빌드 시간 초과

**증상**:
```
Error: Build exceeded maximum time limit
```

**해결 방법**:
- Vercel의 빌드 시간 제한: 무료 플랜 45분
- 프로젝트가 너무 크면 Pro 플랜 고려
- 불필요한 dependencies 제거

---

## 📝 체크리스트

배포 전에 다음 사항을 확인하세요:

### Vercel 설정
- [ ] Root Directory = `frontend` 설정
- [ ] Framework Preset = Next.js 확인
- [ ] 환경 변수 `NEXT_PUBLIC_BACKEND_URL` 설정
- [ ] 환경 변수 `NEXT_PUBLIC_APP_NAME` 설정
- [ ] 모든 환경(Production, Preview, Development)에 변수 설정

### 로컬 테스트
- [ ] `npm install` 성공
- [ ] `npm run build` 성공
- [ ] `npm start` 후 localhost:3000 접속 확인
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 최소화

### Git 저장소
- [ ] 최신 코드가 `main` 브랜치에 푸시됨
- [ ] `package-lock.json` 커밋됨
- [ ] `.gitignore`에 `node_modules`, `.next`, `.env.local` 포함

### 백엔드 설정
- [ ] 백엔드 API가 정상 작동 중
- [ ] CORS 설정에 Vercel URL 추가됨
- [ ] 백엔드 환경 변수 설정 완료

---

## 🚀 배포 성공 확인

### 1. URL 접속
```
https://your-project.vercel.app
```

### 2. 브라우저 개발자 도구 확인
```javascript
// Console 탭에서 확인
console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
// 출력: https://your-backend.railway.app
```

### 3. Network 탭 확인
- API 요청이 `NEXT_PUBLIC_BACKEND_URL`로 전송되는지 확인
- 200 OK 응답 확인

---

## 🔧 Vercel CLI로 로컬 테스트

Vercel CLI를 사용하면 로컬에서 Vercel 환경을 시뮬레이션할 수 있습니다:

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 루트에서
cd frontend

# 로컬에서 Vercel 개발 서버 실행
vercel dev

# 환경 변수 다운로드
vercel env pull .env.local
```

---

## 📞 추가 지원

### Vercel 대시보드에서 로그 확인
1. **Deployments** → 실패한 배포 클릭
2. **Function Logs** 또는 **Build Logs** 확인
3. 에러 메시지 복사하여 검색

### Vercel 커뮤니티
- GitHub Discussions: https://github.com/vercel/vercel/discussions
- Discord: https://vercel.com/discord

### Next.js 문서
- https://nextjs.org/docs/deployment
- https://nextjs.org/docs/basic-features/environment-variables

---

## ✅ 최종 확인 사항

배포가 성공하면:

1. ✅ URL 접속 시 홈페이지 정상 표시
2. ✅ 로그인/회원가입 작동
3. ✅ API 연결 정상
4. ✅ 다국어 전환 작동
5. ✅ 모바일에서도 정상 작동

---

**작성일**: 2026-01-02
**업데이트**: 2026-01-02
**작성자**: Claude Code

---

## 🆘 여전히 해결되지 않나요?

위의 모든 단계를 시도했는데도 문제가 해결되지 않으면:

1. **Vercel 대시보드**에서 **전체 빌드 로그**를 복사
2. **에러 메시지** 전체를 복사
3. 스크린샷 첨부
4. 다음 정보와 함께 질문:
   - Node.js 버전
   - npm 버전
   - 에러가 발생한 단계
   - 시도한 해결 방법

저에게 다시 문의하시면 구체적인 에러 메시지를 기반으로 추가 지원해드리겠습니다! 🚀
