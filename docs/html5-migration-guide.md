# iGaming HTML5 모바일 앱 마이그레이션 가이드

## 목차

1. 개요
2. 기술 스택 추천
3. QA 체크리스트 기반 기능 매핑표
4. 기능별 상세 명세
5. 아키텍처 매핑 가이드
6. API 엔드포인트 전체 목록
7. 실시간 통신 프로토콜 명세
8. 데이터 모델 정의 (TypeScript)
9. 마이그레이션 로드맵

---

## 1. 개요

### 1.1 마이그레이션 배경

현재 iGaming 플랫폼은 **Unity 2022.3 (C#)** 기반 네이티브 모바일 앱으로 구현되어 있으며, **HTML5 기반 설치형 모바일 앱**으로 전환하여 크로스 플랫폼 배포 효율성을 높이고자 함. 웹 기술(HTML/CSS/JS)로 개발하되, 네이티브 래퍼를 통해 앱스토어 배포 및 네이티브 기능 접근이 가능한 설치형 앱으로 제공.

### 1.2 현재 시스템 요약

| 항목 | 현재 |
|------|------|
| **엔진** | Unity 2022.3.5f1 |
| **언어** | C# |
| **비동기 처리** | UniTask (async/await) |
| **상태 관리** | UniRx (ReactiveProperty) |
| **HTTP 클라이언트** | Best.HTTP (커스텀 ApiService 래퍼) |
| **실시간 통신** | Socket.IO (Best.SocketIO) + STOMP (Best.WebSockets) |
| **에셋 관리** | Addressable Asset System |
| **로컬라이제이션** | Unity.Localization |
| **슬롯 게임** | WebView (Vuplex) 내 iframe 로드 |
| **애니메이션** | Spine (spine-unity), DOTween |
| **UI** | Unity UGUI (Canvas) |

### 1.3 대상 플랫폼

- **HTML5 기반 설치형 모바일 앱** (앱스토어/플레이스토어 배포)
- 네이티브 래퍼: **Capacitor** (추천) 또는 Android TWA + iOS WKWebView
- 반응형 모바일 우선 설계 (Portrait 기본)
- 네이티브 기능 접근: 푸시 알림, 딥링크, 앱 업데이트, 생체 인증 등

---

## 2. 기술 스택 추천

### 2.1 추천 스택

| 영역 | 추천 기술 | 대체하는 Unity 기술 | 추천 근거 |
|------|----------|-------------------|----------|
| **프레임워크** | React 18+ / Next.js | Unity UGUI | 컴포넌트 기반 UI, SSR 지원, 생태계 |
| **언어** | TypeScript | C# | 타입 안전성, 기존 데이터 모델 매핑 용이 |
| **상태 관리** | Zustand | UniRx ReactiveProperty | 경량, React 친화적, 구독 패턴 |
| **HTTP** | Axios / fetch API | Best.HTTP (ApiService) | 표준 웹 API, 인터셉터 지원 |
| **실시간 (Socket)** | socket.io-client | Best.SocketIO | 공식 클라이언트, 동일 프로토콜 |
| **실시간 (STOMP)** | @stomp/stompjs | Best.WebSockets + STOMP | WebSocket 위 STOMP 프로토콜 |
| **라우팅** | React Router v6 | 씬 전환 (IGamingSceneManager) | SPA 내비게이션 |
| **스타일** | Tailwind CSS / CSS Modules | Unity UGUI Layout | 유틸리티 우선 CSS |
| **애니메이션** | Spine Web Runtime (pixi-spine) | spine-unity | 동일 Spine 에셋 재사용 |
| **UI 애니메이션** | Framer Motion / GSAP | DOTween | 성능 좋은 웹 애니메이션 |
| **로컬라이제이션** | i18next + react-i18next | Unity.Localization | 산업 표준, 다국어 |
| **슬롯 게임** | iframe | Vuplex WebView | 이미 iframe 지원 확인됨 |
| **네이티브 래퍼** | Capacitor | Unity Native Build | 앱스토어 배포, 네이티브 API 접근, 플러그인 생태계 |
| **빌드** | Vite | Unity Build System | 빠른 HMR, 최적 번들링 |
| **앱 빌드** | Capacitor CLI + Xcode/Android Studio | Unity Build Pipeline | iOS/Android 네이티브 빌드 |
| **테스트** | Vitest + Playwright | Unity Test Runner | 단위 + E2E |

### 2.2 프로젝트 구조 (추천)

```
src/
├── api/              # API 클라이언트 (REST, Socket.IO, STOMP)
│   ├── rest/         # Axios 인스턴스 + 엔드포인트별 모듈
│   ├── socket/       # Socket.IO 이벤트 핸들러
│   └── stomp/        # STOMP 이벤트 핸들러
├── stores/           # Zustand 상태 저장소
│   ├── authStore.ts
│   ├── balanceStore.ts
│   ├── gameStore.ts
│   └── ...
├── pages/            # 페이지 컴포넌트 (라우팅)
│   ├── LoginPage.tsx
│   ├── LobbyPage.tsx
│   ├── AccountPage.tsx
│   ├── CrashGamePage.tsx
│   └── ...
├── components/       # 재사용 UI 컴포넌트
│   ├── Header/
│   ├── CategoryBar/
│   ├── GameGrid/
│   ├── Bingo/
│   ├── DailyMission/
│   ├── Tournament/
│   └── ...
├── types/            # TypeScript 인터페이스
├── hooks/            # 커스텀 React 훅
├── utils/            # 유틸리티 함수
└── i18n/             # 로컬라이제이션 리소스

ios/                  # Capacitor iOS 네이티브 프로젝트
android/              # Capacitor Android 네이티브 프로젝트
capacitor.config.ts   # Capacitor 설정
```

### 2.3 네이티브 래퍼: Capacitor

HTML5로 개발하되 설치형 앱으로 배포하기 위해 **Capacitor**를 네이티브 래퍼로 사용.

| 항목 | 설명 |
|------|------|
| **역할** | HTML5 앱을 iOS/Android 네이티브 앱으로 패키징 |
| **웹뷰** | iOS: WKWebView, Android: Chrome WebView |
| **앱스토어 배포** | Xcode (iOS) / Android Studio (Android) 빌드 후 배포 |
| **네이티브 플러그인** | 푸시 알림, 딥링크, 생체 인증, 앱 업데이트, 상태바 제어 등 |
| **장점** | 웹 코드 100% 재사용, 네이티브 API 접근, 플러그인 생태계 풍부 |

**Capacitor 추천 근거** (vs Cordova, TWA, React Native):
- Cordova 대비: 최신 WebView 기본, 더 나은 TypeScript 지원, 활발한 유지보수
- TWA 대비: iOS 지원 포함, 네이티브 API 접근 범위 넓음
- React Native 대비: 기존 웹 코드 100% 재사용, 학습 비용 없음

**필요한 Capacitor 플러그인**:

| 플러그인 | 용도 | Unity 대응 기능 |
|---------|------|---------------|
| `@capacitor/push-notifications` | 푸시 알림 | Firebase Cloud Messaging |
| `@capacitor/app` | 앱 상태, 딥링크, 뒤로가기 | Application.deepLinkActivated |
| `@capacitor/status-bar` | 상태바 제어 | Screen.fullScreen |
| `@capacitor/splash-screen` | 스플래시 화면 | Unity Splash Screen |
| `@capacitor/keyboard` | 키보드 제어 | TouchScreenKeyboard |
| `@capacitor/haptics` | 진동 피드백 | Handheld.Vibrate |
| `@capacitor/browser` | 외부 URL 오픈 | Application.OpenURL |
| `capacitor-plugin-safe-area` | Safe Area 대응 | Screen.safeArea |

### 2.4 대안 스택: Flutter

React + Capacitor 외에 **Flutter**도 유력한 대안. 팀 역량과 프로젝트 우선순위에 따라 선택.

#### Flutter 스택 구성

| 영역 | Flutter 기술 | 대체하는 Unity 기술 |
|------|------------|-------------------|
| **프레임워크** | Flutter 3.x | Unity UGUI |
| **언어** | Dart | C# |
| **상태 관리** | Riverpod / Bloc | UniRx ReactiveProperty |
| **HTTP** | dio / http | Best.HTTP (ApiService) |
| **실시간 (Socket)** | socket_io_client | Best.SocketIO |
| **실시간 (STOMP)** | stomp_dart_client | Best.WebSockets + STOMP |
| **라우팅** | go_router | 씬 전환 (IGamingSceneManager) |
| **애니메이션** | spine-flutter (공식) | spine-unity |
| **UI 애니메이션** | Flutter Animation / Rive | DOTween |
| **로컬라이제이션** | flutter_localizations / easy_localization | Unity.Localization |
| **슬롯 게임** | webview_flutter (iframe 로드) | Vuplex WebView |
| **빌드** | Flutter CLI | Unity Build System |
| **테스트** | flutter_test + integration_test | Unity Test Runner |

#### React + Capacitor vs Flutter 비교

| 항목 | React + Capacitor | Flutter |
|------|-------------------|---------|
| **렌더링** | WebView (DOM/CSS) | Skia 엔진 (자체 렌더링) |
| **성능** | WebView 오버헤드 있음 | 네이티브에 준하는 60fps |
| **Crash 게임 애니메이션** | Canvas API (WebView 내) | CustomPainter (GPU 직접) |
| **Spine 지원** | pixi-spine (커뮤니티) | spine-flutter (공식 런타임) |
| **앱스토어 심사** | 하이브리드 앱 리스크 존재 | 네이티브 앱으로 인정 |
| **개발 생산성** | 웹 개발자 즉시 투입 가능 | Dart 학습 필요 (C#과 유사) |
| **Hot Reload** | Vite HMR (빠름) | Flutter Hot Reload (빠름) |
| **UI 커스터마이징** | CSS 자유도 높음 | Widget 기반 (픽셀 단위 제어) |
| **iframe 슬롯** | 네이티브 iframe 지원 | webview_flutter 위젯 필요 |
| **패키지 생태계** | npm (매우 풍부) | pub.dev (충분, 웹보다 적음) |
| **C# 코드 전환 난이도** | TypeScript로 재작성 | Dart로 재작성 (문법 유사) |
| **웹 동시 배포** | 동일 코드로 웹 배포 가능 | Flutter Web 가능 (성능 제한적) |

#### Flutter가 더 유리한 경우
- Crash 게임, Spine 애니메이션 등 **렌더링 성능이 중요**한 경우
- 앱스토어 심사에서 **하이브리드 앱 리젝 리스크**를 피하고 싶은 경우
- 팀에 **C#/Unity 경험자**가 많은 경우 (Dart 문법이 C#과 유사)
- 향후 **데스크탑(Windows/macOS)** 확장도 고려하는 경우

#### React + Capacitor가 더 유리한 경우
- 팀에 **웹 프론트엔드 개발자**가 이미 있는 경우
- 슬롯 게임 **iframe 연동**이 핵심이고, 웹 표준 호환이 중요한 경우
- **빠른 프로토타이핑**과 웹 배포 동시 지원이 필요한 경우
- 기존 웹 라이브러리/디자인 시스템을 활용하고 싶은 경우

---

## 3. QA 체크리스트 기반 기능 매핑표

QA 체크리스트 43개 항목을 기능 단위로 분류하고, Unity 구현과 HTML5 구현 방향을 매핑.

### 범례
- **복잡도**: 하(UI만) / 중(UI+API) / 상(UI+API+실시간)
- **Phase**: 구현 우선순위 (Phase 1/2/3)

| QA No | 카테고리 | 기능 | Unity 핵심 클래스 | HTML5 구현 방향 | 복잡도 | Phase |
|-------|---------|------|------------------|---------------|-------|-------|
| **공통 (로그인/접속)** |
| 1 | 공통 | 게임 설치 후 로그인 화면 노출 | `TitleSceneManager` | 앱스토어 설치 → Capacitor 앱 실행 → 로그인 페이지 | 중 | 1 |
| 2 | 공통 | 하단 업데이트 버전 확인 | `TitleSceneManager` | `@capacitor/app` getInfo()로 앱 버전 표시 | 하 | 1 |
| 3 | 공통 | 로그인 후 접속 | `NetworkManager_Login.GuestLogin()` | REST API 인증 + JWT | 중 | 1 |
| 4 | 공통 | 앱 종료 후 재 로그인 | `ApiPreferences.LastAccountAuthInfo` | localStorage 토큰 캐싱 | 중 | 1 |
| 5 | 공통 | 슬롯 로그인 | `SlotWebView`, `IGamingSceneManager` | iframe 슬롯 로드 | 중 | 1 |
| 6 | 공통 | 스핀 정상 동작 | `SpinResultEvent` (Socket.IO) | socket.io-client 이벤트 | 상 | 1 |
| **헤더 영역** |
| 7 | 헤더 | 보유 cash 노출 | `CoinUI`, `UserData.balance` | Zustand balanceStore 구독 | 하 | 1 |
| 8 | 헤더 | 클릭 시 Account 이동 | `TopUI.btnAccount` | React Router navigate | 하 | 1 |
| 9 | 헤더 | 볼트 아이콘 노출 | `VoltUI`, `UserData.voltCount` | Zustand + Badge 컴포넌트 | 하 | 1 |
| 10 | 헤더 | 볼트 페이지 이동 | `TopUI.btnVolt` | React Router navigate | 하 | 2 |
| 11 | 헤더 | 프로필 → Account 이동 | `TopUI.imgProfile` | 프로필 아바타 + navigate | 하 | 1 |
| **My Account** |
| 12 | Account | Profile 페이지 노출 | `AccountPanel_ProfilePage` | 프로필 페이지 컴포넌트 | 중 | 1 |
| 13 | Account | Earned 탭 노출 | `AccountPanel_HistoryPage` | 히스토리 탭 + API 호출 | 중 | 2 |
| **카테고리 & 플로팅** |
| 14 | 카테고리 | 카테고리 노출 | `CategoryTopButtons`, `LobbyContainer` | 탭 네비게이션 컴포넌트 | 중 | 1 |
| 15 | 카테고리 | 필터 버튼 노출 | `FloatingButtons`, `FilterPage` | 필터 모달 컴포넌트 | 중 | 1 |
| 16 | 카테고리 | 필터 페이지 이동 | `FilterPage` | 모달/바텀시트 | 중 | 1 |
| 17 | 카테고리 | 검색 아이콘 노출 | `FloatingButtons` | 검색 버튼 컴포넌트 | 하 | 1 |
| 18 | 카테고리 | 검색 페이지 이동 | `SearchPopup` | 검색 모달 + API | 중 | 1 |
| **빙고 (Housey)** |
| 19 | 빙고 | 빙고 아이콘 출력 | Bottom UI | 하단 네비게이션 아이콘 | 하 | 2 |
| 20 | 빙고 | 빙고 페이지 출력 | `BritishBingo` | 빙고 페이지 컴포넌트 | 중 | 2 |
| 21 | 빙고 | DRAW 진행 | `NetworkManager_Bingo.RequestBingoPlay()` | REST API + 애니메이션 | 중 | 2 |
| 22 | 빙고 | 매칭 동작 | `BritishBingo` (그리드 로직) | DOM 그리드 + 매칭 로직 | 중 | 2 |
| **데일리 미션** |
| 23 | 데일리미션 | 아이콘 출력 | Bottom UI | 하단 네비게이션 아이콘 | 하 | 2 |
| 24 | 데일리미션 | 미션 페이지 출력 | `DailyMission` | 미션 리스트 컴포넌트 | 중 | 2 |
| 25 | 데일리미션 | 게이지 정상 증가 | `DailyMissionBar` | 프로그레스 바 + 애니메이션 | 중 | 2 |
| **토너먼트** |
| 26 | 토너먼트 | 관리자 셋팅 → 시작 | 서버 사이드 | 서버 사이드 (변경 없음) | - | 2 |
| 27 | 토너먼트 | 노출 확인 | `TournamentPanel` | 토너먼트 배너 컴포넌트 | 중 | 2 |
| 28 | 토너먼트 | 페이지 노출 | `TournamentPanel` | 토너먼트 페이지 | 중 | 2 |
| 29 | 토너먼트 | 포인트 증가 확인 | `SpinData.tournamentPoint` | 스핀 결과에서 포인트 반영 | 중 | 2 |
| **Viccon & Ticket** |
| 30 | Viccon | 로비 Viccon UI 출력 | `VicconUI`, `MainCategory` | Viccon 위젯 컴포넌트 | 중 | 3 |
| 31 | Viccon | Viccon 페이지 출력 | `VicconPanel` | Viccon 페이지 + 게임 그리드 | 중 | 3 |
| 32 | Viccon | Viccon 슬롯 진입 | `VicconSlotEnter` API | iframe 로드 + API | 중 | 3 |
| 33 | Viccon | Crash 게임 진입 | `VicconCrashEnter` API | Crash 페이지 라우팅 | 상 | 3 |
| 34 | Ticket | 로비 Ticket UI 출력 | `TicketCountUI`, `TicketGaugeUI` | Ticket 위젯 컴포넌트 | 하 | 3 |
| 35 | Ticket | Ticket 페이지 출력 | `TicketPanel` | Ticket 페이지 컴포넌트 | 중 | 3 |
| 36 | Ticket | 스핀 시 게이지 증가 | `SpinData.ticketGauge` | 스핀 결과에서 게이지 반영 | 중 | 3 |
| **Volt** |
| 37 | Volt | Volt 페이지 출력 | `SecondaryGoodsPanel` | Volt 인벤토리 페이지 | 중 | 3 |
| 38 | Volt | 리소스 출력 | `VoltUI`, 아이템 그리드 | Volt 아이템 카드 그리드 | 중 | 3 |
| **Crash 게임** |
| 39 | Crash | 게임 진입 | `CrashGame`, Socket.IO | Crash 페이지 + 소켓 연결 | 상 | 3 |
| 40 | Crash | 연출/사운드 출력 | Spine, AudioSource | pixi-spine + Web Audio | 상 | 3 |
| 41 | Crash | 로켓 상승 연출 | Spine 애니메이션 | Canvas/pixi-spine | 상 | 3 |
| 42 | Crash | 배수 증가 연출 | UI 텍스트 + 색상 변화 | CSS 애니메이션 + 텍스트 | 중 | 3 |
| 43 | Crash | 베팅 동작 | `CrashSet` API + Socket.IO | REST + socket.io-client | 상 | 3 |

---

## 4. 기능별 상세 명세

### 4.1 로그인 & 인증

#### 현재 Unity 구현
- **진입점**: `TitleSceneManager.Start()` → `NetworkManager.ServerInfo()` → 로그인 UI
- **게스트 로그인**: `NetworkManager.GuestLogin()` → `CreateGuest` API → `ProcessLogin()` → `ProcessEnterLobby()`
- **계정 캐싱**: `ApiPreferences.LastAccountAuthInfo` (JSON, PlayerPrefs 저장)
- **토큰**: `ApiConst.SetAuthToken` → 모든 API 요청 헤더에 포함

#### 로그인 플로우
```
[앱 시작]
  → ServerInfo API 호출
  → 캐시된 계정 확인 (LastAccountAuthInfo)
  → 없으면 CreateGuest API → 계정 생성
  → Login API (authid) → JWT 토큰 수신
  → EnterLobby API → 로비 데이터 수신
  → Socket.IO / STOMP 연결
  → 로비 씬 로드
```

#### HTML5 구현 방향
- `fetch`/`axios`로 동일 API 호출
- JWT 토큰은 `localStorage`에 저장 (자동 로그인용)
- API 인터셉터에서 토큰 자동 주입
- 로비 데이터 수신 후 SPA 라우팅으로 전환

#### 관련 API
| 순서 | 엔드포인트 | 설명 |
|------|----------|------|
| 1 | `account/server_info` | 서버 상태 확인 |
| 2 | `account/create_guest` | 게스트 계정 생성 |
| 3 | `account/login` | 로그인 (JWT 토큰 발급) |
| 4 | `game/enter_lobby` | 로비 진입 (유저 데이터) |

---

### 4.2 헤더 영역 (Balance, Volt, Profile)

#### 현재 Unity 구현
- **TopUI.cs**: 헤더 컨테이너 (Balance, Volt, Profile 버튼)
- **CoinUI.cs**: `UserData.Instance.balance` (ReactiveProperty) 구독 → `£ #,##0.00` 포맷
- **VoltUI.cs**: `UserData.Instance.voltCount` 구독 → 99+ 표시
- **StickyHeader.cs**: 스크롤 시 헤더 고정/해제

#### 데이터 바인딩
```
서버 응답 → UserData.Instance.SetData(balanceInfo)
  → balanceCash.Value = balanceInfo.cash
  → balanceBonus.Value = balanceInfo.bonus
  → balance.Value = cash + bonus
  → CoinUI 자동 갱신 (ReactiveProperty 구독)
```

#### HTML5 구현 방향
```tsx
// Zustand store
const useBalanceStore = create((set) => ({
  cash: 0,
  bonus: 0,
  balance: 0,
  setBalance: (data) => set({ cash: data.cash, bonus: data.bonus, balance: data.cash + data.bonus })
}));

// 컴포넌트
function Header() {
  const balance = useBalanceStore(s => s.balance);
  return <div>£ {(balance / 1000).toFixed(2)}</div>;
}
```

> **주의**: 서버에서 받은 금액은 1000 단위로 나누어 표시 (예: 서버 100000 → 표시 £100.00)

---

### 4.3 카테고리 & 네비게이션

#### 현재 Unity 구현
- **LobbyContainer.cs**: 메인 로비 오케스트레이터
- **CategoryTopButtons.cs**: 가로 스크롤 카테고리 탭 (Home, Hot, Slot, Live, Promo, My Pick)
- **MainCategory.cs**: 홈 페이지 (랭킹, 추천)
- **GameCategory.cs**: 개별 카테고리 (2~3열 그리드, 가상화 스크롤)
- **MyPickCategory.cs**: 즐겨찾기 (`FavoriteData`, PlayerPrefs)

#### 데이터 소스
- 카테고리 목록: `GamesCategories` (로컬 JSON 또는 API)
- 게임 목록: `GamesResult` (Dictionary<string, Game>)
- 즐겨찾기: `FavoriteData.LoadFromPlayerPrefs()`

#### HTML5 구현 방향
- 탭 네비게이션 + React Router
- 무한 스크롤 / 가상화 리스트 (react-virtuoso)
- 즐겨찾기: localStorage
- 검색: 디바운스 + 필터링

---

### 4.4 빙고 (Housey)

#### 현재 Unity 구현
- **BritishBingo.cs**: 메인 게임 UI (3개 티어: Bronze/Silver/Gold)
- **NetworkManager_Bingo.cs**: API 호출 래퍼

#### 게임 로직
1. `housey/read` → 현재 보드 상태 로드 (5x5 그리드, 15개 유효 번호)
2. Play 버튼 → `housey/play` (playCount=1) → 볼 번호 수신
3. 그리드 매칭: 수신 번호와 보드 비교 → 히트 마킹
4. 라인 체크: 가로 5개 매칭 → 라인 완성
5. 풀 하우스: 3줄 모두 완성 → 보상 수령
6. 스테이지 완료 → `housey/reset` → 새 보드

#### 데이터 모델
- `HouseyData`: houseyArray(5x5), houseyHitArray, hitLines, houseyHistory, type(1~3), endTime
- `HouseyAwardData`: awardType, awardValue

#### HTML5 구현 방향
- DOM 기반 5x5 그리드 (CSS Grid)
- 볼 드로우 애니메이션 (CSS transition)
- 타이머: endTime까지 카운트다운
- 자동 플레이: setInterval + API 호출

---

### 4.5 데일리 미션

#### 현재 Unity 구현
- **DailyMission.cs**: 미션 팝업 UI
- **DailyMissionBar.cs**: 개별 미션 프로그레스 바
- **DailyMissionManager.cs**: 미션 타입별 라우팅

#### 게임 로직
1. 팝업 열기 → `daily_mission/list` → 5개 미션 로드
2. 미션 진행: 슬롯 스핀, 빙고, Viccon 등 → 서버에서 자동 추적
3. 미션 완료 (status=2) → `daily_mission/collect` → 보상 수령
4. 전체 수집: `daily_mission/Collect_all`
5. 5개 모두 수집 → `daily_mission/complete` → 최종 보상
6. UTC 기준 매일 리셋

#### 미션 타입 (missionType)
| 값 | 타입 | 설명 |
|---|------|------|
| 1 | 슬롯 | 슬롯 스핀 N회 |
| 2 | 빙고 | 빙고 드로우 N회 |
| 3 | Viccon | Viccon 게임 플레이 |
| 4 | Volt | Volt 오픈 |
| 5 | Crash | 크래시 게임 |
| 6 | Ticket | 티켓 사용 |
| 7 | 토너먼트 | 토너먼트 참여 |
| 8 | 친구 | 친구 초대 |

#### HTML5 구현 방향
- 미션 리스트 컴포넌트 (5개 카드)
- 프로그레스 바: `width: ${progress}%` CSS transition
- 게이지: 5단계 체크박스 (0.2 씩 증가)
- 카운트다운 타이머 (endDate까지)

---

### 4.6 토너먼트

#### 현재 Unity 구현
- **TournamentPanel.cs**: Present(진행중) / Previous(이전) 탭
- **NetworkManager_Tournament.cs**: API 호출 + 180초 폴링

#### 게임 로직
1. `tournament/info` → 현재 토너먼트 + 랭킹 데이터
2. 슬롯 스핀 → 페이아웃에 따라 포인트 자동 적립
3. 180초 간격 폴링 → 랭킹 갱신
4. 토너먼트 종료 → `tournament/award` → 보상 팝업
5. `tournament/history` → 이전 토너먼트 결과

#### HTML5 구현 방향
- 리더보드 컴포넌트 (상위 100명)
- `setInterval(180000)` 폴링 또는 SSE
- 카운트다운 타이머 (endDate)
- 보상 타입: Cash / Viccon / Volt

---

### 4.7 Viccon & Ticket

#### Viccon (가상 화폐 게임)

**현재 구현**:
- `VicconPanel.cs`: 게임 목록 UI
- `NetworkManager_VicconGameData.cs`: 게임 목록 관리

**게임 타입**:
| 타입 | 값 | 설명 |
|------|---|------|
| Slot | 1 | Viccon 슬롯 게임 |
| Crash | 2 | 크래시 게임 |

**진입 플로우**:
```
Viccon 페이지 → 게임 선택
  → Slot: viccon/slot/enter API → iframe 로드
  → Crash: viccon/crash_enter API → Crash 게임 페이지
```

#### Ticket (티켓 시스템)

**현재 구현**:
- `TicketPanel.cs`: 티켓 사용 UI
- `TicketsData`: gauge, maxGauge, level, ticketList

**로직**:
- 슬롯 스핀 → 게이지 증가 (SpinData.ticketGauge)
- 게이지 만충 → 티켓 획득
- 티켓 사용 → `ticket/use` API → Viccon 보상

---

### 4.8 Volt (인벤토리)

#### 현재 Unity 구현
- `SecondaryGoodsPanel.cs`: 인벤토리 UI
- `NetworkManager_Volt.cs`: Volt 오픈 API

#### 볼트 타입
| voltType | 이름 |
|----------|------|
| 1x | Common (파랑) |
| 2x | Prime (초록) |
| 3x | Elite (보라) |
| 4x | Luxe (금색) |

#### 로직
1. `volt/list` → 보유 볼트 목록
2. 단일 오픈: `volt/open` (voltType) → VoltReward
3. 전체 오픈: `volt/open_all` (voltType) → VoltReward[]
4. 보상: vicconReward (Viccon) / coinReward (빙고 코인)

---

### 4.9 Crash 게임

#### 현재 Unity 구현
- **CrashGame.cs**: 메인 게임 컨트롤러
- **CrashGameSocketEvent.cs**: Socket.IO 이벤트 핸들러
- **통신**: REST API (베팅) + Socket.IO (실시간 상태)

#### 게임 라운드 상태
```
WAITING (10초) → START (5초 카운트다운) → BETCLOSED → PLAY/PLAYING → END
```

| 상태 | 값 | 설명 |
|------|---|------|
| WAITING | 0 | 대기 (베팅 가능) |
| START | 1 | 시작 카운트다운 |
| BETCLOSED | 2 | 베팅 마감 |
| PLAY | 3 | 진행 중 (로켓 상승) |
| PLAYING | 4 | 진행 중 |
| END | 5 | 라운드 종료 (크래시) |

#### 베팅 메커니즘
- **4개 베팅 슬롯** (betIndex 0~3)
- **수동 캐시아웃**: 플레이어가 원하는 배수에서 클릭
- **자동 캐시아웃**: autoMulti 설정 → 해당 배수 도달 시 자동 정산
- **보상**: betMoney × outMulti

#### 배수 색상 시스템
| 배수 범위 | 색상 |
|----------|------|
| 1.0x ~ 2.0x | 초록 |
| 2.0x ~ 5.0x | 시안 |
| 5.0x 이상 | 빨강 |

#### Socket.IO 이벤트 플로우
```
Client → crash_join → Server
  ← crash_join (roundIndex, currentState, betRank, hash)

Client → crashgame/bet (REST) → Server
  ← crash_bet (betRank[]) [broadcast]

Server → crash_state (tick, currentState) [매 틱마다]
  → 클라이언트 배수 계산

Client → crashgame/cashout (REST) → Server
  ← crash_cash_out [broadcast]

Server → crash_end (betRank[], cashOutRank[], hash)
  → 라운드 종료, 결과 표시
```

#### HTML5 구현 방향
- **Canvas**: 로켓 애니메이션 (pixi-spine 또는 Canvas 2D)
- **socket.io-client**: 실시간 상태 수신
- **배수 표시**: requestAnimationFrame으로 부드러운 업데이트
- **베팅 UI**: 4개 입력 필드 + 자동 캐시아웃 설정
- **리더보드**: 실시간 베팅/캐시아웃 랭킹

---

## 5. 아키텍처 매핑 가이드

### 5.1 패턴 매핑

| Unity 패턴 | 현재 구현 | HTML5 대응 | 비고 |
|-----------|----------|-----------|------|
| `SingletonClass<T>` | `NetworkManager`, `UserData`, `TableManager` | Context Provider / Zustand store | 전역 상태 관리 |
| `Singleton<T>` (MonoBehaviour) | `PopupManager` | React Portal + Context | UI 레이어 관리 |
| `ReactiveProperty<T>` | `UserData.balance`, `voltCount` 등 | Zustand selector / useSyncExternalStore | 구독 기반 UI 갱신 |
| `UniTask async/await` | 전체 비동기 흐름 | Promise / async-await | 1:1 대응 |
| `IObserver/IObservable` | `NetworkManager.NotifyObserver()` | EventEmitter / Store subscription | 컴포넌트 갱신 |
| `Addressables` | 에셋 번들 로딩 | Dynamic import / lazy loading | 코드 스플리팅 |
| `PopupManager` | 모달 스택 관리 | Modal Context + Portal | z-index 관리 |
| `L10N.String(key)` | `Unity.Localization` | `t(key)` (i18next) | 키 기반 번역 |
| `SlotWebView` | Vuplex WebView | iframe (Capacitor WebView 내) | 슬롯 게임 로드 |
| `Spine Animation` | spine-unity | pixi-spine / spine-ts | 동일 에셋 활용 |
| `DOTween` | UI 트윈 애니메이션 | Framer Motion / CSS transition | |
| `TableRepository` | JSON 테이블 다운로드 + 캐싱 | API fetch + React Query 캐싱 | |
| `ApiService.Resolve<T>()` | 제네릭 API 호출 | Axios 인스턴스 + 모듈화 | |
| `SceneManager` | 씬 전환 | React Router | SPA 라우팅 |
| Unity Native Build | iOS/Android 빌드 | Capacitor + Xcode/Android Studio | 앱스토어 배포 |
| `Application.OpenURL` | 외부 브라우저 | `@capacitor/browser` | 외부 링크 |
| `Handheld.Vibrate` | 진동 피드백 | `@capacitor/haptics` | 네이티브 API |
| `Screen.safeArea` | Safe Area 대응 | `capacitor-plugin-safe-area` + CSS env() | 노치 대응 |

### 5.2 상태 저장소 매핑

| Unity (UserData 필드) | Zustand Store | 갱신 시점 |
|----------------------|---------------|----------|
| `balance` | `balanceStore.balance` | 로그인, 스핀, 입금, STOMP WalletEvent |
| `balanceCash` | `balanceStore.cash` | 동일 |
| `balanceBonus` | `balanceStore.bonus` | 동일 |
| `viccon` | `balanceStore.viccon` | Viccon 게임 결과, 볼트 오픈 |
| `voltCount` | `voltStore.totalCount` | 볼트 획득/사용 |
| `ticketGaugeValue` | `ticketStore.gaugeValue` | 슬롯 스핀 |
| `ticketCount` | `ticketStore.count` | 티켓 획득/사용 |
| `bingoCoin` | `bingoStore.coin` | 빙고 DRAW |
| `bingoEndValue` | `bingoStore.endTime` | 로비 진입 |
| `dailyMissionValue` | `missionStore.hasCompletable` | 미션 상태 변경 |

---

## 6. API 엔드포인트 전체 목록

### 6.1 Account APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 1 | `ServerInfo` | `account/server_info` | - | ServerInfo |
| 2 | `CreateGuest` | `account/create_guest` | advertising_id, af_id, af_adflag, af_advid | AuthInfo (create_result) |
| 3 | `CreateDev` | `account/create_dev` | dev_id, password, advertising_id, af_id, af_adflag, af_advid | AuthInfo (create_result) |
| 4 | `CreatePlatform` | `account/create_platform` | auth_platform, platform_id, platform_token, advertising_id, af_id, af_adflag, af_advid | AuthInfo (create_result) |
| 5 | `Login` | `account/login` | authid, advertising_id, af_id, af_adflag, af_advid | LoginResult (login_result), AccountDeleteInfo (account_deletion) |
| 6 | `SuperNationLogin` | `account/login_supernation` | id, cookie, advId, afId | LoginResult (login_result) |
| 7 | `LoginMapping` | `account/login_mapping` | auth_platform, platform_id, platform_token | - |
| 8 | `ChangeNickname` | `account/change_nickname` | new_nickname | - |
| 9 | `DuplicateNickname` | `account/check_nickname_duplication` | nickname | - |
| 10 | `ChangeProfile` | `account/change_profile` | profileUrl | - |
| 11 | `PushToken` | `account/push_token` | push_token | - |
| 12 | `TermsAgreement` | `account/terms_agreement` | agreement | - |
| 13 | `AppTrackingAgreement` | `account/att_agreement` | att_agreement | - |
| 14 | `AccountDelete` | `account/delete` | message | AccountDeleteInfo |
| 15 | `AccountDeleteCancel` | `account/delete_cancel` | - | msg (string) |
| 16 | `ChangePassword` | `account/update/password` | currentPwd, changePwd | - |
| 17 | `CreateUser` | `user/create` | CreateUserParameter 객체 | - |
| 18 | `GetUserAccount` | `user/get` | startRank, size | GetUserAccountResponse |

### 6.2 Game APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 19 | `ApiSync` | `game/sync` | config_revision | - |
| 20 | `ApiEnterLobby` | `game/enter_lobby` | startRank, size | houseyEndDate, previousAwardData |
| 21 | `GamesList` | `games/list` | - | - |
| 22 | `GamesSearch` | `games/search` | text | - |
| 23 | `FavoriteCreate` | `games/favorite/create` | gameIdx | - |
| 24 | `FavoriteDelete` | `games/favorite/delete` | gameIdx | - |
| 25 | `SpinLog` | `spinlog` | start, end | - |

### 6.3 Crash Game APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 26 | `CrashJoin` | `crash/join` | - | CrashJoinResponse (roundHistory, userHistory) |
| 27 | `CrashSet` | `crashgame/bet` | betIndex, betMoney, autoMulti | - |
| 28 | `CrashCancel` | `crashgame/cancel` | betIndex | - |
| 29 | `CrashCashOut` | `crashgame/cashout` | betIndex | CrashCashResponse |
| 30 | `CrashCashAuto` | `crashgame/cashauto` | betIndex | CrashCashResponse |
| 31 | `CrashUserHistory` | `crashgame/user/history` | - | CrashUserHistoryResponse |
| 32 | `CrashRoundHistory` | `crashgame/round/history` | - | CrashRoundHistoryResponse |
| 33 | `CrashTopRank` | `crashgame/top_ranking` | category_type, category_date, size | CrashTopRankingResponse |
| 34 | `CrashRoundDetail` | `crashgame/round/detail` | roundIndex | CrashRoundDetailResponse |

### 6.4 Daily Mission APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 35 | `DailyMissionList` | `daily_mission/list` | - | DailyMissionGetResponse |
| 36 | `DailyMissionCollect` | `daily_mission/collect` | missionIndex | DailyMissionCollectResponse |
| 37 | `DailyMissionCollectAll` | `daily_mission/Collect_all` | - | DailyMissionCollectAllResponse |
| 38 | `DailyMissionComplete` | `daily_mission/complete` | - | DailyMissionCompleteResponse |

### 6.5 Housey (Bingo) APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 39 | `HouseyRead` | `housey/read` | - | HouseyReadResponse |
| 40 | `HouseyReset` | `housey/reset` | - | HouseyResetResponse |
| 41 | `HouseyPlay` | `housey/play` | playCount | HouseyPlayResponse |

### 6.6 Volt (Inventory) APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 42 | `VoltList` | `volt/list` | - | VoltListResponse |
| 43 | `VoltOpen` | `volt/open` | voltType | VoltOpenResponse |
| 44 | `VoltOpenAll` | `volt/open_all` | voltType | VoltOpenAllResponse |

### 6.7 Ticket APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 45 | `TicketList` | `ticket/list` | - | - |
| 46 | `TicketUse` | `ticket/use` | ticketIdx, award | TicketUseResponse |

### 6.8 Tournament APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 47 | `TournamentInfo` | `tournament/info` | withRank, startRank, size | TournamentResponse, TournamentInfoResponse |
| 48 | `TournamentAward` | `tournament/award` | - | TournamentAwardResponse |
| 49 | `TournamentRanking` | `tournament/ranking` | startRank, size, tournament_idx | TournamentRankingResponse |
| 50 | `TournamentHistory` | `tournament/history` | size | TournamentHistoryResponse |

### 6.9 History APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 51 | `cashHistory` | `history/cash` | startDate, endDate, type, order, page, pageSize | HistoryResponse |
| 52 | `bonusHistory` | `history/bonus` | startDate, endDate, type, order, page, pageSize | HistoryResponse |
| 53 | `vicconHistory` | `history/viccon` | startDate, endDate, type, order, page, pageSize | HistoryResponse |
| 54 | `ticketHistory` | `history/ticket` | startDate, endDate, type, order, page, pageSize | HistoryResponse |

### 6.10 Viccon APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 55 | `VicconSlotList` | `viccon/game/list` | - | VicconSlotListResponse |
| 56 | `VicconSlotEnter` | `viccon/slot/enter` | slotType | SlotLoginResponse |
| 57 | `VicconSlotSpin` | `viccon/slot/spin` | SpinParameter 객체 | - |
| 58 | `VicconCrashEnter` | `viccon/crash_enter` | slotIdx | - |
| 59 | `VicconCrashPlay` | `viccon/crash_play` | - | - |

### 6.11 Casino/Slot APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 60 | `SlotEnter` | `casino/slot/enter` | slotType | SlotLoginResponse |
| 61 | `SpinProtocol` | `casino/slot/spin` | SpinParameter 객체 | - |

### 6.12 Balance APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 62 | `Deposit` | `deposit` | type | - |

### 6.13 Log APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 63 | `ClientLog` | `log/client` | useridx, logLevel, category, message, call_stack | - |
| 64 | `ClientActionLog` | `log/client_action` | useridx, category, category_info, action, action_info, stay_time, isplaynow | - |

### 6.14 SuprNation APIs

| # | 클래스명 | 엔드포인트 | 파라미터 | 응답 모델 |
|---|---------|----------|---------|----------|
| 65 | `SuprGames` | `v1/games` | - | GamesResult |
| 66 | `SuprGamesCategories` | `v1/games/categories` | - | GamesCategories |
| 67 | `SuprGameDetail` | `v1/games/{slug}` | slug | GameDetail |
| 68 | `SuprGamesHistory` | `v1/games/history/{params}` | year/month/count/page | SuprGamesHistoryResponse |
| 69 | `StompInfo` | `v1/comet/info` | - | - |

---

## 7. 실시간 통신 프로토콜 명세

### 7.1 Socket.IO 이벤트

#### 연결 설정
- **서버**: MultiServerUrl (config에서 결정)
- **인증**: 연결 시 헤더에 JWT 토큰 포함
- **라이브러리**: Best.SocketIO (Unity) → socket.io-client (HTML5)

#### 이벤트 목록

| # | 이벤트명 | 방향 | 페이로드 | 기능 |
|---|---------|------|---------|------|
| 1 | `login` | C→S | - | 소켓 인증 |
| 2 | `join` | C→S | room: string | 방 입장 |
| 3 | `leave` | C→S | room: string | 방 퇴장 |
| 4 | `chat` | C↔S | room, message | 채팅 메시지 |
| **크래시 게임** |
| 5 | `crash_join` | S→C | roundIndex, currentState, tick, betRank[], hash, userCount | 게임 입장 |
| 6 | `crash_leave` | S→C | - | 게임 퇴장 |
| 7 | `crash_state` | S→C | roundIndex, currentState, tick, userCount, server_time | 상태 업데이트 (매 틱) |
| 8 | `crash_bet` | S→C | betRank[] | 베팅 브로드캐스트 |
| 9 | `crash_bet_change` | S→C | betRank[] | 베팅 변경 브로드캐스트 |
| 10 | `crash_bet_cancel` | S→C | - | 베팅 취소 |
| 11 | `crash_cash_out` | C↔S | nickname, multi | 캐시아웃 |
| 12 | `crash_end` | S→C | roundIndex, tick, hash, betRank[], cashOutRank[] | 라운드 종료 |
| 13 | `crash_chat` | C↔S | message / nickname+message | 크래시 채팅 |
| **슬롯 게임** |
| 14 | `slot_join` | C→S | slotIndex | 슬롯 입장 |
| 15 | `slot_leave` | C→S | slotIndex | 슬롯 퇴장 |
| 16 | `spin` | C→S | slotType, requestType, totalBet, coinIn, lineCount, betLevel, uid, extensions | 스핀 결과 |

#### Socket.IO 데이터 구조

```typescript
// BetRank (크래시 베팅 랭킹)
interface BetRank {
  betIndex: number;
  nickname: string;
  betMoney: number;    // long
  outMulti: number;
  outMoney: number;    // long
  profileUrl: string;
}

// SpinResult (슬롯 스핀 결과)
interface SpinResultMessage {
  cash: number;        // long
  bonus: number;       // long
  beforeCash: number;
  beforeBonus: number;
  voltType: number;
}
```

### 7.2 STOMP 이벤트

#### 연결 설정
- **서버**: SuprStompUrl (SuprNation WebSocket)
- **인증**: 세션 쿠키 기반
- **라이브러리**: Best.WebSockets + STOMP (Unity) → @stomp/stompjs (HTML5)

#### 이벤트 목록

| # | 구독 경로 | 구독 ID | 방향 | 페이로드 | 기능 |
|---|----------|--------|------|---------|------|
| 1 | `user/exchange/amq.direct/wallet` | sub-3 | S→C | StompWallet | 잔액 실시간 갱신 |
| 2 | `user/exchange/amq.direct/player` | sub-4 | S→C | (generic) | 플레이어 상태 업데이트 |

#### STOMP 데이터 구조

```typescript
interface StompWallet {
  balance: number;              // float
  bonusMoney: number;           // float
  currency: string;
  withdrawableBalance: number;  // float
  realBonusMoney: number;       // float
}
```

---

## 8. 데이터 모델 정의 (TypeScript)

### 8.1 Account & Auth

```typescript
// 인증 정보
interface AuthInfo {
  authid: string;
  accountidx: number;
  auth_platform: string;
}

// 로그인 결과
interface LoginResult {
  authid: string;
  accountidx: number;
  token: string;
  server_group: number;
  useridx: number;
}

// 계정 삭제 정보
interface AccountDeleteInfo {
  deleted: boolean;
  deleted_request_date: string;  // ISO 8601
  deleted_start_date: string;
}

// 회원가입 파라미터
interface CreateUserParameter {
  userId: string;
  password: string;
  email: string;
  securityQuestion: string;
  securityAnswer: string;
  gender: string;
  lastName: string;
  firstName: string;
  birthDate: string;
  adress: string;
  currency: string;
  promoCode: string;
  phoneNumber: string;
}
```

### 8.2 User & Balance

```typescript
// 유저 계정 정보
interface UserAccountData {
  id: string;
  profileUrl: string;
  email: string;
  nickname: string;
  gender: string;
  lastName: string;
  firstName: string;
  birthDate: string;  // ISO 8601
  adress: string;
  currency: string;
  phoneNumber: string;
}

// 잔액
interface BalanceData {
  cash: number;   // decimal (서버값 / 1000 = 표시값)
  bonus: number;  // decimal
}

// 코인 데이터
interface CoinData {
  viccon: number;  // decimal (서버값 / 1000 = 표시값)
  coin: number;    // long (빙고 코인)
}

// 게임 잔액 종합
interface GameBalanceData {
  coinInfo: CoinData;
  voltInfo: VoltData[];
  ticketInfo: TicketsData;
}

// 유저 계정 전체 응답
interface GetUserAccountResponse {
  userInfo: UserAccountData;
  balanceInfo: BalanceData;
  gameBalanceInfo: GameBalanceData;
  dailyMissionInfo: DailyMissionGetResponse;
  Tournament: TournamentResponse | null;
  houseyEndDate: string;  // ISO 8601
}
```

### 8.3 Volt

```typescript
interface VoltData {
  voltType: number;  // 1x=Common, 2x=Prime, 3x=Elite, 4x=Luxe
  count: number;
}

interface VoltReward {
  voltType: number;
  vicconReward: number;  // long
  coinReward: number;
}

interface VoltListResponse {
  voltInfo: VoltData[];
}

interface VoltOpenResponse {
  voltReward: VoltReward;
}

interface VoltOpenAllResponse {
  voltRewards: VoltReward[];
}
```

### 8.4 Ticket

```typescript
interface TicketsData {
  gauge: number;      // long
  maxGauge: number;   // long
  level: number;
  ticketList: TicketData[];
}

interface TicketData {
  ticketIdx: number;   // long
  ticketType: number;
  ticketName: string;
  imgUrl: string;
  value: number;       // long (서버값 / 1000 = 표시값)
  startDate: string;   // ISO 8601
  endDate: string;
}

interface TicketUseResponse {
  cash: number;  // long
}
```

### 8.5 Housey (Bingo)

```typescript
interface HouseyData {
  houseyHistory: number[];
  houseyArray: number[][];     // 5x5 그리드 (15 유효 + 12 빈칸)
  houseyHitArray: number[][];  // 히트 상태
  hitLines: number[];          // 완성된 라인 인덱스
  type: number;                // 1=Bronze, 2=Silver, 3=Gold
  resultNum: number[];         // 드로우 결과 번호
  activated: number;           // 1=활성, 0=비활성
  endTime: string | null;      // ISO 8601
}

interface HouseyAwardData {
  awardType: number;
  awardValue: number;  // long
}

interface HouseyReadResponse {
  houseyInfo: HouseyData;
}

interface HouseyPlayResponse {
  houseyInfo: HouseyData;
  awardInfo: HouseyAwardData;
}

interface HouseyResetResponse {
  houseyInfo: HouseyData;
}
```

### 8.6 Daily Mission

```typescript
interface DailyMissionGetResponse {
  dailyMissionInfos: DailyMissionInfo[];
  endDate: string;  // ISO 8601
  status: number;   // 1=진행중, 2=수집가능, 3=완료
}

interface DailyMissionInfo {
  missionIndex: number;
  name: string;
  content: string;
  minValue: number;
  maxValue: number;
  target: number;       // long (목표값)
  status: number;       // 1=미달성, 2=달성, 3=보상획득
  missionType: number;  // 1~8 (슬롯/빙고/Viccon/Volt/Crash/Ticket/토너먼트/친구)
  rewardValue: number;  // long
  rewardType: number;   // 1=coin, 2=viccon, 3=volt
}

interface DailyMissionCollectResponse {
  missionRewardType: number;
  missionRewardValue: number;  // long
}

interface DailyMissionCollectAllResponse {
  missionRewards: MissionRewardInfo[];
}

interface MissionRewardInfo {
  missionIndex: number;
  missionRewardType: number;
  missionRewardValue: number;  // long
}

interface DailyMissionCompleteResponse {
  voltType: number;
  voltValue: number;  // long
}
```

### 8.7 Tournament

```typescript
interface TournamentData {
  tournamentId: number;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  lstBenefitData: BenefitData[];
  lstRankingData: RankingData[];
}

interface BenefitData {
  benefitId: number;
  rankingRangeStart: number;
  rankingRangeEnd: number;
  prizeType: number;     // 0=None, 1=Cash, 2=Viccon, 3=Volt
  prizeMoney: number;    // long
}

interface RankingData {
  userId: number;        // long
  userName: string;
  profileUrl: string;
  rank: number;
  point: number;         // long
  targetBenefit: BenefitData;
}

interface CurrentUserData {
  received: number;
  rankingData: RankingData;
}

interface TournamentResponse {
  tournamentData: TournamentData;
  currentUserData: CurrentUserData;
}

interface TournamentAwardData {
  rank: number;
  rewardType: number;
  rewardValue: number;  // long
  benefitId: number;
}

interface TournamentAwardResponse {
  awardData: TournamentAwardData;
  lstBenefitData: BenefitData[];
  lstRankingData: RankingData[];
  remainTime: number;  // long (ms)
}

interface TournamentHistoryData {
  seq: number;
  tournamentData: TournamentHistoryInnerData;
}

interface TournamentHistoryInnerData {
  tournamentId: number;
  bannerUrl: string;
  startDate: string;
  endDate: string;
  lstBenefitData: BenefitData[];
  lstRankingData: RankingData[];
  currentUserData: CurrentUserData;
}
```

### 8.8 Crash Game

```typescript
interface CrashBet {
  betIndex: number;
  bet: number;       // long
  autoMulti: number; // long (0=수동)
}

interface CrashCashResponse {
  bet_idx: number;
  bet_money: number;   // long
  auto_multi: number;
  out_multi: number;
  out_money: number;   // long
}

interface CrashJoinResponse {
  roundHistory: RoundHistory;
  userHistory: UserHistory[];
}

interface RoundHistory {
  roundInfo: RoundInfo;
  userInfo: UserHistory;
}

interface RoundInfo {
  idx: number;
  crash_time: string;
  game_start_time: string;
  hash: string;
  multi: number;
  round_end_time: string;
  round_start_time: string;
}

interface UserHistory {
  round_idx: number;
  bets: CrashBets[];
  date: string;
}

interface CrashBets {
  user_idx: number;
  bet_idx: number;
  auto_multi: number;
  nickname: string;
  bet_money: number;   // long
  out_multi: number;
  out_money: number;   // long
  profile_url: string;
}

interface CrashTopRanking {
  betMoney: number;
  name: string;
  outMoney: number;   // long
  outMulti: number;
  profileUrl: string;
  rank: number;
}
```

### 8.9 Slot Game

```typescript
interface SpinData {
  cash: number;           // long
  bonus: number;          // long
  totalAward: number;     // long
  totalBet: number;       // long
  bigwin: boolean;
  voltType: number;
  ticketValue: number[];  // long[]
  ticketGauge: number;    // long
  ticketMaxGauge: number; // long
  tournamentPoint: number;
  time: string;           // ISO 8601
}

interface SlotLoginResponse {
  userInfo: { balance: number };
  slotInfo: LoginSlotInfoResponse;
  slotState: SlotState;
}

interface LoginSlotInfoResponse {
  jackpot: number;
  jackpotInitMulti: number;
  jackpotForDisplay: number;
  slotType: number;
  isJackpotParty: boolean;
  isMultiJackpot: boolean;
  multiJackpots: number[];
  multiJackpotsForDisplay: number[];
  betRange: number[];
  lineCount: number;
  payoutArray: number[][];
  reelArray: number[][];
  buyFeatures: Record<number, number>;
  extraPays: Record<number, number>;
}
```

### 8.10 SuprNation (게임 카테고리)

```typescript
interface GamesCategories {
  categories: Category[];
}

interface Category {
  name: string;
  slug: string;
  "game-ids": number[];
  "also-show-latest-games": boolean;
  "also-show-others-in-group": boolean;
  "live-update": boolean;
  "requires-login": boolean;
  "also-show-on-top-of-page": boolean;
}

interface GamesResult {
  games: Record<string, Game>;
}

interface Game {
  "game-id": number;
  slug: string;
  title: string;
  "game-Image": GameImage;
  "player-capabilities": string[];
  new: boolean;
  "is-duelz-enabled": boolean;
}

interface GameImage {
  src: { name: string; ext: string[] };
  srcset: Array<{ name: string; ext: string[] }>;
}

interface GameDetail {
  "allow-real-play": boolean;
  "game-type": string;
  "vendor-game-id": string;
  "allow-demo-play": boolean;
  title: string;
  "short-description": string;
  "long-description": string;
  "game-id": number;
  "game-image": GameImage;
  slug: string;
  jurisdiction: string;
  "vendor-name": string;
  "launch-mode": string;
  "rg-buttons-enabled": boolean;
  url: string;
  maintenance: boolean;
  hot: boolean;
  mini_game: boolean;
  offline: boolean;
  "is-new": boolean;
  "is-hot": boolean;
  "is-mini-game": boolean;
  "is-live": boolean;
  "iframe-support": string;  // "GAME_WORKS_ON_ALL_DEVICES" 등
}
```

---

## 9. 마이그레이션 로드맵

### Phase 1: 코어 기능 (기반 구축)

| 항목 | 상세 | QA 항목 |
|------|------|---------|
| 프로젝트 셋업 | React + TypeScript + Vite + Zustand + **Capacitor** | - |
| Capacitor 초기화 | iOS/Android 프로젝트 생성, 스플래시/아이콘, Safe Area | #1~2 |
| 인증 시스템 | 게스트 로그인, JWT 관리, 자동 로그인 | #3~4 |
| 헤더 | Balance, Volt 카운트, Profile 아바타 | #7~11 |
| 카테고리 | 탭 네비게이션, 게임 그리드, 검색, 필터 | #14~18 |
| 슬롯 진입 | iframe 로드, 스핀 처리 | #5~6 |
| 프로필 | Account 페이지, 프로필 정보 | #12 |
| 라우팅 | 씬 전환 대응 (로그인→로비→게임) | - |
| API 클라이언트 | Axios 인스턴스, 인터셉터, 에러 핸들링 | - |
| 상태 관리 | Zustand 스토어 (auth, balance, game) | - |
| 앱 빌드 파이프라인 | Capacitor CLI → Xcode/Android Studio → 스토어 배포 | - |

**의존성**: 없음 (기반)
**결과물**: 앱스토어 설치 → 로그인 → 로비 → 게임 진입 가능한 설치형 앱

---

### Phase 2: 게임 기능

| 항목 | 상세 | QA 항목 |
|------|------|---------|
| 빙고 (Housey) | 5x5 그리드, DRAW, 매칭, 라인 체크 | #19~22 |
| 데일리 미션 | 미션 리스트, 프로그레스, 수집 | #23~25 |
| 토너먼트 | 리더보드, 폴링, 보상 | #26~29 |
| 히스토리 | Cash/Bonus/Viccon/Ticket 히스토리 | #13 |

**의존성**: Phase 1 (인증, 라우팅, API 클라이언트)
**결과물**: 주요 게임 기능이 동작하는 앱

---

### Phase 3: 고급 기능

| 항목 | 상세 | QA 항목 |
|------|------|---------|
| Viccon | 게임 목록, 슬롯/크래시 진입 | #30~33 |
| Ticket | 티켓 UI, 게이지, 사용 | #34~36 |
| Volt | 인벤토리, 오픈, 보상 | #37~38 |
| Crash 게임 | Socket.IO, Canvas 애니메이션, 베팅 | #39~43 |
| STOMP | 실시간 잔액 업데이트 | - |

**의존성**: Phase 2 (게임 기능 기반)
**결과물**: 전체 기능이 완성된 앱

---

### Phase별 기술 리스크

| Phase | 리스크 | 대응 방안 |
|-------|-------|----------|
| 1 | Capacitor WebView 성능 차이 (iOS/Android) | WKWebView/Chrome WebView 최소 버전 설정, 성능 벤치마크 |
| 1 | 앱스토어 심사 (HTML5 앱 정책) | Apple/Google 하이브리드 앱 가이드라인 준수, 네이티브 기능 활용 |
| 1 | iframe 내 슬롯 게임 통신 | postMessage API 활용, 기존 `iframe-support` 확인 |
| 2 | 빙고 그리드 터치 반응성 | CSS Grid + touch-action 최적화 |
| 3 | Crash 게임 실시간 성능 | requestAnimationFrame, Web Worker 배수 계산 |
| 3 | Spine 웹 렌더링 성능 | PixiJS + pixi-spine, Canvas 2D 폴백 |
| 3 | Socket.IO 재연결 안정성 (앱 백그라운드 복귀) | `@capacitor/app` stateChange 리스너 + 재연결 로직 |
| 3 | 푸시 알림 | `@capacitor/push-notifications` + FCM/APNs 연동 |
