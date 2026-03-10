import { useNavigate, useLocation } from 'react-router-dom';
import { useMissionStore } from '@/stores/missionStore';

const NAV_ITEMS = [
  { path: '/lobby', icon: '🏠', label: 'Lobby' },
  { path: '/bingo', icon: '🎱', label: 'Bingo' },
  { path: '/mission', icon: '🎯', label: 'Mission' },
  { path: '/tournament', icon: '🏆', label: 'Tournament' },
  { path: '/crash', icon: '🚀', label: 'Crash' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasCompletable = useMissionStore((s) => s.hasCompletable);

  return (
    <nav
      className="flex items-center justify-around border-t border-white/10 bg-[#16213e]"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              isActive ? 'text-[#e94560]' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/mission' && hasCompletable && (
              <span className="absolute right-1/4 top-1 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
