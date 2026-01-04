# 역할 기반 접근 제어 (Role-Based Access Control) - easyK

## 📋 개요

easyK 플랫폼은 4가지 사용자 역할에 따라 페이지 및 기능 접근을 제어합니다:

1. **Foreign (외국인 일반 사용자)** - 일자리 검색, 상담 신청, 정부 지원 조회
2. **Consultant (전문가)** - 상담 요청 관리 및 응답
3. **Admin (관리자)** - 플랫폼 전체 관리 및 통계
4. **Agency (기관)** - 일자리 공고 작성 및 지원자 관리

---

## 🔐 보안 아키텍처

### 2단계 보안 체계

```
┌─────────────────────────────────────────────────────────────┐
│                    1. Frontend Route Guard                   │
│            useRoleGuard() - 페이지 접근 제어                  │
│                  (즉시 리다이렉트)                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   2. Backend API Authorization               │
│         @Depends(get_current_user) - 데이터 접근 제어        │
│                  (403 Forbidden 반환)                        │
└─────────────────────────────────────────────────────────────┘
```

**설계 원칙:**
- Frontend: UX 개선 및 정보 노출 방지
- Backend: 실제 데이터 보호 (필수 보안 레이어)

---

## 🛡️ Frontend Route Protection

### useRoleGuard Hook

**위치:** `frontend/src/hooks/useRoleGuard.ts`

**사용법:**
```typescript
import { useRoleGuard } from '@/hooks/useRoleGuard';

export default function AdminPage() {
  const isAuthorized = useRoleGuard(['admin']);

  if (!isAuthorized) {
    return <LoadingScreen />;
  }

  return <div>Admin Dashboard</div>;
}
```

**동작:**
1. `localStorage`에서 JWT 토큰 확인
2. `/api/users/me` 호출하여 사용자 정보 조회
3. 사용자 역할이 `allowedRoles`에 포함되는지 확인
4. 권한 없으면 `/`로 리다이렉트 + alert 표시
5. 로그인되지 않았으면 `/login`으로 리다이렉트

**특징:**
- 페이지 렌더링 전 역할 확인
- 권한 없는 사용자는 페이지 내용을 볼 수 없음
- 모든 역할 체크는 백엔드에서 재확인됨 (보안 유지)

---

## 📊 역할별 접근 권한 매트릭스

| 페이지/기능 | Foreign | Consultant | Admin | Agency |
|-------------|:-------:|:----------:|:-----:|:------:|
| **일자리** |
| `/jobs` (목록) | ✅ | ✅ | ✅ | ✅ |
| `/jobs/:id` (상세) | ✅ | ✅ | ✅ | ✅ |
| `/jobs/:id/apply` (지원) | ✅ | ❌ | ✅ | ❌ |
| `/saved-jobs` (저장된 일자리) | ✅ | ❌ | ✅ | ❌ |
| `/applications` (내 지원) | ✅ | ❌ | ✅ | ❌ |
| **상담** |
| `/consultations` (목록) | ✅ | ✅ | ✅ | ❌ |
| `/consultations/new` (신청) | ✅ | ❌ | ✅ | ❌ |
| `/consultations/:id` (상세) | ✅ | ✅ | ✅ | ❌ |
| **정부 지원** |
| `/supports` (목록) | ✅ | ✅ | ✅ | ✅ |
| `/supports/:id` (상세) | ✅ | ✅ | ✅ | ✅ |
| `/supports/:id/eligibility` (자격 확인) | ✅ | ✅ | ✅ | ✅ |
| `/document-templates` (서류 다운로드) | ✅ | ✅ | ✅ | ✅ |
| **전문가 전용** |
| `/consultant/dashboard` | ❌ | ✅ | ✅ | ❌ |
| **관리자 전용** |
| `/admin/stats` | ❌ | ❌ | ✅ | ❌ |
| `/admin/jobs` | ❌ | ❌ | ✅ | ❌ |
| `/support-keywords` | ❌ | ❌ | ✅ | ❌ |
| **기관 전용** |
| `/agency` | ❌ | ❌ | ✅ | ✅ |

---

## 🔒 보호된 페이지 목록

### 1. Consultant Dashboard
**경로:** `/consultant/dashboard`
**허용 역할:** `['consultant', 'admin']`
**구현 위치:** `frontend/src/app/(dashboard)/consultant/dashboard/page.tsx:49`

```typescript
const isAuthorized = useRoleGuard(['consultant', 'admin']);
```

**기능:**
- 매칭된 상담 요청 조회
- 상담 수락/거절
- 상담 상태별 필터링

---

