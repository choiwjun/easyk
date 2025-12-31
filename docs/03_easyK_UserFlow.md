# easyK User Flow (사용자 흐름도)

**문서 버전**: v1.0  
**작성일**: 2025-12-30  
**프로젝트**: easyK (외국인 맞춤형 정착 지원 플랫폼)

---

## User Flow 개요

이 문서는 easyK 플랫폼의 **3가지 핵심 사용자 여정(User Journey)**을 시각화합니다.
- FEAT-1: 법률 상담 신청 및 매칭
- FEAT-2: 일자리 검색 및 지원
- FEAT-3: 정부 지원 정보 조회

각 흐름은 사용자가 목표를 달성하는 전체 경로와 분기점(의사결정 지점)을 포함합니다.

---

## 1. FEAT-1: 법률 상담 신청 & 매칭 흐름

### 외국인 사용자 - 상담 신청 흐름

```mermaid
graph TD
    Start([앱 시작]) --> CheckLogin{로그인<br/>되었나?}
    
    CheckLogin -->|아니오| Login[로그인/회원가입]
    Login --> ProfileSetup[프로필 작성<br/>국적, 비자종류, 언어]
    ProfileSetup --> ProfileSaved[프로필 저장]
    
    CheckLogin -->|예| Dashboard[대시보드]
    ProfileSaved --> Dashboard
    
    Dashboard --> ConsultRequest[상담 신청<br/>클릭]
    ConsultRequest --> SelectType{상담<br/>유형<br/>선택}
    
    SelectType -->|비자 관련| VisaForm["비자 상담 폼<br/>(문제 입력,<br/>희망 변호사)"]
    SelectType -->|근로 관련| LaborForm["근로 상담 폼<br/>(계약, 임금, 분쟁)"]
    SelectType -->|계약/기타| ContractForm["기타 상담 폼"]
    
    VisaForm --> SubmitForm["상담 내용 확인<br/>& 제출"]
    LaborForm --> SubmitForm
    ContractForm --> SubmitForm
    
    SubmitForm --> Processing["상담 신청 처리<br/>(DB 저장)"]
    Processing --> Matching["변호사 자동<br/>조건 기반 매칭"]
    
    Matching --> NotifyWaiting["신청자에게<br/>대기 안내 알림<br/>(이메일)"]
    NotifyWaiting --> WaitingState["상태: 매칭 대기중"]
    
    WaitingState --> ConsultantAccept{변호사가<br/>수락?}
    
    ConsultantAccept -->|승인| AcceptNotify["신청자에게<br/>승인 알림<br/>+ 예약 화면"]
    ConsultantAccept -->|거절| RejectedNotify["거절 알림<br/>+ 대체 변호사<br/>재추천"]
    
    RejectedNotify --> WaitingState
    
    AcceptNotify --> Schedule["상담 예약<br/>(날짜/시간 선택)"]
    Schedule --> PaymentReady["결제 화면<br/>상담료: 예정 가격"]
    
    PaymentReady --> PaymentGateway["결제 게이트웨이<br/>(토스)"]
    PaymentGateway --> PaymentCheck{결제<br/>성공?}
    
    PaymentCheck -->|실패| PaymentFail["결제 실패 안내<br/>& 재시도"]
    PaymentFail --> PaymentReady
    
    PaymentCheck -->|성공| PaymentSuccess["결제 완료"]
    PaymentSuccess --> Confirmation["예약 확정<br/>확인 이메일 발송"]
    
    Confirmation --> WaitingConsult["상담 예정일까지<br/>대기"]
    WaitingConsult --> ConsultationDay["상담 진행<br/>(이메일/문서 교환)"]
    
    ConsultationDay --> ConsultComplete["상담 완료"]
    ConsultComplete --> ReviewPrompt["평가 및 후기<br/>작성 유도"]
    
    ReviewPrompt --> ReviewSubmit{후기<br/>작성?}
    ReviewSubmit -->|작성| Review["⭐ 평점/리뷰 작성"]
    ReviewSubmit -->|미작성| NoReview["스킵"]
    
    Review --> End([완료])
    NoReview --> End
    
    style Start fill:#90EE90
    style End fill:#FFB6C6
    style Processing fill:#87CEEB
    style ConsultComplete fill:#FFD700
```

