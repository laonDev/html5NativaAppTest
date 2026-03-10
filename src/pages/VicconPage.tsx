import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vicconApi } from '@/api/rest';
import { useBalanceStore } from '@/stores/balanceStore';
import type { VicconGameData } from '@/types';

export function VicconPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState<VicconGameData[]>([]);
  const [loading, setLoading] = useState(true);
  const viccon = useBalanceStore((s) => s.viccon);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const res = await vicconApi.gameList();
      setGames(res.games || []);
    } catch (err) {
      console.error('Viccon game list error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = async (game: VicconGameData) => {
    if (game.gameType === 1) {
      // Slot
      navigate(`/slot?slotType=${game.slotType}&title=${encodeURIComponent(game.title)}&viccon=1`);
    } else if (game.gameType === 2) {
      // Crash
      navigate('/crash?viccon=1');
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {/* Viccon Balance */}
      <div className="mb-6 rounded-xl bg-[#16213e] p-4 text-center">
        <p className="text-xs text-gray-400">Viccon Balance</p>
        <p className="text-2xl font-bold text-purple-400">{(viccon / 1000).toFixed(2)}</p>
      </div>

      {/* Game Grid */}
      <h3 className="mb-3 text-sm font-medium text-gray-400">Games</h3>
      <div className="grid grid-cols-2 gap-3">
        {games.map((game) => (
          <button
            key={game.slotIdx}
            onClick={() => handleGameClick(game)}
            className="overflow-hidden rounded-xl bg-[#16213e] transition-transform active:scale-95"
          >
            <div className="aspect-video w-full bg-[#0f3460]">
              {game.imgUrl && <img src={game.imgUrl} alt={game.title} className="h-full w-full object-cover" />}
            </div>
            <div className="p-2">
              <p className="truncate text-sm font-medium">{game.title}</p>
              <p className="text-xs text-gray-500">{game.gameType === 1 ? 'Slot' : 'Crash'}</p>
            </div>
          </button>
        ))}
      </div>

      {games.length === 0 && (
        <div className="py-12 text-center text-gray-500">No Viccon games available</div>
      )}
    </div>
  );
}
