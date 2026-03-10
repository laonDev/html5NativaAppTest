# iGaming HTML5 앱 — 아키텍처 설계 초안

> 작성일: 2026-03-09
> 버전: 0.1 (Phase 1 설계 초안)
> 상태: 초안 — 서버 실행 환경 미구성으로 정적 코드 분석 기반 작성. Phase 2 착수 시 실행 검증 후 보완 예정.
> **미결정**: 네이티브 래퍼(Capacitor) 포함 최종 기술 스택은 팀 협의 후 확정 예정.

---

## 목차

1. [배경 및 목적](#1-배경-및-목적)
2. [기술 스택 선정](#2-기술-스택-선정)
3. [프로젝트 폴더 구조](#3-프로젝트-폴더-구조)
4. [라우팅 설계](#4-라우팅-설계)
5. [상태 관리 설계](#5-상태-관리-설계)
6. [API 레이어 설계](#6-api-레이어-설계)
7. [실시간 통신 설계](#7-실시간-통신-설계)
8. [Unity → HTML5 아키텍처 패턴 매핑](#8-unity--html5-아키텍처-패턴-매핑)
9. [Phase 로드맵](#9-phase-로드맵)

---

## 1. 배경 및 목적

### 1.1 마이그레이션 배경

기존 iGaming 플랫폼은 **Unity 2022.3 (C#)** 기반 네이티브 모바일 앱으로 구현되어 있으며,
**설치형 모바일 앱**을 새로 제작하는 방향으로 전환.

기술 방향은 두 가지 후보를 검토 중:
- **Option A**: 웹 기술(HTML/CSS/TypeScript) + 네이티브 래퍼로 앱스토어 배포
- **Option B**: Flutter (Dart) 기반 크로스 플랫폼 네이티브 앱

최종 기술 스택은 팀 협의 후 확정 예정.

### 1.2 현재 Unity 시스템 요약

| 항목 | 현재 (Unity) |
|------|-------------|
| 엔진 | Unity 2022.3.5f1 |
| 언어 | C# |
| 비동기 | UniTask (async/await) |
| 상태 관리 | UniRx (ReactiveProperty) |
| HTTP 클라이언트 | Best.HTTP (커스텀 ApiService 래퍼) |
| 실시간 (게임) | Socket.IO (Best.SocketIO) |
| 실시간 (슬롯) | Best.WebSockets + STOMP |
| 에셋 관리 | Addressable Asset System |
| 국제화 | Unity.Localization |
| 슬롯 게임 | WebView (Vuplex) 내 iframe 로드 |
| 애니메이션 | Spine (spine-unity), DOTween |
| UI | Unity UGUI (Canvas) |

---

## 2. 기술 스택 검토

> **주의**: 최종 기술 스택은 팀 협의 후 확정 예정. 이 섹션은 두 후보 스택의 비교 초안임.

### 2.1 공통 확정 사항

프레임워크와 무관하게 아래 항목은 본부 방향 또는 서버 기술 스택에 의해 확정.

| 영역 | 기술 | 비고 |
|------|------|------|
| 게임 렌더링 | Pixi.js v8 | 본부 기존 HTML5 프로젝트 표준 |
| 실시간 (소켓) | socket.io-client | 기존 서버 Socket.IO Multi 서버와 호환 |
| 실시간 (STOMP) | @stomp/stompjs | SuprNation WalletEvent/PlayerEvent 구독 |
| 슬롯 게임 | iframe | 기존 서버 iframe-support 필드 확인됨 |

### 2.2 Option A: React + 네이티브 래퍼 (HTML5 웹앱 방식)

| 영역 | 기술 | 대체하는 Unity 기술 |
|------|------|------------------|
| 프레임워크 | React 18+ | Unity UGUI |
| 언어 | TypeScript | C# |
| 상태 관리 | Zustand | UniRx (ReactiveProperty) |
| HTTP | Axios | Best.HTTP (ApiService) |
| 라우팅 | React Router v6 | SceneManager |
| 스타일 | Tailwind CSS | Unity UGUI Layout |
| 애니메이션 (UI) | Framer Motion | DOTween |
| 애니메이션 (Spine) | pixi-spine | spine-unity |
| 국제화 | i18next | Unity.Localization |
| 네이티브 래퍼 | **Capacitor** *(팀 협의 후 확정)* | Unity Native Build |
| 빌드 | Vite | Unity Build System |

**Capacitor 검토 근거**

| 구분 | 내용 |
|------|------|
| 역할 | HTML5 앱을 iOS/Android 네이티브 앱으로 패키징 |
| 웹뷰 | iOS: WKWebView, Android: Chrome WebView |
| 장점 | 웹 코드 100% 재사용, 네이티브 API 접근 가능, 플러그인 생태계 풍부 |
| Cordova 대비 | 최신 WebView 기본, 더 나은 TypeScript 지원 |
| TWA 대비 | iOS 지원 포함, 네이티브 API 접근 범위 넓음 |

**필요한 네이티브 플러그인 (Capacitor 기준)**

| 플러그인 | 용도 | Unity 대응 |
|---------|------|-----------|
| `@capacitor/app` | 앱 상태, 딥링크 | Application.deepLinkActivated |
| `@capacitor/status-bar` | 상태바 제어 | Screen.fullScreen |
| `@capacitor/splash-screen` | 스플래시 화면 | Unity Splash Screen |
| `@capacitor/keyboard` | 키보드 제어 | TouchScreenKeyboard |
| `@capacitor/haptics` | 진동 피드백 | Handheld.Vibrate |
| `@capacitor/browser` | 외부 URL 오픈 | Application.OpenURL |
| `@capacitor/push-notifications` | 푸시 알림 | Firebase Cloud Messaging |
| `capacitor-plugin-safe-area` | Safe Area 대응 | Screen.safeArea |

### 2.3 Option B: Flutter

| 영역 | 기술 | 대체하는 Unity 기술 |
|------|------|------------------|
| 프레임워크 | Flutter 3.x | Unity UGUI |
| 언어 | Dart | C# |
| 상태 관리 | Riverpod / Bloc | UniRx (ReactiveProperty) |
| HTTP | dio / http | Best.HTTP |
| 실시간 (소켓) | socket_io_client | Best.SocketIO |
| 실시간 (STOMP) | stomp_dart_client | Best.WebSockets + STOMP |
| 라우팅 | go_router | SceneManager |
| 애니메이션 (Spine) | spine-flutter (공식 런타임) | spine-unity |
| 애니메이션 (UI) | Flutter Animation / Rive | DOTween |
| 국제화 | flutter_localizations / easy_localization | Unity.Localization |
| 슬롯 게임 | webview_flutter (iframe 로드) | Vuplex WebView |
| 네이티브 기능 | Flutter 내장 + pub.dev 플러그인 | Unity Native Build |

### 2.4 스택 비교 (Option A vs Option B)

| 항목 | Option A (React + Capacitor) | Option B (Flutter) |
|------|------------------------------|-------------------|
| 렌더링 | WebView (DOM/CSS) | Skia 엔진 (자체 렌더링) |
| 성능 | WebView 오버헤드 있음 | 네이티브에 준하는 60fps |
| 개발 생산성 | 웹 개발자 즉시 투입 가능 | Dart 학습 필요 (C#과 유사) |
| Spine 지원 | pixi-spine (커뮤니티) | spine-flutter (공식 런타임) |
| iframe 슬롯 | 네이티브 iframe 지원 | webview_flutter 위젯 필요 |
| 앱스토어 심사 | 하이브리드 앱 리스크 존재 | 네이티브 앱으로 인정 |
| 웹 동시 배포 | 동일 코드로 웹 배포 가능 | Flutter Web 성능 제한적 |
| C# 코드 전환 | TypeScript로 재작성 | Dart로 재작성 (문법 유사) |
| 패키지 생태계 | npm (매우 풍부) | pub.dev (충분, 웹보다 적음) |

> **미결정 — 팀 협의 항목**: 최종 네이티브 래퍼 / 프레임워크 선택. 아래 3~9절의 설계 초안은 **Option A (React 기반)** 기준으로 작성됨. Option B 선택 시 별도 재설계 필요.

---

## 3. 프로젝트 폴더 구조

> **Option A (React + Capacitor) 기준 초안**. Option B (Flutter) 선택 시 별도 구조 설계 필요.

```
src/
├── api/
│   ├── rest/         # Axios 인스턴스 + 엔드포인트별 모듈
│   ├── socket/       # Socket.IO 이벤트 핸들러 (게임 서버)
│   └── stomp/        # STOMP 이벤트 핸들러 (SuprNation)
├── stores/           # Zustand 전역 상태 저장소
│   ├── authStore.ts      # 인증 (ServerInfo, JWT, UserInfo)
│   ├── balanceStore.ts   # 잔액 (cash, bonus, viccon)
│   ├── gameStore.ts      # 게임 목록 / 카테고리 / 즐겨찾기
│   ├── crashStore.ts     # Crash 게임 상태 (roundState, tick, betRank)
│   ├── bingoStore.ts     # 빙고 상태 (houseyData, coin, endTime)
│   ├── missionStore.ts   # 데일리 미션 상태
│   ├── tournamentStore.ts
│   ├── voltStore.ts
│   └── ticketStore.ts
├── pages/            # 페이지 컴포넌트 (라우팅 단위)
│   ├── LoginPage.tsx
│   ├── LobbyPage.tsx
│   ├── SlotPage.tsx      # 풀스크린 (헤더/네비 없음)
│   ├── CrashGamePage.tsx # 풀스크린 (헤더/네비 없음)
│   ├── AccountPage.tsx
│   ├── BingoPage.tsx
│   ├── DailyMissionPage.tsx
│   ├── TournamentPage.tsx
│   ├── HistoryPage.tsx
│   ├── VicconPage.tsx
│   ├── TicketPage.tsx
│   └── VoltPage.tsx
├── components/       # 재사용 UI 컴포넌트
│   ├── Header/
│   ├── CategoryBar/
│   ├── GameGrid/
│   ├── Modal/        # ModalProvider (PopupManager 대체)
│   └── BottomNav.tsx
├── types/            # TypeScript 인터페이스
├── hooks/            # 커스텀 React 훅
├── utils/            # 유틸리티 함수
└── i18n/             # 로컬라이제이션 리소스

ios/                  # (Option A) Capacitor iOS 네이티브 프로젝트
android/              # (Option A) Capacitor Android 네이티브 프로젝트
capacitor.config.ts   # (Option A) Capacitor 설정
```

---

## 4. 라우팅 설계

### 4.1 화면 구조

```
/login          → LoginPage        (인증 없음)
/slot           → SlotPage         (풀스크린, 헤더/네비 없음)
/crash          → CrashGamePage    (풀스크린, 헤더/네비 없음)

MainLayout (Header + BottomNav 포함)
  /lobby        → LobbyPage
  /account      → AccountPage
  /bingo        → BingoPage
  /mission      → DailyMissionPage
  /tournament   → TournamentPage
  /history      → HistoryPage
  /viccon       → VicconPage
  /ticket       → TicketPage
  /volt         → VoltPage
```

### 4.2 Unity SceneManager → React Router 대응

| Unity 씬 전환 | React Router |
|-------------|-------------|
| `IGamingSceneManager.LoadTitle()` | `navigate('/login')` |
| `IGamingSceneManager.LoadLobby()` | `navigate('/lobby')` |
| `IGamingSceneManager.LoadSlot()` | `navigate('/slot')` |
| `IGamingSceneManager.LoadCrash()` | `navigate('/crash')` |

---

## 5. 상태 관리 설계

### 5.1 Store 구성

| Store | 관리 상태 | Unity 대응 |
|-------|---------|-----------|
| `authStore` | serverInfo, authInfo, JWT 토큰, userInfo, isLoggedIn | `NetworkManager` 싱글턴 |
| `balanceStore` | cash, bonus, balance, viccon | `UserData.balance` (ReactiveProperty) |
| `gameStore` | 카테고리 목록, 게임 목록, 즐겨찾기 | `GamesResult`, `GamesCategories` |
| `crashStore` | roundState, tick, betRank, 유저 베팅 | `CrashGame.cs` 상태 |
| `bingoStore` | houseyData, coin, endTime | `BritishBingo.cs` 상태 |
| `missionStore` | 미션 목록, hasCompletable, endDate | `DailyMission.cs` 상태 |
| `tournamentStore` | 토너먼트 데이터, 유저 랭킹 | `TournamentPanel.cs` 상태 |
| `voltStore` | voltList, totalCount | `SecondaryGoodsPanel.cs` |
| `ticketStore` | gauge, maxGauge, count | `TicketPanel.cs` |

### 5.2 상태 갱신 흐름

```
[로그인 플로우]
serverInfo API → authStore
  → createGuest/login API → authStore (JWT → localStorage)
  → enterLobby API → balanceStore, gameStore
  → Socket.IO 연결
  → STOMP 연결 (SuprNation 계정인 경우)

[실시간 갱신]
Socket.IO crash_state → crashStore
STOMP WalletEvent    → balanceStore
슬롯 스핀 응답       → balanceStore, ticketStore
```

### 5.3 localStorage 영속성

| 키 | 내용 | 시점 |
|----|------|------|
| `token` | JWT 토큰 | 로그인 성공 |
| `authInfo` | authid, accountidx | 계정 생성/로그인 |

> **주의**: 서버 잔액값은 /1000 변환 후 표시 (예: `100000` → `£100.00`)

---

## 6. API 레이어 설계

### 6.1 구조 원칙

- **모든 요청**: POST 방식 (Unity `ApiService.Resolve<T>()` 패턴 동일)
- **인증**: `Authorization: Bearer {JWT}` 헤더 자동 주입 (Axios 인터셉터)
- **401 처리**: localStorage 클리어 → `/login` 리다이렉트

### 6.2 API 모듈 분류

| 모듈 | 엔드포인트 그룹 |
|------|--------------|
| `accountApi` | `account/*`, `user/*` |
| `gameApi` | `game/*`, `games/*` |
| `crashApi` | `crash/*`, `crashgame/*` |
| `casinoApi` | `casino/slot/*` |
| `houseyApi` | `housey/*` |
| `missionApi` | `daily_mission/*` |
| `tournamentApi` | `tournament/*` |
| `vicconApi` | `viccon/*` |
| `voltApi` | `volt/*` |
| `ticketApi` | `ticket/*` |
| `historyApi` | `history/*` |
| `suprApi` | `v1/*` (SuprNation) |
| `logApi` | `log/*` |

---

## 7. 실시간 통신 설계

### 7.1 Socket.IO (게임 서버)

**연결 대상**: Multi 서버 (Socket.IO)
**인증**: `auth: { token }` 옵션 (JWT 전달)
**재연결**: 자동 재연결 (최대 10회, 1초 간격)

| 이벤트 | 방향 | 설명 |
|-------|------|------|
| `crash_join` | S→C | 크래시 입장 (roundIndex, currentState, betRank) |
| `crash_state` | S→C | 상태 업데이트 매 틱 (tick, currentState) |
| `crash_bet` | S→C | 베팅 브로드캐스트 |
| `crash_cash_out` | S→C | 캐시아웃 브로드캐스트 |
| `crash_end` | S→C | 라운드 종료 (betRank[], cashOutRank[]) |
| `slot_join` | C→S | 슬롯 입장 |
| `spin` | S→C | 스핀 결과 (cash, bonus, voltType) |

### 7.2 STOMP (SuprNation)

**연결 대상**: SuprNation WebSocket (슬롯 잔액 실시간 갱신용)
**인증**: 세션 쿠키 기반 (SuprNation 계정 로그인 시만 활성화)
**하트비트**: 10초 간격

| 구독 ID | 경로 | 페이로드 | 처리 |
|--------|------|---------|------|
| `sub-3` | `user/exchange/amq.direct/wallet` | `StompWallet` | `balanceStore` 갱신 |
| `sub-4` | `user/exchange/amq.direct/player` | (generic) | 플레이어 상태 업데이트 |

### 7.3 연결 관리 원칙

- Socket.IO: 로그인 완료 후 즉시 연결
- STOMP: SuprNation 계정 로그인 시에만 연결
- 백그라운드 복귀: `@capacitor/app` stateChange → 재연결 (Phase 3 구현 예정)
- 로그아웃 시: 양쪽 모두 연결 해제

---

## 8. Unity → HTML5 아키텍처 패턴 매핑

### 8.1 설계 패턴 매핑

| Unity 패턴 | 현재 구현체 | HTML5 대응 | 비고 |
|-----------|-----------|-----------|------|
| `SingletonClass<T>` | NetworkManager, UserData, TableManager | Context Provider / Zustand store | 전역 상태 관리 |
| `ReactiveProperty<T>` | UserData.balance, voltCount 등 | Zustand selector | 구독 기반 UI 갱신 |
| `UniTask async/await` | 전체 비동기 흐름 | Promise / async-await | 1:1 대응 |
| `PopupManager` | 모달 스택 관리 | React Portal + Context | z-index 관리 |
| `L10N.String(key)` | Unity.Localization | `t(key)` (i18next) | 키 기반 번역 |
| `SlotWebView` | Vuplex WebView | `<iframe>` | 슬롯 게임 로드 |
| `Spine Animation` | spine-unity | pixi-spine / spine-ts | 동일 에셋 활용 |
| `DOTween` | UI 트윈 애니메이션 | Framer Motion / CSS transition | |
| `SceneManager` | 씬 전환 | React Router | SPA 라우팅 |
| `TableRepository` | JSON 테이블 다운로드/캐싱 | Axios + React Query 캐싱 | |
| `ApiService.Resolve<T>()` | 제네릭 API 호출 | Axios 인스턴스 + 모듈화 | |
| `Addressables` | 에셋 번들 로딩 | Dynamic import / lazy loading | 코드 스플리팅 |
| `Handheld.Vibrate` | 진동 피드백 | `@capacitor/haptics` | |
| `Screen.safeArea` | Safe Area 대응 | `capacitor-plugin-safe-area` + CSS env() | |
| `Application.OpenURL` | 외부 브라우저 | `@capacitor/browser` | |
| Unity Native Build | iOS/Android 빌드 | Capacitor + Xcode/Android Studio | 앱스토어 배포 |

### 8.2 상태 저장소 매핑 (UserData → Zustand)

| Unity (UserData 필드) | Zustand Store | 갱신 시점 |
|----------------------|---------------|----------|
| `balance` | `balanceStore.balance` | 로그인, 스핀, STOMP WalletEvent |
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

## 9. Phase 로드맵

### Phase 1 — 코어 기능 (분석/설계)

| 항목 | 내용 | QA 항목 |
|------|------|---------|
| 프로젝트 셋업 | React + TypeScript + Vite + Zustand + Capacitor | - |
| Capacitor 초기화 | iOS/Android 프로젝트, 스플래시, Safe Area | #1~2 |
| 인증 시스템 | 게스트 로그인, JWT 관리, 자동 로그인 | #3~4 |
| 헤더 | Balance, Volt 카운트, 프로필 아바타 | #7~11 |
| 카테고리 | 탭 네비게이션, 게임 그리드, 검색, 필터 | #14~18 |
| 슬롯 진입 | iframe 로드, 스핀 처리 | #5~6 |
| 프로필 | Account 페이지, 프로필 정보 | #12 |
| API 클라이언트 | Axios 인스턴스, 인터셉터, 에러 핸들링 | - |
| 상태 관리 기반 | Zustand 스토어 전체 | - |

**결과물**: 앱 설치 → 로그인 → 로비 → 슬롯 진입 가능한 설치형 앱

### Phase 2 — 게임 기능

| 항목 | 내용 | QA 항목 |
|------|------|---------|
| 빙고 (Housey) | 5x5 그리드, DRAW, 매칭, 라인 체크 | #19~22 |
| 데일리 미션 | 미션 리스트, 프로그레스 바, 수집 | #23~25 |
| 토너먼트 | 리더보드, 폴링, 보상 팝업 | #26~29 |
| 히스토리 | Cash/Bonus/Viccon/Ticket 히스토리 | #13 |

### Phase 3 — 고급 기능

| 항목 | 내용 | QA 항목 |
|------|------|---------|
| Viccon | 게임 목록, 슬롯/크래시 진입 | #30~33 |
| Ticket | 티켓 UI, 게이지, 사용 | #34~36 |
| Volt | 인벤토리, 오픈, 보상 | #37~38 |
| Crash 게임 | Socket.IO + Canvas 애니메이션 + 베팅 | #39~43 |
| STOMP | 실시간 잔액 업데이트 (SuprNation) | - |

### Phase별 기술 리스크

| Phase | 리스크 | 대응 방안 |
|-------|-------|---------|
| 1 | **기술 스택 미확정** | 팀 협의 완료 후 Phase 2 착수 전 확정 필요 |
| 1 | 서버 환경 미구성 | Mock 모드로 UI/로직 선개발, 서버 구축 후 교체 |
| 1 | 앱스토어 심사 (Option A: 하이브리드 앱 정책) | 네이티브 래퍼 가이드라인 준수, 네이티브 기능 활용 |
| 1 | iframe 내 슬롯 통신 | postMessage API, iframe-support 필드 확인 |
| 2 | 빙고 터치 반응성 (Option A) | CSS Grid + touch-action 최적화 |
| 3 | Crash 실시간 성능 | requestAnimationFrame + Web Worker 배수 계산 |
| 3 | Spine 웹 렌더링 성능 | Pixi.js v8 + pixi-spine, Canvas 2D 폴백 |
| 3 | Socket.IO 백그라운드 복귀 | 앱 상태 변경 이벤트 리스너 + 재연결 로직 |

---

> **참고 문서**: html5-migration-guide.md (기능별 상세 명세, API 목록, TypeScript 데이터 모델)
