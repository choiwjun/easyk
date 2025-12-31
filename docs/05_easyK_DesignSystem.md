# easyK Design System (디자인 시스템)

**문서 버전**: v1.0  
**작성일**: 2025-12-30  
**프로젝트**: easyK (외국인 맞춤형 정착 지원 플랫폼)

---

## 디자인 시스템 개요

easyK의 디자인 시스템은 **신뢰성, 포용성, 명확성**의 3가지 원칙을 바탕으로 설계되었습니다.

- **신뢰성**: 외국인 사용자가 믿을 수 있는 공식적인 느낌
- **포용성**: 다양한 배경의 사용자가 이해하기 쉬운 UI
- **명확성**: 모든 정보와 액션이 직관적으로 전달되는 디자인

---

## 1. 색상 팔레트 (Color Palette)

### 1.1 주요 색상 (Primary Colors)

| 색상 | 색상코드 | 용도 | 의미 |
|------|---------|------|------|
| **신뢰 파랑** | `#1E5BA0` | CTA (버튼), 주요 텍스트, 링크 | 신뢰, 안정성 |
| **긍정 녹색** | `#2BAD7B` | 성공 상태, 완료, 승인 | 진행, 성공 |
| **경고 주황** | `#F59E0B` | 경고, 주의 메시지 | 주의 필요 |
| **거절 빨강** | `#DC2626` | 에러, 거절, 위험 | 부정, 중지 |

### 1.2 중립 색상 (Neutral Colors)

| 색상 | 색상코드 | 용도 |
|------|---------|------|
| 기본 텍스트 | `#1F2937` (Gray 900) | 본문, 제목 텍스트 |
| 보조 텍스트 | `#6B7280` (Gray 500) | 부가 설명, 힌트 |
| 배경 | `#F9FAFB` (Gray 50) | 페이지 배경 |
| 테두리 | `#E5E7EB` (Gray 200) | 카드, 입력 필드 경계 |
| 흰색 | `#FFFFFF` | 카드, 모달 배경 |

### 1.3 상태별 색상 (Semantic Colors)

```
정보 (Info):       #3B82F6 (파랑)     → 팁, 안내 메시지
성공 (Success):    #2BAD7B (녹색)     → 완료, 승인
경고 (Warning):    #F59E0B (주황)     → 주의
에러 (Error):      #DC2626 (빨강)     → 오류, 실패
```

### 1.4 배경 및 컨테이너 (Backgrounds)

```
기본 배경:   #F9FAFB
카드:        #FFFFFF
호버:        #F3F4F6
선택:        #EBF4FF (신뢰 파랑 10%)
비활성:      #F0F0F0
```

---

## 2. 타이포그래피 (Typography)

### 2.1 타이폰 (Typeface)

| 사용처 | 글꼴 | 대체 | 장점 |
|--------|------|------|------|
| 전체 | Pretendard (한글) / Inter (영문) | Arial, Segoe UI | 모던하고 가독성 우수 |
| 코드 | Monaco / 'Courier New' | Courier | 단간격(monospace), 명확 |

**폰트 로드 전략**:
- Pretendard: 로컬 폰트 또는 CDN (Google Fonts)
- 로드 시간 최소화를 위해 웹폰트 subsetting 사용

### 2.2 타이포그래피 스케일

| 레벨 | 크기 | 두께 | 줄높이 | 용도 |
|------|------|------|--------|------|
| **H1** | 32px | 700 (Bold) | 1.2 | 페이지 제목 |
| **H2** | 28px | 700 (Bold) | 1.3 | 섹션 제목 |
| **H3** | 24px | 600 (Semibold) | 1.4 | 카테고리 제목 |
| **H4** | 20px | 600 (Semibold) | 1.4 | 소제목 |
| **Body L** | 18px | 400 (Regular) | 1.6 | 본문 (큼) |
| **Body M** | 16px | 400 (Regular) | 1.6 | 본문 (표준) |
| **Body S** | 14px | 400 (Regular) | 1.5 | 보조 텍스트 |
| **Caption** | 12px | 400 (Regular) | 1.5 | 캡션, 라벨 |

**예시**:
```
H1: "easyK에 오신 것을 환영합니다" → 32px Bold
Body M: "신뢰할 수 있는 법률 전문가를 찾아보세요" → 16px Regular
Caption: "*필수 입력 항목" → 12px Regular
```

---

## 3. 간격 (Spacing)

### 3.1 간격 스케일 (Spacing Scale)