---

### 전문가(변호사) - 상담 요청 수락 흐름

```mermaid
graph TD
    Start([전문가 대시보드]) --> CheckRequest["새로운 상담<br/>요청 확인"]
    
    CheckRequest --> RequestReceived["상담 요청 알림<br/>수신"]
    RequestReceived --> ViewDetails["요청 상세 조회<br/>의뢰인 정보,<br/>문제 내용"]
    
    ViewDetails --> Decision{상담<br/>수락?}
    
    Decision -->|수락| Accept["상담 수락"]
    Decision -->|거절| Reject["상담 거절<br/(사유 입력)"]
    Decision -->|보류| Hold["나중에 검토"]
    
    Accept --> UpdateStatus["상태: 매칭 확인됨"]
    UpdateStatus --> NotifyClient["의뢰인에게<br/>수락 알림 발송"]
    
    NotifyClient --> WaitPayment["결제 대기<br/>의뢰인이 결제"]
    WaitPayment --> PaymentConfirm{결제<br/>확인?}
    
    PaymentConfirm -->|완료| PaymentDone["결제 완료<br/>확인"]
    PaymentConfirm -->|미완료| ReminderEmail["상기 이메일<br/>발송"]
    
    ReminderEmail --> WaitPayment
    
    PaymentDone --> ScheduleWait["의뢰인 예약<br/>대기"]
    ScheduleWait --> ScheduleReceived["예약 시간 확인"]
    
    ScheduleReceived --> ConsultReady["상담 준비<br/>(자료 정리)"]
    ConsultReady --> ConsultPerform["상담 진행<br/>(이메일 또는<br/>문서 교환)"]
    
    ConsultPerform --> ConsultEnd["상담 종료"]
    ConsultEnd --> RequestFeedback["의뢰인 피드백<br/>대기"]
    
    RequestFeedback --> FeedbackReceived["평가/후기<br/>수신"]
    FeedbackReceived --> UpdateRating["프로필 평점<br/>자동 업데이트"]
    
    UpdateRating --> End([대기중])
    
    Reject --> RejectedEnd([대기중])
    Hold --> HoldEnd([대기중])
    
    style Start fill:#90EE90
    style ConsultEnd fill:#FFD700
    style UpdateRating fill:#87CEEB
```

---

## 2. FEAT-2: 일자리 검색 & 지원 흐름

### 외국인 사용자 - 일자리 검색 및 지원

```mermaid
graph TD
    Start([앱 시작]) --> Dashboard["대시보드"]
    Dashboard --> JobTab["일자리 탭 클릭"]
    
    JobTab --> JobList["일자리 목록 조회<br/>(고양시 공고)"]
    JobList --> SearchFilter["검색/필터링<br/>직종, 급여,<br/>고용형태"]
    
    SearchFilter --> FilterResult["필터된 결과<br/>표시"]
    FilterResult --> ViewJob{공고<br/>상세<br/>조회?}
    
    ViewJob -->|조회| JobDetail["공고 상세 페이지<br/>요구사항, 급여,<br/>회사정보"]
    ViewJob -->|스킵| FilterResult
    
    JobDetail --> JobDecision{지원<br/>하시겠어요?}
    
    JobDecision -->|예| SaveJob["관심 공고<br/>저장<br/>(찜하기)"]
    SaveJob --> ApplyForm["지원 폼 작성<br/>이력서, 자기소개,<br/>추가정보"]
    
    JobDecision -->|아니오| BackToList["목록으로<br/>돌아가기"]
    BackToList --> FilterResult
    
    ApplyForm --> ReviewApply["지원 정보<br/>최종 확인"]
    ReviewApply --> SubmitApply["지원 제출"]
    
    SubmitApply --> Confirmation["지원 완료<br/>확인 메시지"]
    Confirmation --> MyApplication["지원 내역에<br/>자동 추가"]
    
    MyApplication --> ApplicationTracking["지원 상태 추적<br/>신청 중/진행 중/채용됨/거절"]
    
    ApplicationTracking --> HRUpdate{채용담당자<br/>피드백<br/>도착?}
    
    HRUpdate -->|채용| Hired["축하합니다!<br/>채용 확정<br/>알림"]
    HRUpdate -->|거절| Rejected["아쉽지만 거절<br/>이유 제시(선택)"]
    HRUpdate -->|미응답| Waiting["응답 대기 중<br/>(3일 경과 안내)"]
    
    Hired --> End([프로세스 종료])
    Rejected --> End
    Waiting --> End
    
    style Start fill:#90EE90
    style End fill:#FFB6C6
    style Confirmation fill:#FFD700
    style ApplyForm fill:#87CEEB
```

