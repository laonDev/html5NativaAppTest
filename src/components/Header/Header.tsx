import { useNavigate } from 'react-router-dom';
import { useBalanceStore, formatBalance } from '@/stores/balanceStore';
import { useVoltStore } from '@/stores/voltStore';
import { useAuthStore } from '@/stores/authStore';
import { formatBadgeCount } from '@/utils/format';

export function Header() {
  const navigate = useNavigate();
  const balance = useBalanceStore((s) => s.balance);
  const totalVolt = useVoltStore((s) => s.totalCount);
  const userInfo = useAuthStore((s) => s.userInfo);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-[#16213e] px-4 py-3 shadow-lg">
      {/* Balance */}
      <button
        onClick={() => navigate('/account')}
        className="flex items-center gap-2 rounded-full bg-[#1a1a2e] px-4 py-2"
      >
        <span className="text-xs text-yellow-400">&#x25C9;</span>
        <span className="text-sm font-bold text-white">{formatBalance(balance)}</span>
      </button>

      {/* Center spacer */}
      <div className="flex-1" />

      {/* Volt Badge */}
      <button
        onClick={() => navigate('/volt')}
        className="relative mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a2e]"
      >
        <span className="text-lg">&#x26A1;</span>
        {totalVolt > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold">
            {formatBadgeCount(totalVolt)}
          </span>
        )}
      </button>

      {/* Profile Avatar */}
      <button
        onClick={() => navigate('/account')}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#0f3460]"
      >
        {userInfo?.profileUrl ? (
          <img src={userInfo.profileUrl} alt="profile" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm">&#x1F464;</span>
        )}
      </button>
    </header>
  );
}