```
기본 단위: 4px

4px   (1 × 기본)   - 매우 작은 간격
8px   (2 × 기본)   - 작은 간격
12px  (3 × 기본)   - 작은-중간 간격
16px  (4 × 기본)   - 표준 간격
20px  (5 × 기본)   - 중간 간격
24px  (6 × 기본)   - 대간격
32px  (8 × 기본)   - 매우 큰 간격
40px  (10 × 기본)  - 섹션 간 간격
```

### 3.2 적용 예시

| 요소 | 내부 여백 (Padding) | 외부 여백 (Margin) |
|------|---------------------|-------------------|
| 버튼 | 12px (상하) × 16px (좌우) | 0 |
| 입력 필드 | 12px (상하) × 16px (좌우) | 0 |
| 카드 | 24px (모두) | 16px (아래) |
| 섹션 | - | 40px (상하) |
| 리스트 항목 | 16px (상하) × 16px (좌우) | 0 |

---

## 4. 컴포넌트 정의 (Component Library)

### 4.1 Button (버튼)

**상태**: Default → Hover → Active → Disabled

```
Primary Button (주요 액션)
- Default:   배경 #1E5BA0 (파랑), 텍스트 #FFFFFF (흰색), 12px 라운드
- Hover:     배경 #164A81 (어두운 파랑), 그림자 추가
- Active:    배경 #0D3A5C (더 어두운 파랑)
- Disabled:  배경 #D1D5DB (회색), 텍스트 #9CA3AF (회색), cursor: not-allowed

Secondary Button (부차 액션)
- Default:   배경 #FFFFFF, 테두리 #1E5BA0, 텍스트 #1E5BA0, 2px 테두리
- Hover:     배경 #F0F4FF, 테두리 #164A81
- Disabled:  배경 #F9FAFB, 테두리 #D1D5DB, 텍스트 #9CA3AF

Danger Button (위험 액션 - 삭제 등)
- Default:   배경 #DC2626 (빨강), 텍스트 #FFFFFF
- Hover:     배경 #991B1B
- Active:    배경 #7F1D1D
```

**크기**:
- Small:   32px 높이 (모바일)
- Medium:  40px 높이 (표준)
- Large:   48px 높이 (중요 액션)

### 4.2 Input (입력 필드)

**상태**: Default → Focus → Error → Disabled

```
텍스트 입력
- 높이: 40px
- Padding: 12px × 16px
- 테두리: 1px #E5E7EB
- Focus: 테두리 2px #1E5BA0, outline 없음
- Error: 테두리 2px #DC2626
- Disabled: 배경 #F9FAFB, 색상 #9CA3AF, cursor: not-allowed
- 라운드: 8px
```

**레이블**:
- 폰트: 14px Semibold
- 색상: #1F2937
- 입력 필드 위에 8px 여백

**에러 메시지**:
- 폰트: 12px Regular
- 색상: #DC2626
- 입력 필드 아래에 4px 여백

**힌트 텍스트**:
- 폰트: 12px Regular
- 색상: #6B7280
- 라벨 아래에 4px 여백

### 4.3 Select/Dropdown (선택 박스)

**상태**: Default → Open → Selected → Error

```
- 높이: 40px (input과 동일)
- 배경: #FFFFFF
- 테두리: 1px #E5E7EB
- 라운드: 8px
- 아이콘: 화살표 (회전 애니메이션)

Open 상태:
- 옵션 리스트 배경: #FFFFFF
- 호버 항목 배경: #F3F4F6
- 선택 항목 배경: #EBF4FF
- 선택 항목 텍스트: #1E5BA0
```

### 4.4 Card (카드)

**상태**: Default → Hover

```
- 배경: #FFFFFF
- 테두리: 1px #E5E7EB
- 라운드: 12px
- 패딩: 24px
- 그림자: 0 1px 3px rgba(0,0,0,0.1)
- Hover: 그림자 0 4px 12px rgba(0,0,0,0.15), cursor: pointer
```

### 4.5 Badge/Tag (배지)

**타입**: Status, Category, Label

```
Status Badge (상태 표시)
- 배경: 상태별 색상 (성공 #2BAD7B, 대기 #F59E0B 등)
- 텍스트: 흰색
- 크기: 12px 폰트, 패딩 4px 8px
- 라운드: 999px (완전 원형)

Category Tag (카테고리)
- 배경: #EBF4FF (신뢰 파랑 10%)
- 텍스트: #1E5BA0
- 크기: 14px 폰트, 패딩 6px 12px
- 라운드: 6px
```

### 4.6 Alert/Message (알림)

**타입**: Info, Success, Warning, Error

