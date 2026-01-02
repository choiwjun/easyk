# Vercel 배포 가이드

이 가이드는 easyK 프론트엔드를 Vercel에 배포하는 방법을 설명합니다.

---

## 📋 사전 준비

1. **Vercel 계정** 생성 (https://vercel.com)
2. **GitHub 저장소** 연결
3. **백엔드 API URL** 확인 (Railway 또는 다른 서비스에 배포된 URL)

---

## 🚀 Vercel 배포 단계

### 1. GitHub 저장소 연결

1. Vercel 대시보드에서 **"Add New Project"** 클릭
2. GitHub 저장소 **"easyk"** 선택
3. **Root Directory**: `frontend` 입력
4. **Framework Preset**: Next.js 자동 감지 확인

### 2. 환경 변수 설정 (매우 중요!)

**Settings → Environment Variables**로 이동하여 다음 환경 변수를 추가하세요:

#### 필수 환경 변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend.railway.app` | 백엔드 API URL (Railway 등) |
| `NEXT_PUBLIC_APP_NAME` | `easyK` | 애플리케이션 이름 |
| `NODE_ENV` | `production` | 프로덕션 환경 |

**⚠️ 중요**: `NEXT_PUBLIC_BACKEND_URL`을 반드시 설정하지 않으면 404 에러가 발생합니다!

#### 환경 변수 설정 예시

```bash
# Production
NEXT_PUBLIC_BACKEND_URL=https://easyk-api.railway.app
NEXT_PUBLIC_APP_NAME=easyK
NODE_ENV=production
```

### 3. 빌드 설정

Vercel이 자동으로 감지하지만, 수동 설정이 필요한 경우:

| 설정 | 값 |
|------|-----|
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |
| **Root Directory** | `frontend` |

### 4. 배포 실행

1. **"Deploy"** 버튼 클릭
2. 빌드 로그 확인
3. 배포 완료 후 URL 확인 (예: `https://easyk.vercel.app`)

---

## 🔧 문제 해결

### 404 NOT_FOUND 에러

**증상**: 배포 후 `404: NOT_FOUND` 에러 발생

**원인**:
1. 환경 변수 `NEXT_PUBLIC_BACKEND_URL`이 설정되지 않음
2. 루트 페이지 (`app/page.tsx`)가 없음
3. 라우팅 설정 오류

**해결 방법**:

#### 방법 1: 환경 변수 확인
```bash
# Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
```

#### 방법 2: 로컬에서 프로덕션 빌드 테스트
```bash
cd frontend
npm run build
npm start
```

#### 방법 3: Vercel 로그 확인
```bash
# Vercel Dashboard → Deployments → 최신 배포 → View Function Logs
```

### 빌드 실패

**증상**: `Build failed` 메시지

**해결 방법**:
1. **패키지 의존성 확인**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **TypeScript 에러 확인**
   ```bash
   npm run lint
   ```

3. **Node.js 버전 확인**
   - Vercel은 기본적으로 최신 LTS 버전 사용
   - `package.json`에 명시 가능:
     ```json
     {
       "engines": {
         "node": ">=18.0.0"
       }
     }
     ```

### 환경 변수가 적용되지 않음

**증상**: 환경 변수 변경 후에도 이전 값 사용

**해결 방법**:
1. Vercel Dashboard → Deployments → **Redeploy**
2. 환경 변수 변경 후 **반드시 재배포** 필요

---

## 📝 배포 후 확인 사항

### 1. 기본 페이지 접속 확인
```
https://your-app.vercel.app
```

### 2. API 연결 확인
```
브라우저 개발자 도구 → Network 탭
→ API 요청이 NEXT_PUBLIC_BACKEND_URL로 전송되는지 확인
```

### 3. 환경 변수 확인
```javascript
// 브라우저 콘솔에서 확인
console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
```

### 4. 기능 테스트
- [ ] 로그인/회원가입
- [ ] 상담 신청
- [ ] 일자리 검색
- [ ] 정부 지원 정보 조회
- [ ] 다국어 전환 (한국어/영어)

---

## 🔄 자동 배포 설정

### GitHub 연동 시 자동 배포

Vercel은 기본적으로 GitHub와 연동되어 있어 다음과 같이 자동 배포됩니다:

| 브랜치 | 배포 환경 | URL |
|--------|-----------|-----|
| `main` | Production | `https://easyk.vercel.app` |
| `develop` | Preview | `https://easyk-git-develop.vercel.app` |
| PR | Preview | `https://easyk-git-pr-123.vercel.app` |

### 배포 트리거
- `main` 브랜치에 push → 자동 프로덕션 배포
- Pull Request 생성 → 자동 프리뷰 배포

---

## 🌐 커스텀 도메인 설정

### 1. 도메인 추가

1. Vercel Dashboard → Settings → Domains
2. **"Add Domain"** 클릭
3. 도메인 입력 (예: `easyk.com`)
4. DNS 레코드 설정

### 2. DNS 설정

**A Record (IPv4)**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record (www)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서 발급

---

## 📊 성능 최적화

### 1. 이미지 최적화

`next.config.js`에 이미 설정됨:
```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60,
}
```

### 2. 번들 최적화

프로덕션 빌드 시 자동 최적화:
- Tree shaking
- Code splitting
- Minification
- Compression

### 3. CDN 캐싱

Vercel Edge Network를 통한 전 세계 CDN 캐싱

---

## 🔐 보안 설정

### 1. 환경 변수 암호화

Vercel은 모든 환경 변수를 암호화하여 저장

### 2. HTTPS 강제

자동으로 HTTPS 리다이렉션 활성화

### 3. 보안 헤더

`next.config.js`에 추가 가능:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ]
}
```

---

## 📞 지원 및 문의

- Vercel 공식 문서: https://vercel.com/docs
- Vercel 커뮤니티: https://github.com/vercel/vercel/discussions
- Next.js 문서: https://nextjs.org/docs

---

## ✅ 체크리스트

배포 전에 다음 사항을 확인하세요:

- [ ] GitHub 저장소 연결 완료
- [ ] `NEXT_PUBLIC_BACKEND_URL` 환경 변수 설정
- [ ] `NEXT_PUBLIC_APP_NAME` 환경 변수 설정
- [ ] 로컬에서 `npm run build` 성공
- [ ] 백엔드 API가 정상 작동 중
- [ ] CORS 설정 확인 (백엔드에서 Vercel URL 허용)
- [ ] SSL 인증서 발급 완료
- [ ] 기본 기능 테스트 완료

---

**작성일**: 2026-01-02
**작성자**: Claude Code
