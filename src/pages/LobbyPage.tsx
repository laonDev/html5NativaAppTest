import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryBar } from '@/components/CategoryBar/CategoryBar';
import { LobbySectionRow } from '@/components/LobbySectionRow/LobbySectionRow';
import { SlotCardItem } from '@/components/SlotCardItem/SlotCardItem';
import { SearchModal } from '@/components/Modal/SearchModal';
import { FilterModal, type FilterState } from '@/components/Modal/FilterModal';
import { useModal } from '@/components/Modal/ModalProvider';
import { ScrollView } from '@/components/ui/ScrollView';
import { useGameStore } from '@/stores/gameStore';
import { gameApi } from '@/api/rest';
import type { Game } from '@/types';

interface LobbySection {
  key: string;
  title: string;
  items: Game[];
}

export function LobbyPage() {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const [activeCategory, setActiveCategory] = useState('home');
  const [filters, setFilters] = useState<FilterState>({ provider: '', sortBy: 'popular' });

  const games = useGameStore((s) => s.games);
  const categories = useGameStore((s) => s.categories);
  const favorites = useGameStore((s) => s.favorites);
  const addFavorite = useGameStore((s) => s.addFavorite);
  const removeFavorite = useGameStore((s) => s.removeFavorite);
  const hotGameIdSet = useMemo(() => {
    const hotCategory = categories.find((category) => category.slug === 'hot');
    return new Set(hotCategory?.['game-ids'] ?? []);
  }, [categories]);

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

  const handleFavoriteToggle = useCallback(async (game: Game) => {
    const gameId = game['game-id'];
    if (favorites.includes(gameId)) {
      removeFavorite(gameId);
      try { await gameApi.favoriteDelete(gameId); } catch { /* revert handled by store */ }
      return;
    }

    addFavorite(gameId);
    try { await gameApi.favoriteCreate(gameId); } catch { /* revert handled by store */ }
  }, [favorites, addFavorite, removeFavorite]);

  const lobbySections = useMemo<LobbySection[]>(() => {
    const sections: LobbySection[] = [];
    const category = categories.find((c) => c.slug === activeCategory);
    const categoryTitle = category?.name ?? activeCategory.toUpperCase();
    const newGames = filteredGames.filter((game) => game.new);
    const favoriteRow = filteredGames.filter((game) => favorites.includes(game['game-id']));

    if (activeCategory === 'home') {
      const featured = filteredGames.slice(0, 36);
      const latest = [...newGames, ...filteredGames.filter((game) => !game.new)].slice(0, 36);
      const curated = filteredGames.slice(36, 72);

      if (featured.length > 0) {
        sections.push({ key: 'home-main', title: 'Featured Slots', items: featured });
      }
      if (latest.length > 0) {
        sections.push({ key: 'home-new', title: 'New Games', items: latest });
      }
      if (curated.length > 0) {
        sections.push({ key: 'home-more', title: 'More Games', items: curated });
      }
      if (favoriteRow.length > 0) {
        sections.push({ key: 'home-favorite', title: 'My Picks', items: favoriteRow.slice(0, 36) });
      }

      return sections;
    }

    if (filteredGames.length > 0) {
      sections.push({
        key: `${activeCategory}-main`,
        title: `${categoryTitle} Games`,
        items: filteredGames.slice(0, 18),
      });
    }
    if (newGames.length > 0) {
      sections.push({
        key: `${activeCategory}-new`,
        title: `New in ${categoryTitle}`,
        items: newGames.slice(0, 24),
      });
    }

    return sections;
  }, [activeCategory, categories, favorites, filteredGames]);

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

      {/* Home: horizontal sections(2 rows), Others: vertical list */}
      <ScrollView className="flex-1">
        {lobbySections.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-gray-500">No games found</div>
        ) : activeCategory === 'home' ? (
          <div className="py-4">
            {lobbySections.map((section) => (
              <LobbySectionRow
                key={section.key}
                title={section.title}
                games={section.items}
                favorites={favorites}
                isHotGame={(game) => hotGameIdSet.has(game['game-id'])}
                onGameClick={handleGameClick}
                onToggleFavorite={handleFavoriteToggle}
                rows={2}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-5 px-4 py-4">
            {lobbySections.map((section) => (
              <section key={section.key}>
                <h3 className="mb-2 text-sm font-semibold text-gray-300">{section.title}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {section.items.map((game) => (
                    <SlotCardItem
                      key={game['game-id']}
                      game={game}
                      isFavorite={favorites.includes(game['game-id'])}
                      isHot={hotGameIdSet.has(game['game-id'])}
                      onClick={() => handleGameClick(game)}
                      onToggleFavorite={handleFavoriteToggle}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </ScrollView>
    </div>
  );
}
