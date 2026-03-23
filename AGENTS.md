# AGENTS Handbook for `html5NativeAppTest`

Purpose: fast orientation for coding agents. Keep commands reproducible, follow conventions already in the repo, and prefer non-destructive changes.

## Quick Facts
- Stack: React 19 + TypeScript (strict), Vite 7, Tailwind CSS 4, Zustand, React Router 7, Framer Motion, Axios, Capacitor 8.
- Module type: ESM (`"type": "module"`). Path alias `@/*` → `src/*` (see `tsconfig.json`).
- Node/npm: target Node 18+ (per GETTING_STARTED). Use npm (lockfile present).
- UI baseline: dark palette (#1a1a2e) with Tailwind utility classes; safe-area CSS vars applied globally.
- Mobile: Capacitor wrapper present; Android project under `android/` (iOS scaffolding not present in repo).

## Commands (build/dev/test)
- Install: `npm install`.
- Dev server: `npm run dev` (Vite, port 3000; BrowserRouter expects root path).
- Type-check+build: `npm run build` (runs `tsc -b` then `vite build` → `dist/`).
- Preview built app: `npm run preview`.
- Capacitor sync: `npm run cap:sync` (copies `dist/` to native projects).
- Open Android project: `npm run cap:android` (requires Android Studio).
- iOS open: `npm run cap:ios` (Xcode/macOS required; project not present here by default).
- Tests: **none configured** (no Jest/Vitest/RTL scripts). There is no `npm test`.
- Single-test guidance: not available until a test runner is added; if you introduce Vitest, prefer `npx vitest path/to/file.test.ts --runInBand` for targeted runs.
- Linting: no ESLint config. Use TypeScript build for type regressions and keep style aligned with existing code.

## Repository Layout Highlights
- `src/main.tsx`: React entry; mounts `App` inside `BrowserRouter`; loads `index.css`, `i18n`.
- `src/App.tsx`: route map; `/slot` and `/crash` are full-screen, others under `MainLayout` (Header + BottomNav).
- `src/components/`: UI building blocks (Header, BottomNav, ModalProvider). Styling via Tailwind classes; Framer Motion for motion.
- `src/pages/`: screen-level components (Login, Lobby, Slot, Crash, Account, Bingo, DailyMission, Tournament, History, Viccon, Ticket, Volt).
- `src/stores/`: Zustand stores (auth, balance, game, crash, bingo, mission, tournament, volt, ticket). State often persisted to `localStorage`.
- `src/api/rest/`: Axios client + domain API modules; `src/api/mock/` provides mock data/interceptor when no backend URL.
- `src/i18n/`: i18next setup and locales (loaded globally).
- `docs/`: project design docs (`architecture-design.md`, `html5-migration-guide.md`); `GETTING_STARTED.md` for setup.
- `capacitor.config.ts`: Capacitor defaults (SplashScreen/StatusBar/Keyboard tuned; `webDir` = `dist`).

## Environment Variables (.env)
- Define API endpoints in `.env` (copy from `.env.example`).
- Keys: `VITE_API_BASE_URL`, `VITE_SUPR_API_BASE_URL`, `VITE_SOCKET_URL`, `VITE_STOMP_URL`.
- Mock mode: when `VITE_API_BASE_URL` is absent, Axios client enables mock interceptor and logs `[API] Mock mode enabled`.
- Do not commit secrets; `.env` is ignored by git.

## Import & Module Conventions
- Order imports: external packages first, then absolute `@/...`, then relative `./...`.
- Use `type` imports for pure types (`import type { Foo } from '@/types';`).
- Components and hooks use named exports where possible; pages/components are PascalCase; stores are `useXStore`.
- Favor `const` for bindings; prefer arrow functions for callbacks and store actions.
- Keep module side effects explicit (e.g., `import './i18n';`).

## TypeScript Guidelines
- `strict: true`; noUnusedLocals/Parameters are disabled—still avoid unused values in new code.
- Prefer `interface` for object shapes exposed across modules; `type` aliases for unions/utility types.
- Narrow types at boundaries; cast sparingly. Handle `null` where stores initialize nullable fields.
- Preserve existing type names from `src/types/*`; extend those before introducing new parallel types.

## Formatting & Style
- Semicolons and single quotes across TSX/TS; keep two-space indentation as in repo files.
- Trailing commas in multiline literals are acceptable; stay consistent within touched blocks.
- JSX: self-close empty elements; keep props on newlines when long; minimal inline styles (safe-area padding is OK).
- Tailwind: utility classes concatenated in template literals; keep class ordering stable and readable.
- Avoid adding TODO/FIXME comments unless necessary; prefer clear naming over inline comments.

## State Management (Zustand)
- Stores typed with an interface alongside action signatures. Initialize default state inline in `create` call.
- Persisted pieces (favorites, auth tokens) use `localStorage`; mirror this pattern when adding similar fields.
- Select state via selector functions to avoid over-render (`useStore((s) => s.field)`).
- When mutating arrays, create new copies before setting; keep updates immutable.

## Routing
- Router lives in `App.tsx`; new pages should be added there and optionally wrapped by `MainLayout` if they need header/nav.
- Full-screen routes (e.g., `/slot`, `/crash`) bypass layout; maintain this separation for immersive views.
- Use `useNavigate` for programmatic redirects; default redirect is `Navigate to /login` for unknown paths.

## API Client & Error Handling
- Axios client (`src/api/rest/client.ts`) injects `Authorization` header from `localStorage.token`.
- 401 handling: interceptor clears `token` and redirects to `/login`; do not duplicate this logic downstream.
- In mock mode, requests are intercepted and fulfilled with mock data; mock errors are converted to successful responses.
- API modules return typed payloads; prefer keeping return types explicit (e.g., `client.post<unknown, Foo>('path', body)`).
- Use `try/catch` around API flows (see `LoginPage.tsx`); set user-facing errors and log technical details to console.

## Network & Real-Time
- Socket/STOMP scaffolding exists under `src/api/socket` and `src/api/stomp`; align event names with existing mock data if expanded.
- Keep reconnection/auth concerns centralized in the socket clients; avoid ad-hoc WebSocket creation inside components.

## Styling & Layout
- Global styles in `src/index.css` set safe-area padding and dark theme. Respect `--safe-*` env vars for mobile insets.
- Tailwind 4 via `@import "tailwindcss";`—no separate config file present.
- Color accents use `#e94560` for CTAs/active states; avoid introducing conflicting palettes without rationale.
- Hide scrollbars by default; layout typically `flex h-full` wrappers with `main` using `overflow-hidden`.

## Animation
- Framer Motion is used for entrance/overlay animations (`ModalProvider`, `LoginPage`). Keep transitions subtle (spring for panels, fade for scrims).
- Wrap conditional animations with `<AnimatePresence>`; use `motion.div` variants consistent with existing timing.

## Components & Hooks
- Components are functional and typed via implicit React.FC inference (no explicit React.FC usage).
- Modal handling via context in `ModalProvider`; open/close through provided hooks and portals into `document.body`.
- Bottom navigation uses configuration arrays; add new items by extending `NAV_ITEMS` with `path/icon/label`.
- Use hooks for derived logic when it grows (pattern: create file under `src/hooks/`).

## Data & Persistence
- Local persistence keys in use: `token`, `authInfo`, `favorites`. When adding new keys, namespace them clearly and keep serialization JSON-based.
- Avoid storing sensitive data beyond tokens; tokens cleared on logout and 401.

## Internationalization
- i18next initialized in `src/i18n`; load translations before render. When adding copy, add keys to locale files and use `t('key')`.
- Do not hardcode user-facing strings in components without a plan to localize.

## Accessibility & UX
- Buttons use clear labels/emojis; maintain focus/active states via Tailwind classes; keep touch targets generous (`py-2` or more).
- Safe-area padding applied to nav/footer; preserve when adjusting layout.

## Testing Status
- There is no automated test suite. If you add one, prefer Vitest + React Testing Library aligned with Vite. Document new scripts and single-test invocation patterns here.
- Until then, validate changes via manual flows: login (mock), lobby load, navigation, modal interactions, and safe-area rendering on mobile viewport.

## Performance Notes
- Mock APIs introduce artificial latency (200–500ms); account for this when measuring UI timing.
- Keep renders lean: select minimal state slices; memoize expensive derived data if added.

## Mobile/Capacitor Notes
- Safe-area handled via CSS env variables plus `capacitor-plugin-safe-area` expectation. Avoid absolute positioning that ignores `--safe-bottom`/`--safe-top`.
- Splash/StatusBar colors set to match dark theme; adjust both web and capacitor config together if theme changes.
- When adding plugins, register in `capacitor.config.ts` and run `npm run cap:sync`.

## Error Logging & Telemetry
- Current pattern logs to console. A `logApi` exists (mock accepts all); if enabling real backend logging, centralize through that module.
- Avoid exposing stack traces to users; surface friendly messages while logging the raw error for debugging.

## Docs to Read First
- `GETTING_STARTED.md`: environment setup and build/run steps.
- `docs/architecture-design.md`: planned architecture, state/API design, and Unity-to-web mapping.
- `docs/html5-migration-guide.md`: feature-level migration details (not summarized here).

## Cursor/Copilot Rules
- None present in this repository (`.cursor/`, `.cursorrules`, `.github/copilot-instructions.md` not found). Follow this handbook instead.

## When Adding Code
- Match existing file organization: APIs in `src/api/rest`, state in `src/stores`, shared UI in `src/components`, types in `src/types` with central re-export.
- Prefer composition over duplication: reuse stores and APIs rather than re-fetching ad hoc.
- Keep new dependencies minimal; update `package.json` and lockfile together.
- After changes: run `npm run build` for type-check and bundle validation; for Capacitor changes also run `npm run cap:sync`.

## Naming Conventions
- Components and pages: PascalCase filenames and exports (e.g., `LoginPage`, `BottomNav`).
- Hooks: `useX` prefix, camelCase filename (`useFoo.ts`).
- Stores: `useXStore` with matching file name (`authStore.ts`).
- Types/interfaces: PascalCase nouns; enum-like unions use descriptive strings.
- CSS classes: keep Tailwind utility order readable (layout → spacing → color → effects → state).

## Review Checklist
- Imports ordered and deduped; type-only imports marked with `type`.
- No implicit `any`; narrow nullable fields before use.
- API calls centralized in rest modules; avoid inline Axios instances.
- State updates immutable; persist to `localStorage` only when needed.
- User-facing copy routed through i18n; mock-only strings acceptable in dev tools.
