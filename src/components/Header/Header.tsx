import { useNavigate } from 'react-router-dom';
import { useBalanceStore, formatBalance } from '@/stores/balanceStore';
import { useVoltStore } from '@/stores/voltStore';
import { useAuthStore } from '@/stores/authStore';
import { formatBadgeCount } from '@/utils/format';

// ── Icons ─────────────────────────────────────────────────────────────────────
function CoinIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
      <circle cx="10" cy="10" r="9" fill="#f5c842" stroke="#d4a017" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="6" fill="#fde68a" opacity="0.6" />
      <text x="10" y="14" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#92400e">$</text>
    </svg>
  );
}

function ThunderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M13 2L4.5 13.5H11L9 22l10.5-12H14L13 2z" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Header() {
  const navigate = useNavigate();
  const balance = useBalanceStore((s) => s.balance);
  const totalVolt = useVoltStore((s) => s.totalCount);
  const userInfo = useAuthStore((s) => s.userInfo);

  const isVoltMax = totalVolt >= 99;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-gradient-to-b from-[#1a0a35]/95 to-[#16213e]/95 px-4 py-2.5 shadow-lg shadow-black/40 backdrop-blur-sm">

      {/* BTN_Balance */}
      <button
        onClick={() => navigate('/account')}
        className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1.5 ring-1 ring-white/10 active:opacity-80"
      >
        <CoinIcon />
        <span className="text-sm font-bold text-white tracking-wide">
          {formatBalance(balance)}
        </span>
      </button>

      {/* Right — BTN_Thunder_Icon + BTN_Profile */}
      <div className="flex items-center gap-3">

        {/* BTN_Thunder_Icon */}
        <button
          onClick={() => navigate('/volt')}
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-black/30 ring-1 ring-white/10 active:opacity-80"
        >
          <span className={`${isVoltMax ? 'text-yellow-300' : 'text-yellow-400'}`}>
            <ThunderIcon />
          </span>

          {/* IMG_Ring_Red_Dot_Max — MAX badge */}
          {isVoltMax && (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[9px] font-black leading-4 text-white">
              MAX
            </span>
          )}

          {/* Normal count badge */}
          {!isVoltMax && totalVolt > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
              {formatBadgeCount(totalVolt)}
            </span>
          )}
        </button>

        {/* BTN_Profile */}
        <button
          onClick={() => navigate('/account')}
          className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#2a1060] ring-2 ring-purple-500/40 active:opacity-80"
        >
          {userInfo?.profileUrl ? (
            <img src={userInfo.profileUrl} alt="profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-base leading-none">👤</span>
          )}
        </button>

      </div>
    </header>
  );
}
