import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMissionStore } from '@/stores/missionStore';
import { useBingoStore } from '@/stores/bingoStore';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15v-5.25a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75V21.75H3.75A.75.75 0 013 21V9.75z" />
    </svg>
  );
}

function VicconIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.5 5.5H21l-5.25 4 2 6L12 15l-5.75 3.5 2-6L3 8.5h6.5L12 3z" />
    </svg>
  );
}

function MissionIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CrashIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56-5.84a14.98 14.98 0 00-2.578 6.153" />
    </svg>
  );
}

function BingoIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none">
      <circle cx="16" cy="16" r="14" fill="url(#bingoGrad)" />
      <circle cx="16" cy="16" r="10" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <text x="16" y="21" textAnchor="middle" fontSize="11" fontWeight="900" fill="white" letterSpacing="0.5">BINGO</text>
      <defs>
        <radialGradient id="bingoGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6d28d9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ── Nav item config ───────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/lobby',  label: 'Lobby',   Icon: HomeIcon },
  { path: '/viccon', label: 'Mypick',  Icon: VicconIcon },
  { path: '/mission',label: 'Mission', Icon: MissionIcon },
  { path: '/crash',  label: 'Crash',   Icon: CrashIcon },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasCompletable = useMissionStore((s) => s.hasCompletable);
  const bingoEndTime = useBingoStore((s) => s.endTime);

  const isBingoActive = location.pathname.startsWith('/bingo');
  const hasBingo = !!bingoEndTime;

  // Split nav items: 2 left, bingo center, 2 right
  const leftItems = NAV_ITEMS.slice(0, 2);
  const rightItems = NAV_ITEMS.slice(2);

  return (
    <nav
      className="relative flex items-end justify-around bg-[#0d0b1a] shadow-[0_-1px_0_rgba(255,255,255,0.06)]"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      {/* Left 2 items */}
      {leftItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <NavButton
            key={item.path}
            isActive={isActive}
            label={item.label}
            onClick={() => navigate(item.path)}
          >
            <item.Icon active={isActive} />
          </NavButton>
        );
      })}

      {/* BTN_Bingo — center elevated */}
      <div className="relative -top-4 flex flex-col items-center">
        <button
          onClick={() => navigate('/bingo')}
          className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 ${
            isBingoActive
              ? 'shadow-purple-500/60 ring-2 ring-purple-400/60'
              : 'shadow-purple-900/60'
          }`}
          style={{
            background: 'radial-gradient(circle at 40% 35%, #a855f7, #5b21b6)',
          }}
        >
          <BingoIcon />

          {/* Glow ring */}
          {isBingoActive && (
            <span className="absolute inset-0 rounded-full bg-purple-400/20 blur-sm" />
          )}

          {/* BTN_Bingo_Time — dot when bingo is active/running */}
          {hasBingo && !isBingoActive && (
            <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-[#0d0b1a] bg-red-500" />
          )}
        </button>
        <span
          className={`mt-1 text-[10px] font-semibold tracking-wide ${
            isBingoActive ? 'text-purple-400' : 'text-gray-500'
          }`}
        >
          Bingo
        </span>
      </div>

      {/* Right 2 items */}
      {rightItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        const hasDot = item.path === '/mission' && hasCompletable;
        return (
          <NavButton
            key={item.path}
            isActive={isActive}
            label={item.label}
            onClick={() => navigate(item.path)}
          >
            <item.Icon active={isActive} />
            {/* BTN_Reddot */}
            {hasDot && (
              <span className="absolute right-1/4 top-1 h-2 w-2 rounded-full border border-[#0d0b1a] bg-red-500" />
            )}
          </NavButton>
        );
      })}
    </nav>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────
function NavButton({
  isActive,
  label,
  onClick,
  children,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-1 flex-col items-center gap-0.5 py-3 text-[10px] font-semibold tracking-wide transition-colors ${
        isActive ? 'text-[#00c8ff]' : 'text-gray-600'
      }`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}
