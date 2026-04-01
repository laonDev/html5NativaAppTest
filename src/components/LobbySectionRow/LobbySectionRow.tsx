import type { CSSProperties } from 'react';
import { ScrollView } from '@/components/ui/ScrollView';
import { SlotCardItem } from '@/components/SlotCardItem/SlotCardItem';
import type { Game } from '@/types';

interface LobbySectionRowProps {
  title: string;
  games: Game[];
  favorites: number[];
  isHotGame: (game: Game) => boolean;
  onGameClick: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  rows?: number;
}

export function LobbySectionRow({
  title,
  games,
  favorites,
  isHotGame,
  onGameClick,
  onToggleFavorite,
  rows = 1,
}: LobbySectionRowProps) {
  if (games.length === 0) {
    return null;
  }

  const columns: Game[][] = [];
  for (let index = 0; index < games.length; index += rows) {
    columns.push(games.slice(index, index + rows));
  }

  return (
    <section className="pb-4">
      <div className="mb-2 px-4">
        <h3 className="inline-flex items-center rounded-md border border-[#4c5d8b] bg-[#1a274a] px-2 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-[#d5def8]">
          {title}
        </h3>
      </div>
      <ScrollView
        direction="horizontal"
        className="px-4"
        style={{ '--slot-card-width': 'clamp(148px, calc((100vw - 44px) / 2.25), 186px)' } as CSSProperties}
      >
        <div className="flex gap-3 pb-1">
          {columns.map((column, columnIndex) => (
            <div key={`${title}-${columnIndex}`} className="w-[var(--slot-card-width)] shrink-0 space-y-3">
              {column.map((game) => (
                <SlotCardItem
                  key={game['game-id']}
                  game={game}
                  isFavorite={favorites.includes(game['game-id'])}
                  isHot={isHotGame(game)}
                  onClick={() => onGameClick(game)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
              {rows === 2 && column.length === 1 && <div className="aspect-[360/230] w-full rounded-xl bg-transparent" />}
            </div>
          ))}
        </div>
      </ScrollView>
    </section>
  );
}
