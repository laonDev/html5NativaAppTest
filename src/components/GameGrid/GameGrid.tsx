import { useGameStore } from '@/stores/gameStore';
import { gameApi } from '@/api/rest';
import type { Game } from '@/types';

interface GameGridProps {
  games: Game[];
  onGameClick: (game: Game) => void;
}

export function GameGrid({ games, onGameClick }: GameGridProps) {
  const favorites = useGameStore((s) => s.favorites);
  const addFavorite = useGameStore((s) => s.addFavorite);
  const removeFavorite = useGameStore((s) => s.removeFavorite);

  const handleFavorite = async (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    const gameId = game['game-id'];
    if (favorites.includes(gameId)) {
      removeFavorite(gameId);
      try { await gameApi.favoriteDelete(gameId); } catch { /* revert handled by store */ }
    } else {
      addFavorite(gameId);
      try { await gameApi.favoriteCreate(gameId); } catch { /* revert handled by store */ }
    }
  };

  if (games.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-500">
        No games found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 p-4 sm:grid-cols-3">
      {games.map((game) => {
        const gameId = game['game-id'];
        const isFav = favorites.includes(gameId);
        const imgSrc = game['game-Image']?.src;
        const imageUrl = imgSrc ? `${imgSrc.name}.${imgSrc.ext[0]}` : '';

        return (
          <button
            key={gameId}
            onClick={() => onGameClick(game)}
            className="relative overflow-hidden rounded-xl bg-[#16213e] transition-transform active:scale-95"
          >
            <div className="aspect-square w-full bg-[#0f3460]">
              {imageUrl && (
                <img src={imageUrl} alt={game.title} className="h-full w-full object-cover" loading="lazy" />
              )}
            </div>
            <div className="p-1.5">
              <p className="truncate text-xs text-gray-300">{game.title}</p>
            </div>
            {/* Favorite button */}
            <button
              onClick={(e) => handleFavorite(e, game)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-xs"
            >
              {isFav ? '★' : '☆'}
            </button>
            {/* New badge */}
            {game.new && (
              <span className="absolute left-1 top-1 rounded bg-[#e94560] px-1.5 py-0.5 text-[10px] font-bold">
                NEW
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
