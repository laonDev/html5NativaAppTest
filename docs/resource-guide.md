# 리소스 폴더 가이드

> 대상: 디자이너 / 아티스트 / 퍼블리셔
> 작성일: 2026-03-16
> 프로젝트: HTML5 Native App (Capacitor + React)

---

## 전체 구조 한눈에 보기

```
html5NativeAppTest/
│
├── public/assets/              ← 웹 UI 리소스 (디자이너 작업 폴더)
│   ├── images/
│   │   ├── bg/                 배경 이미지
│   │   ├── ui/                 버튼, 패널, 프레임 등 UI 요소
│   │   └── characters/         캐릭터 스탠딩 이미지
│   └── spine/                  Spine 애니메이션 파일
│       └── {애니메이션명}/
│           ├── {명}.json       스켈레톤 데이터
│           ├── {명}.atlas      텍스처 아틀라스 정보
│           └── {명}.png        텍스처 아틀라스 이미지
│
├── src/assets/icons/           ← 소형 아이콘 (코드에서 직접 import)
│
└── android/app/src/main/res/   ← Android 네이티브 리소스 (개발자 담당)
    ├── mipmap-*/               앱 아이콘
    └── drawable-*/             스플래시 스크린
```

---

## 1. 웹 UI 이미지 — `public/assets/images/`

### 폴더 용도

| 폴더 | 용도 | 예시 파일명 |
|------|------|------------|
| `bg/` | 페이지 배경, 전체 화면 배경 | `lobby-bg.png`, `slot-bg.png` |
| `ui/` | 버튼, 패널, 팝업 프레임, 아이콘 등 UI 요소 | `btn-primary.png`, `panel-gold.png` |
| `characters/` | 캐릭터 스탠딩, 프로필 이미지 | `character-dealer.png` |

### 파일 규칙

- **포맷**: PNG (투명도 필요 시) / WebP (용량 최적화 필요 시)
- **네이밍**: 소문자 + 하이픈 (`kebab-case`) — ex) `lobby-bg.png`, `btn-close.png`
- **해상도**: 기준 해상도 **750 × 1334** (iPhone SE 기준), 필요 시 @2x 별도 제공
- **용량 권장**: 배경 최대 500KB / UI 요소 최대 100KB

### 사용 방법 (개발자 참고)

```tsx
// public/ 에 있으므로 URL 그대로 사용
<img src="/assets/images/bg/lobby-bg.png" />
<img src="/assets/images/ui/btn-primary.png" />
```

---

## 2. Spine 애니메이션 — `public/assets/spine/`

### Spine 버전

> **Spine 에디터 4.2.x** 사용 (런타임 버전과 반드시 일치)

### 폴더 구조 규칙

Spine 애니메이션 1개당 **폴더 1개**를 생성하고, 내부에 3개 파일을 모두 포함합니다.

```
public/assets/spine/
├── coin-burst/
│   ├── coin-burst.json     ← 스켈레톤 데이터 (Spine Export)
│   ├── coin-burst.atlas    ← 아틀라스 텍스처 정보
│   └── coin-burst.png      ← 아틀라스 이미지
│
├── lobby-effect/
│   ├── lobby-effect.json
│   ├── lobby-effect.atlas
│   └── lobby-effect.png
│
└── character-idle/
    ├── character-idle.json
    ├── character-idle.atlas
    └── character-idle.png
```

### Spine Export 설정

Spine 에디터에서 내보낼 때 아래 설정을 사용합니다.

**Skeleton 내보내기**
- Format: `JSON` (또는 `Binary` → `.skel`, 개발자와 협의)
- Nonessential data: 포함하지 않음 (용량 절감)

**Texture Packer 설정**
- Format: `PNG`
- Max width / height: `2048 × 2048`
- Premultiplied alpha: `체크`
- Pack: `Tight` 권장

### 네이밍 규칙

- 폴더명 = 파일명 (3개 파일 모두 동일한 이름 사용)
- 소문자 + 하이픈 (`kebab-case`) 사용
- ex) `coin-burst/coin-burst.json`

### 사용 방법 (개발자 참고)

```tsx
import { SpinePlayer } from '@/components/SpinePlayer';

// name = 폴더명, animation = Spine 내부 애니메이션 이름
<SpinePlayer
  name="coin-burst"
  animation="burst"
  width={300}
  height={300}
  loop={false}
/>
```

---

## 3. 소형 아이콘 — `src/assets/icons/`

코드에서 `import`로 직접 참조하는 소형 아이콘(로고, 탭 아이콘 등)을 보관합니다.

- **포맷**: SVG 권장 / PNG 가능
- **크기**: 64px 이하 소형 이미지에 적합
- **용도**: 로고, 하단 탭 아이콘, 인라인 아이콘

```tsx
// 개발자 사용 예
import logoIcon from '@/assets/icons/logo.png';
<img src={logoIcon} />
```

> 배경, 게임 UI 이미지처럼 큰 파일은 이 폴더가 아닌 `public/assets/images/`를 사용합니다.

---

## 4. Android 네이티브 리소스 — `android/app/src/main/res/`

> **디자이너 직접 수정 시 개발자와 반드시 협의** 필요

| 폴더 | 내용 |
|------|------|
| `mipmap-mdpi/` ~ `mipmap-xxxhdpi/` | 앱 아이콘 (DPI별) |
| `drawable-port-*/` | 세로 방향 스플래시 스크린 (DPI별) |
| `drawable-land-*/` | 가로 방향 스플래시 스크린 (DPI별) |

### 아이콘 사이즈 규격

| 폴더 | 아이콘 크기 |
|------|------------|
| `mipmap-mdpi` | 48 × 48 px |
| `mipmap-hdpi` | 72 × 72 px |
| `mipmap-xhdpi` | 96 × 96 px |
| `mipmap-xxhdpi` | 144 × 144 px |
| `mipmap-xxxhdpi` | 192 × 192 px |

---

## 파일 전달 방법

1. Git 저장소를 통해 직접 커밋하거나
2. 담당 개발자에게 **폴더 구조를 유지한 채** 전달 (압축 시 폴더 구조 포함)

> Spine 파일은 반드시 `.json` + `.atlas` + `.png` **3개 세트**로 전달해야 합니다.

---

## 자주 묻는 질문

**Q. 파일명에 한글이나 대문자를 써도 되나요?**
A. 안 됩니다. 소문자 + 하이픈만 사용해 주세요. 대소문자가 다른 환경(Android, Linux)에서 파일을 못 찾는 오류가 발생합니다.

**Q. Spine 폴더 안에 텍스처 이미지가 여러 장이어도 되나요?**
A. 됩니다. 아틀라스가 여러 페이지로 나뉜 경우 `{명}0.png`, `{명}1.png` 형식으로 자동 생성되며 그대로 함께 넣으면 됩니다.

**Q. 이미지를 수정하면 개발자에게 따로 알려야 하나요?**
A. Git으로 직접 커밋하는 경우 불필요합니다. 파일 전달 방식이라면 반드시 알려주세요.
