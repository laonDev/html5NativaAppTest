import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vicconApi } from '@/api/rest';
import { useBalanceStore } from '@/stores/balanceStore';
import type { VicconGameData } from '@/types';
import { useUiStatus } from '@/components/Feedback/UiStatusProvider';
import { Button } from '@/components/ui/Button';

export function VicconPage() {
  const navigate = useNavigate();
  const { showToast } = useUiStatus();
  const [games, setGames] = useState<VicconGameData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enteringSlotIdx, setEnteringSlotIdx] = useState<number | null>(null);
  const viccon = useBalanceStore((s) => s.viccon);

  useEffect(() => {
    void loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vicconApi.gameList();
      setGames(res.games || []);
    } catch (err) {
      console.error('Viccon game list error:', err);
      setError('Failed to load Viccon games.');
      showToast('Failed to load Viccon games', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = async (game: VicconGameData) => {
    if (enteringSlotIdx !== null) return;

    setEnteringSlotIdx(game.slotIdx);
    try {
      if (game.gameType === 1) {
        await vicconApi.slotEnter(game.slotType);
        navigate(`/slot?slotType=${game.slotType}&title=${encodeURIComponent(game.title)}&viccon=1`);
        return;
      }

      if (game.gameType === 2) {
        await vicconApi.crashEnter(game.slotIdx);
        navigate('/crash?viccon=1');
        return;
      }

      showToast('Unsupported game type', 'error');
    } catch (err) {
      console.error('Viccon game enter error:', err);
      showToast(`Failed to enter ${game.title}`, 'error');
    } finally {
      setEnteringSlotIdx(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col p-4">
        <Button onClick={() => navigate(-1)} variant="text" size="sm" className="mb-3 self-start">
          ← Back
        </Button>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col p-4">
        <Button onClick={() => navigate(-1)} variant="text" size="sm" className="mb-3 self-start">
          ← Back
        </Button>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-gray-300">{error}</p>
          <Button variant="primary" size="sm" onClick={loadGames}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <Button onClick={() => navigate(-1)} variant="text" size="sm" className="mb-3 self-start">
        ← Back
      </Button>

      {/* Viccon Balance */}
      <div className="mb-6 rounded-xl bg-[#16213e] p-4 text-center">
        <p className="text-xs text-gray-400">Viccon Balance</p>
        <p className="text-2xl font-bold text-purple-400">
          {(viccon / 1000).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Game Grid */}
      <h3 className="mb-3 text-sm font-medium text-gray-400">Games</h3>
      <div className="grid grid-cols-2 gap-3">
        {games.map((game) => (
          <button
            key={game.slotIdx}
            onClick={() => handleGameClick(game)}
            disabled={enteringSlotIdx !== null}
            className="relative overflow-hidden rounded-xl bg-[#16213e] transition-transform active:scale-95 disabled:opacity-70"
          >
            <div className="aspect-video w-full bg-[#0f3460]">
              {game.imgUrl && <img src={game.imgUrl} alt={game.title} className="h-full w-full object-cover" />}
            </div>
            <div className="p-2">
              <p className="truncate text-sm font-medium">{game.title}</p>
              <p className="text-xs text-gray-500">{game.gameType === 1 ? 'Slot' : 'Crash'}</p>
            </div>
            {enteringSlotIdx === game.slotIdx && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                Entering...
              </span>
            )}
          </button>
        ))}
      </div>

      {games.length === 0 && (
        <div className="py-12 text-center">
          <p className="mb-3 text-gray-500">No Viccon games available</p>
          <Button variant="secondary" size="sm" onClick={loadGames}>
            Reload
          </Button>
        </div>
      )}
    </div>
  );
}