```
Info (파랑)
- 배경: #EFF6FF (파랑 5%)
- 테두리: 1px #DBEAFE (파랑 20%)
- 텍스트: #1E40AF (파랑 80%)
- 아이콘: 정보 아이콘

Success (녹색)
- 배경: #ECFDF5 (녹색 5%)
- 테두리: 1px #CCFBF1 (녹색 20%)
- 텍스트: #065F46 (녹색 80%)
- 아이콘: 체크마크

Warning (주황)
- 배경: #FFFBEB (주황 5%)
- 테두리: 1px #FEE3A3 (주황 20%)
- 텍스트: #92400E (주황 80%)
- 아이콘: 경고 아이콘

Error (빨강)
- 배경: #FEF2F2 (빨강 5%)
- 테두리: 1px #FECACA (빨강 20%)
- 텍스트: #7F1D1D (빨강 80%)
- 아이콘: 오류 아이콘
```

### 4.7 Modal/Dialog (모달)

```
- 배경: 반투명 검정 (rgba(0,0,0,0.5))
- 모달 박스 배경: #FFFFFF
- 라운드: 12px
- 최소 너비: 320px (모바일), 최대 500px (데스크톱)
- 패딩: 24px
- 그림자: 0 20px 25px rgba(0,0,0,0.15)

- 제목: 24px Semibold (#1F2937)
- 본문: 16px Regular (#6B7280)
- 버튼: 모두 Secondary (바깥쪽), 하나는 Primary (오른쪽)
```

### 4.8 Checkbox & Radio

```
Checkbox
- 크기: 20px × 20px
- 테두리: 2px #E5E7EB
- 라운드: 4px
- Checked: 배경 #1E5BA0, 체크마크 #FFFFFF
- Focus: 테두리 2px #1E5BA0
- Disabled: 배경 #F9FAFB, 테두리 #D1D5DB

Radio
- 크기: 20px × 20px
- 테두리: 2px #E5E7EB
- 라운드: 999px (완전 원형)
- Selected: 배경 #1E5BA0 (중심), 점 #FFFFFF
- Focus: 테두리 2px #1E5BA0
- Disabled: 배경 #F9FAFB, 테두리 #D1D5DB
```

---

## 5. 레이아웃 및 그리드 (Layout)

### 5.1 반응형 그리드

```
모바일 (320px ~ 768px):
- 1 컬럼 레이아웃
- 패딩: 16px (좌우)
- 최대 너비: 100%

태블릿 (768px ~ 1024px):
- 2 컬럼 레이아웃
- 패딩: 24px (좌우)
- 최대 너비: 100%

데스크톱 (1024px 이상):
- 2-3 컬럼 레이아웃
- 패딩: 32px (좌우)
- 최대 너비: 1200px
- 중앙 정렬
```

### 5.2 네비게이션 바

```
높이: 64px

로고/텍스트:
- 좌측, 24px × 24px
- 옆에 텍스트 "easyK" (18px Bold)

메뉴 항목:
- 중앙 또는 우측
- 항목 간 16px 간격
- Hover: 배경 #F3F4F6 (모바일: 전체), 텍스트 #1E5BA0

사용자 메뉴:
- 우측, 프로필 이미지 (40px × 40px, 원형)
- 드롭다운 메뉴

모바일:
- 햄버거 메뉴 (우측)
- 클릭 시 왼쪽 사이드바 슬라이드 (80% 너비)
```

---

## 6. 아이콘 (Icons)

### 6.1 아이콘 사용 기준

| 용도 | 크기 | 스타일 |
|------|------|--------|
| 버튼 내부 | 16px | 선(Outline) |
| 네비게이션 | 24px | 선(Outline) |
| 상태 배지 | 20px | 채우기(Solid) |
| 입력 필드 (앞) | 16px | 선(Outline) |
| 헤더 아이콘 | 20px × 20px | 선(Outline) |

**아이콘 세트**: 
- Material Design Icons (Google) 또는 Feather Icons (간결한 스타일)
- 색상: 기본 #6B7280, 강조 #1E5BA0, 상태별 색상

### 6.2 일반 아이콘 목록

```
상담:        consultation 또는 message-square
일자리:      briefcase 또는 work
지원:        help-circle 또는 info
저장:        bookmark 또는 star
삭제:        trash-2
수정:        edit-2
검색:        search
메뉴:        menu
닫기:        x 또는 x-circle
승인:        check-circle (초록)
거절:        x-circle (빨강)
대기:        clock (주황)
홈:          home
프로필:      user 또는 user-circle
설정:        settings 또는 gear
로그아웃:    log-out
```