---

### 지자체 담당자 - 일자리 공고 관리

```mermaid
graph TD
    Start([지자체 관리자 로그인]) --> AdminDash["관리자 대시보드"]
    AdminDash --> JobManage["일자리 관리<br/>메뉴"]
    
    JobManage --> NewJob["새 공고 등록<br/>클릭"]
    NewJob --> JobForm["공고 작성 폼<br/>직종, 급여, 자격,<br/>회사명, 근무지"]
    
    JobForm --> Preview["공고 미리보기<br/>확인"]
    Preview --> Publish["공고 발행<br/>(공개)"]
    
    Publish --> Published["공고 게시 완료"]
    Published --> ExistingJobs["전체 공고 목록<br/>조회"]
    
    ExistingJobs --> ManageAction{관리<br/>액션}
    
    ManageAction -->|수정| EditJob["공고 수정"]
    ManageAction -->|마감| CloseJob["모집 마감<br/>(공고 비활성화)"]
    ManageAction -->|삭제| DeleteJob["공고 삭제"]
    ManageAction -->|지원자 조회| ViewApplicant["지원자 목록<br/>조회"]
    
    EditJob --> Update["변경사항 저장"]
    Update --> ExistingJobs
    CloseJob --> ExistingJobs
    DeleteJob --> ExistingJobs
    
    ViewApplicant --> ApplicantList["지원자 목록<br/>이름, 이메일,<br/>지원 날짜"]
    
    ApplicantList --> SelectApplicant{지원자<br/>선택}
    SelectApplicant -->|상세 조회| ApplicantDetail["지원자 프로필<br/>이력서, 자기소개"]
    SelectApplicant -->|응답| SendFeedback["피드백 발송<br/>채용/거절"]
    
    ApplicantDetail --> Feedback{채용<br/>결정}
    Feedback -->|채용| HireSend["채용 확정<br/>알림 발송"]
    Feedback -->|거절| RejectSend["거절 알림<br/>발송"]
    
    HireSend --> Update
    RejectSend --> Update
    SendFeedback --> Update
    
    Update --> Report["통계 대시보드<br/>지원율, 채용율,<br/>투명성 리포트"]
    
    Report --> End([관리 종료])
    
    style Start fill:#90EE90
    style End fill:#FFB6C6
    style Publish fill:#FFD700
    style ViewApplicant fill:#87CEEB
```

---

## 3. FEAT-3: 정부 지원 정보 조회 흐름

### 외국인 사용자 - 정부 지원 조회