### 2. Admin Statistics Dashboard
**경로:** `/admin/stats`
**허용 역할:** `['admin']`
**구현 위치:** `frontend/src/app/(dashboard)/admin/stats/page.tsx:38`

```typescript
const isAuthorized = useRoleGuard(['admin']);
```

**기능:**
- 사용자 통계 (전체, 외국인, 전문가, 관리자)
- 상담 통계 (전체, 상태별)
- 일자리 통계 (전체, 진행중, 지원 현황)
- 정부 지원 통계 (전체, 진행중)

**백엔드 보호:** `backend/src/routers/stats.py:39`
```python
if current_user.role != "admin":
    raise HTTPException(status_code=403, detail="Admin access required")
```

---

### 3. Admin Jobs Management
**경로:** `/admin/jobs`
**허용 역할:** `['admin']`
**구현 위치:** `frontend/src/app/(dashboard)/admin/jobs/page.tsx:68`

```typescript
const isAuthorized = useRoleGuard(['admin']);
```

**기능:**
- 일자리 공고 CRUD (생성, 수정, 삭제)
- 지원자 목록 조회
- 지원자 상태 변경 (채용/거절)
- 검토 코멘트 작성

---

### 4. Support Keywords Management
**경로:** `/support-keywords`
**허용 역할:** `['admin']`
**구현 위치:** `frontend/src/app/(dashboard)/support-keywords/page.tsx:32`

```typescript
const isAuthorized = useRoleGuard(['admin']);
```

**기능:**
- 정부 지원 키워드 관리
- 키워드 추가/수정/삭제
- 카테고리별 필터링
- 검색어 통계

**백엔드 보호:** `backend/src/routers/support_keywords.py`
```python
@router.post("", dependencies=[Depends(get_current_admin_user)])
```

---

### 5. Agency Dashboard
**경로:** `/agency`
**허용 역할:** `['agency', 'admin']`
**구현 위치:** `frontend/src/app/(dashboard)/agency/page.tsx:81-104`

```typescript
const checkAuth = async () => {
  const user = await fetchUser();
  if (user.role !== 'agency' && user.role !== 'admin') {
    router.push('/');
    alert('기관 또는 관리자만 접근할 수 있습니다');
  }
};
```

**기능:**
- 일자리 공고 작성
- 일자리 공고 수정/삭제
- 지원자 목록 조회 및 관리

---

## 🎯 역할별 네비게이션 메뉴

### Navbar 동적 렌더링

**위치:** `frontend/src/components/ui/Navbar.tsx:13-36`

**구현:**
```typescript
const [userRole, setUserRole] = useState<string | null>(null);

useEffect(() => {
  const fetchUserRole = async () => {
    const response = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const user = await response.json();
      setUserRole(user.role);
    }
  };
  fetchUserRole();
}, []);
```

### 역할별 표시 메뉴

**모든 사용자 (인증된):**
- 💼 일자리
- ⚖️ 법률 상담
- 🏛️ 정부 지원

**Consultant 추가 메뉴:**
- 👨‍💼 전문가 대시보드

**Admin 추가 메뉴:**
- 📊 통계
- 🛡️ 일자리 관리
- 🏢 기관 대시보드 (agency 기능 포함)

**Agency 추가 메뉴:**
- 🏢 기관 대시보드

**구현 코드:**
```typescript
{userRole === 'consultant' && (
  <Link href="/consultant/dashboard">👨‍💼 전문가 대시보드</Link>
)}
{userRole === 'admin' && (
  <>
    <Link href="/admin/stats">📊 통계</Link>
    <Link href="/admin/jobs">🛡️ 일자리 관리</Link>
  </>
)}
{(userRole === 'agency' || userRole === 'admin') && (
  <Link href="/agency">🏢 기관 대시보드</Link>
)}
```

---

## 🔧 Backend Authorization

### 인증 미들웨어

**위치:** `backend/src/middleware/auth.py`

**주요 함수:**

1. **`get_current_user()`**
   - JWT 토큰 검증
   - 모든 인증 필요 엔드포인트에서 사용
   - 사용자 정보 반환

2. **`get_current_admin_user()`**
   - `get_current_user()` + 관리자 체크
   - 관리자 전용 엔드포인트에서 사용

3. **`require_admin` (의존성)**
   - FastAPI `Depends`로 사용
   - 403 에러 자동 반환

**사용 예시:**
```python
@router.get("/admin/stats")
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    # ...
```

---

## 📝 보안 체크리스트

### Frontend 보안
- ✅ 모든 관리자 페이지에 `useRoleGuard(['admin'])` 적용
- ✅ 전문가 대시보드에 `useRoleGuard(['consultant', 'admin'])` 적용
- ✅ 기관 대시보드에 역할 체크 적용
- ✅ Navbar에서 역할별 메뉴 필터링
- ✅ 페이지 렌더링 전 권한 확인 (정보 노출 방지)

