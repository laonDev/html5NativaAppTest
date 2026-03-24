import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useGameStore } from '@/stores/gameStore';
import type { Game } from '@/types';
import { Button } from '@/components/ui/Button';

interface SearchModalProps {
  onClose: () => void;
  onGameClick: (game: Game) => void;
}

export function SearchModal({ onClose, onGameClick }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const games = useGameStore((s) => s.games);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return Object.values(games).filter((game) =>
      game.title.toLowerCase().includes(q),
    );
  }, [debouncedQuery, games]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 pb-3">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games..."
          className="flex-1 rounded-lg bg-[#1a1a2e] px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none"
        />
        <Button onClick={onClose} variant="text" size="sm">
          Cancel
        </Button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {results.map((game) => (
          <button
            key={game['game-id']}
            onClick={() => { onGameClick(game); onClose(); }}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-[#1a1a2e]"
          >
            <div className="h-10 w-10 shrink-0 rounded-lg bg-[#0f3460]" />
            <span className="truncate text-sm text-white">{game.title}</span>
          </button>
        ))}
        {debouncedQuery && results.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">No results found</p>
        )}
      </div>
    </div>
  );
}
