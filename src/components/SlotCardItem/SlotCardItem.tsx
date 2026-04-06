import type { Game } from '@/types';

interface SlotCardItemProps {
  game: Game;
  isFavorite: boolean;
  isHot?: boolean;
  isEnd?: boolean;
  onClick: () => void;
  onToggleFavorite: (game: Game) => void;
}

const MOCK_THUMBNAILS = [
  '/mock-cdn/slots/BTN_Thumbnail_00.png',
  '/mock-cdn/slots/BTN_Thumbnail_01.png',
  '/mock-cdn/slots/BTN_Thumbnail_02.png',
  '/mock-cdn/slots/BTN_Thumbnail_03.png',
  '/mock-cdn/slots/BTN_Thumbnail_04.png',
  '/mock-cdn/slots/BTN_Thumbnail_05.png',
];

export function SlotCardItem({ game, isFavorite, isHot = false, isEnd = false, onClick, onToggleFavorite }: SlotCardItemProps) {
  const imageUrl = MOCK_THUMBNAILS[(game['game-id'] * 7) % MOCK_THUMBNAILS.length];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#25345e] to-[#141d39] text-left shadow-[0_4px_14px_rgba(8,12,26,0.45)] transition-transform duration-150 active:scale-[0.98]"
    >
      <div className="relative aspect-[360/230] w-full bg-[#0f3460]">
        <img
          src={imageUrl}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          loading="lazy"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        {(isHot || game.new || isEnd) && (
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
            {isEnd && (
              <span
                className="inline-flex items-center rounded-md border border-cyan-200/70 bg-gradient-to-b from-[#6ae4ff] to-[#2563eb] px-1.5 py-0.5 text-[10px] font-black tracking-wide text-white shadow-[0_2px_6px_rgba(37,99,235,0.45)]"
                style={{ textShadow: '0 1px 0 rgba(0,0,0,0.25)' }}
              >
                END
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
    </button>
  );
}
