import type { Game } from '@/types';

interface SlotCardItemProps {
  game: Game;
  isFavorite: boolean;
  isHot?: boolean;
  onClick: () => void;
  onToggleFavorite: (game: Game) => void;
}

export function SlotCardItem({ game, isFavorite, isHot = false, onClick, onToggleFavorite }: SlotCardItemProps) {
  const imgSrc = game['game-Image']?.src;
  const imageUrl = imgSrc && imgSrc.ext.length > 0 ? `${imgSrc.name}.${imgSrc.ext[0]}` : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl border border-[#5b6b9b]/70 bg-gradient-to-b from-[#25345e] to-[#141d39] text-left shadow-[0_4px_14px_rgba(8,12,26,0.45)] transition-transform duration-150 active:scale-[0.98]"
    >
      <div className="pointer-events-none absolute inset-[1px] rounded-[11px] border border-white/10" />

      <div className="relative aspect-[4/5] w-full bg-[#0f3460]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={game.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        {(isHot || game.new) && (
          <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
            {isHot && (
              <span
                className="inline-flex items-center gap-0.5 rounded-md border border-yellow-200/70 bg-gradient-to-b from-[#ffe08a] to-[#f59e0b] px-1.5 py-0.5 text-[10px] font-black tracking-wide text-[#3b2200] shadow-[0_2px_6px_rgba(245,158,11,0.5)]"
                style={{ textShadow: '0 1px 0 rgba(255,255,255,0.35)' }}
              >
                HOT
              </span>
            )}
            {game.new && (
              <span
                className="inline-flex items-center rounded-md border border-pink-200/60 bg-gradient-to-b from-[#ff6b9b] to-[#e11d48] px-1.5 py-0.5 text-[10px] font-black tracking-wide text-white shadow-[0_2px_6px_rgba(225,29,72,0.45)]"
                style={{ textShadow: '0 1px 0 rgba(0,0,0,0.25)' }}
              >
                NEW
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(game);
          }}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-black/45 text-sm text-[#ffd866] shadow-sm"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <div className="relative border-t border-white/10 bg-gradient-to-b from-[#111b38] to-[#0a1124] px-2 py-2">
        <p className="truncate text-sm font-semibold text-white">{game.title}</p>
        <p className="truncate text-[11px] uppercase tracking-[0.02em] text-[#90a0c7]">{game.slug}</p>
      </div>
    </button>
  );
}
