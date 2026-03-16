# iGaming HTML5 클라이언트 — 시작 가이드

> 팀원 배포용 로컬 개발 환경 설정 및 실행 가이드

---

## 환경 요구사항

| 항목 | 최소 버전 | 비고 |
|------|-----------|------|
| Node.js | 18.x 이상 | [nodejs.org](https://nodejs.org) |
| npm | 9.x 이상 | Node.js 설치 시 포함 |
| Android Studio | Hedgehog 이상 | Android 빌드 시에만 필요 |
| JDK | 17 이상 | Android Studio 설치 시 포함 가능 |

---

## 1. 설치

```bash
# 저장소 클론 후 의존성 설치
npm install
```

---

## 2. 웹 브라우저 실행 (개발 모드)

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

> **참고**: 현재 서버 환경이 미구성된 상태입니다. API 호출은 Mock 처리되거나 연결 오류가 발생할 수 있습니다.

---

## 3. 빌드

```bash
# 웹 빌드 (dist/ 폴더에 출력)
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview
```

---

## 4. Android 빌드 (Capacitor)

> Android Studio가 설치되어 있어야 합니다.

```bash
# 1. 웹 빌드 (dist/ 폴더 생성)
npm run build

# 2. Capacitor에 웹 빌드 동기화
npm run cap:sync

# 3. Android Studio 열기
npm run cap:android
```

Android Studio에서 `Run` → 에뮬레이터 또는 실제 기기 선택 후 실행.

---

## 5. 프로젝트 구조

```
html5NativeAppTest/
├── src/
│   ├── api/          # 서버 API 통신 모듈
│   ├── components/   # 공통 UI 컴포넌트
│   ├── hooks/        # 커스텀 훅
│   ├── i18n/         # 다국어 리소스
│   ├── pages/        # 라우트 단위 페이지
│   ├── stores/       # Zustand 전역 상태
│   ├── types/        # TypeScript 타입 정의
│   ├── utils/        # 유틸리티 함수
│   ├── App.tsx       # 라우터 루트
│   └── main.tsx      # 앱 진입점
├── docs/             # 설계 문서
├── android/          # Capacitor Android 프로젝트
├── capacitor.config.ts
├── vite.config.ts
└── package.json
```

---

## 6. 주요 기술 스택

| 역할 | 라이브러리 | 버전 |
|------|-----------|------|
| UI 프레임워크 | React | 19 |
| 언어 | TypeScript | 5.9 |
| 빌드 도구 | Vite | 7 |
| 스타일 | TailwindCSS | 4 |
| 애니메이션 | Framer Motion | 12 |
| 라우터 | React Router | 7 |
| 전역 상태 | Zustand | 5 |
| HTTP 통신 | Axios | 1.x |
| WebSocket (NGS) | socket.io-client | 4.x |
| WebSocket (SuprNation) | @stomp/stompjs | 7.x |
| 모바일 래퍼 | Capacitor | 8 |
| 다국어 | i18next | 25 |

---

## 7. 알려진 제약 사항

- **서버 미연결**: 현재 NGS 서버 및 SuprNation 서버에 대한 접속 환경이 미구성된 상태입니다. Phase 2에서 서버 연동 환경 구성 예정.
- **Capacitor 채택 여부**: 네이티브 앱 래퍼(Capacitor) 사용 여부는 팀 협의 후 확정 예정. 현재는 초안 상태로 포함됨.
- **iOS 빌드**: macOS + Xcode 환경 필요. 현재 지원하지 않음.

---

## 8. 참고 문서

| 문서 | 위치 |
|------|------|
| 아키텍처 설계 초안 | `docs/architecture-design.md` |
| HTML5 전환 가이드 | `docs/html5-migration-guide.md` |
| Confluence 아키텍처 페이지 | [링크](https://studio-g.atlassian.net/wiki/spaces/iGamingCon/pages/2872771328/iGaming+HTML5) |