```mermaid
graph TD
    Start([앱 시작]) --> Dashboard["대시보드"]
    Dashboard --> SupportTab["정부 지원<br/>탭 클릭"]
    
    SupportTab --> SupportList["정부 지원<br/>프로그램 목록<br/>(카테고리별)"]
    
    SupportList --> Category{지원<br/>카테고리<br/>선택}
    
    Category -->|장려금| SubsidyList["취업장려금,<br/>정착금,<br/>교육비 지원"]
    Category -->|교육| EducationList["한국어 교실,<br/>직무 교육,<br/>자격증 과정"]
    Category -->|훈련| TrainingList["직업훈련,<br/>기술 인증"]
    
    SubsidyList --> ProgramDetail
    EducationList --> ProgramDetail
    TrainingList --> ProgramDetail
    
    ProgramDetail["프로그램 상세<br/>대상, 신청 조건,<br/>지원 내용,<br/>신청 방법"]
    
    ProgramDetail --> Eligibility{자격<br/>확인<br/>해야함?}
    
    Eligibility -->|확인| CheckForm["자격 확인 폼<br/>비자 종류, 거주지,<br/>나이, 경력"]
    Eligibility -->|스킵| ApplicationInfo["신청 정보<br/>안내"]
    
    CheckForm --> CheckResult{자격<br/>충족?}
    
    CheckResult -->|예| Eligible["✅ 자격 있음<br/>신청 가능"]
    CheckResult -->|아니오| NotEligible["❌ 아직 해당 없음"]
    
    Eligible --> ApplicationInfo
    NotEligible --> Alternative["유사 지원<br/>프로그램<br/>추천"]
    Alternative --> End1([종료])
    
    ApplicationInfo --> ApplyGuide["신청 가이드<br/>필요 서류,<br/>신청처,<br/>마감일"]
    
    ApplyGuide --> GetDoc{서류<br/>준비<br/>필요?}
    
    GetDoc -->|필요| DocDownload["서류 템플릿<br/>다운로드"]
    GetDoc -->|완료| ApplyDirect["신청처 안내<br/>전화, 웹사이트,<br/>방문"]
    
    DocDownload --> ApplyDirect
    
    ApplyDirect --> Contact["신청처 연결<br/>(외부 링크)"]
    
    Contact --> ApplySubmit["신청 제출<br/>(외부에서)"]
    ApplySubmit --> Tracking["플랫폼에서<br/>신청 상태 추적<br/>(선택사항)"]
    
    Tracking --> End([완료])
    
    style Start fill:#90EE90
    style End fill:#FFB6C6
    style End1 fill:#FFB6C6
    style Eligible fill:#FFD700
    style ApplyGuide fill:#87CEEB
```

---

## 사용자 여정 요약 (User Journey Map)

### 터치포인트별 통증점 & 해결책

| Phase | 터치포인트 | 사용자 통증 | easyK 해결책 |
|-------|-----------|-----------|------------|
| **인식(Awareness)** | 플랫폼 발견 | "어디서 찾나?" | 지자체/커뮤니티 마케팅 |
| **가입(Registration)** | 회원가입 | "복잡하고 오래 걸려" | 3 필드 최소 가입, 소셜 로그인 |
| **탐색(Exploration)** | 대시보드 | "뭘 해야 하지?" | 직관적 네비게이션, 가이드 투어 |
| **신청(Application)** | 폼 작성 | "무슨 정보를 써야?" | 예시 텍스트, 필수/선택 표시 |
| **대기(Waiting)** | 매칭 대기 | "얼마나 기다려야?" | 실시간 상태 업데이트, 예상 시간 안내 |
| **결제(Payment)** | 결제 게이트웨이 | "안전한가?" | 신뢰 배지, 환불 정책 명시 |
| **소비(Consumption)** | 상담 진행 | "어떻게 진행되나?" | 확인 이메일, 가이드 제공 |
| **평가(Feedback)** | 후기 작성 | "시간이 없어" | 모바일 최적화, 짧은 양식 |

---

**문서 관리**  
- 최종 검토: 제품팀, UX 팀
- 버전 관리: 기능 추가 시 User Flow 업데이트
- 변경 이력: 사용자 피드백 반영 시 기록