---

## 7. 애니메이션 및 전환 (Animation)

### 7.1 Transition (전환)

```
기본 전환 시간: 200ms
- 색상 변경: cubic-bezier(0.4, 0, 0.2, 1)
- 크기 변경: cubic-bezier(0.4, 0, 0.2, 1)
- Opacity: cubic-bezier(0.4, 0, 0.2, 1)

장시간 전환: 300ms
- 모달 나타남/사라짐
- 사이드바 슬라이드

예시:
transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

### 7.2 애니메이션

```
로딩 스피너:
- 크기: 40px × 40px
- 색상: #1E5BA0
- 애니메이션: 회전 (1.5초 무한)

Fade In:
- 0% opacity: 0
- 100% opacity: 1
- 시간: 300ms

Slide In (왼쪽에서):
- 0% translate: -100%
- 100% translate: 0
- 시간: 300ms
```

---

## 8. 접근성 (Accessibility)

### 8.1 색상 대비 (Color Contrast)

- **정상 텍스트**: 배경 대비 최소 4.5:1 (WCAG AA)
- **큰 텍스트** (18px+): 배경 대비 최소 3:1 (WCAG AA)

**검증**:
- 색맹 사용자를 위해 색상만으로 정보 전달하지 않음
- 상태는 색상 + 아이콘 + 텍스트로 표현

### 8.2 키보드 네비게이션

```
Tab 순서:
1. 로고/홈 (옵션)
2. 메인 네비게이션
3. 콘텐츠 (위에서 아래로)
4. 푸터 링크

Focus 표시:
- 테두리: 2px 파랑 (#1E5BA0)
- Outline: 2px offset
- 모든 버튼, 링크, 입력 필드에 적용
```

### 8.3 스크린 리더 대응

```
- 이미지: alt 텍스트 필수
- 버튼: aria-label (필요시)
- 폼: <label> 태그 연결 (for 속성)
- 제목: <h1>, <h2>, <h3> 순서대로 사용
- 리스트: <ul>, <ol> 태그 사용
```

---

## 9. 기본 컴포넌트 사용 예시

### 9.1 폼 페이지 구성

```
1. 제목 (H2): "상담 신청"
2. 설명 (Body S): "아래 정보를 입력하고 전문가를 찾아보세요"
3. ---
4. 라벨 "상담 유형" → Select
5. 라벨 "상담 내용" → Textarea
6. 라벨 "희망 언어" → Checkbox (다중선택)
7. ---
8. 버튼: "다음 단계" (Primary Large)
9. 링크: "뒤로 가기" (텍스트)
```

### 9.2 카드 리스트 페이지

```
1. 필터 바
   - 검색 입력 (Search Icon)
   - 정렬 Dropdown
   
2. 결과 카드 (반복)
   - 카드 헤더: 직종 (H3) + 배지 (상태)
   - 카드 바디: 회사, 급여, 위치
   - 카드 푸터: 버튼 ("자세히 보기" Secondary)
```

### 9.3 알림 메시지

```
성공: 상담이 신청되었습니다! (Alert Success)
에러: 결제 처리에 실패했습니다. (Alert Error)
경고: 마감일까지 2일 남았습니다. (Alert Warning)
정보: 새로운 지원 프로그램이 추가되었습니다. (Alert Info)
```

---

## 10. 다국어 고려사항 (Localization)

### 10.1 텍스트 길이

```
한국어:   평균 10자 / 영어: 평균 15자
→ 레이아웃에 최소 120% 여백 확보

예시:
버튼 텍스트 한국어: "신청하기" (4자)
버튼 텍스트 영어: "Apply" (5자)
→ 버튼 최소 너비: 120px
```

### 10.2 폰트 설정

```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
/* Pretendard 없으면 시스템 폰트 폴백 */
```

---

## 11. 모니터링 & 개선

### 11.1 디자인 검증 체크리스트

- [ ] 모든 버튼에 hover 상태 확인
- [ ] 모든 입력 필드에 focus 상태 확인
- [ ] 에러 메시지 색상 + 텍스트 (색상만 아님)
- [ ] 모바일/태블릿/데스크톱 반응형 확인
- [ ] 색상 대비 4.5:1 이상 확인 (contrast checker)
- [ ] Tab 키로 모든 요소 접근 가능 확인

---

**문서 관리**  
- 최종 검토: 디자인팀, 개발팀
- 버전 관리: 새 컴포넌트 추가 시 업데이트
- 변경 이력: 색상/폰트 변경 시 기록
