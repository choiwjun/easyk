# 에러 해결 가이드

**작성일**: 2026-01-03  
**관련 에러**: 502 Bad Gateway, Minified React error #301, Import map error

---

## 1. 502 Bad Gateway 에러 (`/api/users/me:1`)

### 원인
- URL에 불필요한 `:1` 이후가 붙어 있음
- 프론트엔드가 `/api/users/me:1`로 요청

### 해결 방안

**1단계**: 정확한 URL 확인
```bash
cd frontend
grep -r "api/users/me" src/
```

**2단계**: API 경로 수정
- 올바른 경로: `/api/users/me` (뒤에 콜론(:) 없음)

**3단계**: 네트워크/프록시 확인
```bash
# 백엔드 서버가 실행 중인지 확인
curl http://localhost:8000/api/users/me
```

---

## 2. Minified React error #301

### 원인
- React 구성 또는 빌드 최적화 문제
- `react-dom`, `react` 버전 충돌

### 해결 방안

**1단계**: 빌드 캐시 정리
```bash
cd frontend
rm -rf .next
```

**2단계**: 의존성 업데이트
```bash
npm update
```

**3단계**: 완전 빌드
```bash
npm run build
```

---

## 3. Import map error

### 원인
- 웹팩이 절대 경로(`./src/components/ui/Card`)로 변환됨
- 이는 빌드 설정 문제

### 해결 방안

**1단계**: `next.config.js` 확인
```javascript
// next.config.js 확인
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 기존 설정
  
  // 추가할 설정
  webpack: (config, { isServer }) => {
    config.externals = config.externals || [];
    config.resolve = config.resolve || {};
    
    // 절대 경로 변환 방지
    config.module = {
      ...config.module,
      rules: [
        {
          test: /\.(css|less|scss|sass)$/,
          use: ['style-loader'],
          type: 'asset',
        },
      ]
    };
    
    return config;
  },
};

module.exports = nextConfig;
```

**2단계**: 프로젝트 구조 확인
```bash
cd frontend
ls -la src/components/ui/
```

**3단계**: 경로별 재빌드
```bash
cd frontend
rm -rf .next
npm run build
```

---

## 4. 공통 해결 방안 (즉시 실행 가능)

### 방안 1: 모든 프로세스 중지 후 재시작
```bash
# 터미널에서
# Ctrl+C로 서버 중지
# 다시 시작
cd backend && python main.py
cd frontend && npm run dev
```

### 방안 2: 브라우저 하드 리프레시
```bash
# Chrome/Edge: Ctrl+Shift+Delete
# 또는 개발자 도구 → Clear storage
```

### 방안 3: 포트 충돌 확인
```bash
# 백엔드 포트: 8000
# 프론트엔드 포트: 3000

# 포트 사용 확인
netstat -an | grep LISTEN
```

---

## 5. 정상 작동 확인 체크리스트

### 프론트엔드
- [ ] 랜딩 페이지 정상 표시
- [ ] 상담 목록 페이지 정상 표시
- [ ] 전문가 대시보드 정상 표시
- [ ] 파일 업로드 기능 정상 작동
- [ ] 채팅 기능 정상 작동
- [ ] 서류 템플릿 다운로드 정상 작동

### 백엔드
- [ ] 사용자 인증 정상 작동
- [ ] 상담 CRUD 정상 작동
- [ ] 일자리 CRUD 정상 작동
- [ ] 지원 CRUD 정상 작동
- [ ] 관심 공고 저장/조회 정상 작동
- [ ] 서류 템플릿 CRUD 정상 작동
- [ ] 파일 업로드 API 정상 작동
- [ ] 메시지 CRUD 정상 작동

---

## 6. 에러 해결 프로세스

### 1단계: 진단 (현재 5분)

- [ ] 에러 로그 확인 (백엔드 터미널, 프론트엔드 브라우저)
- [ ] 포트 충돌 확인
- [ ] 네트워크 연결 확인

### 2단계: 해결 (5분)

- [ ] 가장 가능한 해결 방안 시도
- [ ] 정상 작동하는지 확인

### 3단계: 검증 (5분)

- [ ] 모든 기능 정상 작동하는지 체크
- [ ] 에러 재발생 여부 확인

---

## 7. 추천 사항

### 즉시 실행
1. **서버 재시작**: 가장 빠른 방법
2. **캐시 정리**: 프론트엔드 `.next` 폴더 삭제
3. **빌드 재실행**: 캐시 없이 빌드

### 추가 조사
1. **의존성 확인**: 다른 프로젝트에서 동일한 에러 확인
2. **버전 확인**: `next`, `react` 버전 호환성 확인
3. **의존 파일 확인**: 충돌하는 파일/설정 확인

---

## 8. 연락처

이 해결 방안으로도 해결되지 않을 경우:

1. **터미널 로그 확인**: 백엔드 실행 로그 확인
2. **프론트엔드 콘솔 확인**: 브라우저 개발자 도구 콘솔 확인
3. **버전 확인**: `npm list`로 설치된 패키지 확인

---

**작성일**: 2026-01-03  
**버전**: 1.0.0




