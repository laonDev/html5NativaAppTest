import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryBar } from '@/components/CategoryBar/CategoryBar';
import { GameGrid } from '@/components/GameGrid/GameGrid';
import { SearchModal } from '@/components/Modal/SearchModal';
import { FilterModal, type FilterState } from '@/components/Modal/FilterModal';
import { useModal } from '@/components/Modal/ModalProvider';
import { useGameStore } from '@/stores/gameStore';
import { casinoApi } from '@/api/rest';
import type { Game } from '@/types';

export function LobbyPage() {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const [activeCategory, setActiveCategory] = useState('home');
  const [filters, setFilters] = useState<FilterState>({ provider: '', sortBy: 'popular' });

  const games = useGameStore((s) => s.games);
  const categories = useGameStore((s) => s.categories);
  const favorites = useGameStore((s) => s.favorites);

  const filteredGames = useMemo(() => {
    let gameList = Object.values(games);

    if (activeCategory === 'mypick') {
      gameList = gameList.filter((g) => favorites.includes(g['game-id']));
    } else if (activeCategory !== 'home') {
      const cat = categories.find((c) => c.slug === activeCategory);
      if (cat) {
        const ids = new Set(cat['game-ids']);
        gameList = gameList.filter((g) => ids.has(g['game-id']));
      }
    }

    if (filters.sortBy === 'a-z') {
      gameList.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === 'newest') {
      gameList = gameList.filter((g) => g.new).concat(gameList.filter((g) => !g.new));
    }

    return gameList;
  }, [games, categories, activeCategory, favorites, filters]);

  const handleGameClick = useCallback(async (game: Game) => {
    navigate(`/slot?slotType=${game['game-id']}&title=${encodeURIComponent(game.title)}`);
  }, [navigate]);

  const openSearch = () => {
    openModal(
      <SearchModal onClose={closeModal} onGameClick={handleGameClick} />,
      'search',
    );
  };

  const openFilter = () => {
    openModal(
      <FilterModal onClose={closeModal} onApply={setFilters} currentFilters={filters} />,
      'filter',
    );
  };

  return (
    <div className="flex h-full flex-col">
      <CategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Floating buttons */}
      <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-2" style={{ bottom: 'calc(60px + var(--safe-bottom))' }}>
        <button
          onClick={openSearch}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e94560] text-xl shadow-lg"
        >
          🔍
        </button>
        <button
          onClick={openFilter}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f3460] text-xl shadow-lg"
        >
          ⚙️
        </button>
      </div>

      {/* Game Grid */}
      <div className="flex-1 overflow-y-auto">
        <GameGrid games={filteredGames} onGameClick={handleGameClick} />
      </div>
    </div>
  );
}