### Backend 보안
- ✅ 통계 API (`/api/stats/dashboard`) - 관리자 체크
- ✅ 일자리 CRUD - 관리자 체크 (서비스 레이어)
- ✅ 키워드 관리 - 관리자 전용 의존성
- ✅ 정부 지원 CRUD - 관리자 전용 의존성
- ✅ 모든 API 엔드포인트 인증 필요

### 테스트 체크리스트
- [ ] Foreign 사용자로 `/admin/stats` 접근 → 리다이렉트 확인
- [ ] Foreign 사용자로 `/consultant/dashboard` 접근 → 리다이렉트 확인
- [ ] Consultant로 `/admin/stats` 접근 → 리다이렉트 확인
- [ ] Admin으로 모든 페이지 접근 → 성공 확인
- [ ] Agency로 `/agency` 접근 → 성공 확인
- [ ] Agency로 `/admin/stats` 접근 → 리다이렉트 확인
- [ ] 로그아웃 후 보호된 페이지 접근 → 로그인 페이지 리다이렉트
- [ ] Navbar 메뉴가 역할별로 다르게 표시되는지 확인

---

## 🚨 보안 취약점 방지

### 1. 클라이언트 사이드 역할 조작 방지
**문제:** 사용자가 브라우저에서 `localStorage.user.role`을 수정할 수 있음

**해결:**
- Frontend 역할 체크는 UX 목적
- 모든 데이터 접근은 Backend에서 재확인
- JWT 토큰은 서버에서만 검증

### 2. JWT 토큰 탈취 방지
**현재 구현:** `localStorage` 사용

**권장 개선사항 (프로덕션):**
- HttpOnly Cookie 사용 고려
- Refresh Token 구현
- Token 만료 시간 단축 (1시간)

### 3. CSRF 방지
**현재 구현:** Bearer Token 인증 (CSRF 영향 없음)

### 4. XSS 방지
**현재 구현:**
- React의 자동 escape 활용
- `dangerouslySetInnerHTML` 미사용

---

## 🔄 역할 변경 시나리오

### 사용자 역할 업그레이드
**예시:** Foreign → Consultant

**영향:**
1. Navbar에 "전문가 대시보드" 메뉴 자동 표시
2. `/consultant/dashboard` 접근 가능
3. 백엔드 `/api/consultations/incoming` 엔드포인트 접근 가능

**자동 반영:**
- 로그아웃 후 재로그인 시 새 역할 적용
- Navbar는 컴포넌트 마운트 시 역할 조회

---

## 📖 참고 자료

### 관련 파일
- `frontend/src/hooks/useRoleGuard.ts` - 역할 기반 라우트 가드
- `frontend/src/components/ui/Navbar.tsx` - 역할별 네비게이션
- `backend/src/middleware/auth.py` - 인증 및 권한 미들웨어
- `backend/src/routers/stats.py` - 관리자 전용 통계 API
- `backend/src/routers/support_keywords.py` - 관리자 전용 키워드 API

### 역할 정의
**Backend:** `backend/src/models/user.py`
```python
role = Column(String(20), nullable=False, default='foreign')
# 가능한 값: 'foreign', 'consultant', 'admin', 'agency'
```

---

## 🎯 다음 단계 (선택적 개선사항)

### 1. 세분화된 권한 시스템
현재: 역할 기반 (4가지 역할)
개선: 권한 기반 (permissions 테이블)

**예시:**
```python
permissions = [
  'jobs.create',
  'jobs.update',
  'jobs.delete',
  'consultations.manage',
  'stats.view',
]
```

### 2. 역할 계층 구조
```
Admin (모든 권한)
  ↓
Agency (일자리 관리)
  ↓
Consultant (상담 관리)
  ↓
Foreign (기본 사용자)
```

### 3. 감사 로그 (Audit Log)
- 누가 언제 어떤 페이지에 접근했는지 기록
- 권한 위반 시도 모니터링

---

## ✅ 구현 완료 사항

- ✅ `useRoleGuard` 훅 생성
- ✅ `/consultant/dashboard` 보호 (consultant, admin)
- ✅ `/admin/stats` 보호 (admin)
- ✅ `/admin/jobs` 보호 (admin)
- ✅ `/support-keywords` 보호 (admin)
- ✅ Navbar 역할별 메뉴 필터링 (데스크톱 + 모바일)
- ✅ 모든 관리자 페이지 프론트엔드 가드 적용
- ✅ 백엔드 API 관리자 체크 유지

**보안 등급:** 🟢 High Security
**마지막 업데이트:** 2026-01-04
