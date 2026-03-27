import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CategoryBar } from '@/components/CategoryBar/CategoryBar';
import { FloatingActionGroup } from '@/components/FloatingActionGroup/FloatingActionGroup';
import { LobbySectionRow } from '@/components/LobbySectionRow/LobbySectionRow';
import { SlotCardItem } from '@/components/SlotCardItem/SlotCardItem';
import { BannerCarousel, type BannerItem } from '@/components/BannerCarousel/BannerCarousel';
import { SearchModal } from '@/components/Modal/SearchModal';
import { FilterDrawer } from '@/components/Modal/FilterDrawer';
import { useModal } from '@/components/Modal/ModalProvider';
import { useUiStatus } from '@/components/Feedback/UiStatusProvider';
import { ScrollView } from '@/components/ui/ScrollView';
import { useGameStore } from '@/stores/gameStore';
import { gameApi } from '@/api/rest';
import type { Game } from '@/types';
import { DEFAULT_FILTERS, type FilterState } from '@/types/lobbyFilter';
import { buildSearchParamsFromFilters, parseFiltersFromSearch } from '@/utils/lobbyFilters';

interface LobbySection {
  key: string;
  title: string;
  items: Game[];
}

const SECONDARY_CATEGORY_MAP: Record<string, string[]> = {
  home: [],
  hot: ['top', 'new', 'picks', 'jackpot'],
  slot: ['top', 'new', 'jackpot', 'megaways'],
  live: ['top live', 'roulette', 'blackjack', 'baccarat', 'others'],
  promo: ['all', 'new', 'games', 'the end'],
  mypick: ['slot'],
};

const FILTER_ICON_DEFAULT = '/imgResource/unity-main-lobby/top-ui/BTN_Category_Filter.png';
const FILTER_ICON_ACTIVE = '/imgResource/unity-main-lobby/top-ui/BTN_Top_Filter_Active_Background.png';

const PROVIDERS = ['DUG', 'PRAGMATIC', 'SUPRNATION', 'CASINO888'] as const;
const JACKPOTS = ['MINI', 'MAJOR', 'MEGA'] as const;
const VOLATILITY = ['LOW', 'MEDIUM', 'HIGH'] as const;
const HOME_BANNER_MAX_HEIGHT = 148;

function inferProvider(game: Game): string {
  const raw = [
    (game as { provider?: string }).provider,
    (game as { studio?: string }).studio,
    (game as { vendorName?: string }).vendorName,
    (game as { 'vendor-name'?: string })['vendor-name'],
  ]
    .find(Boolean)
    ?.toUpperCase();

  if (raw) {
    const matched = PROVIDERS.find((provider) => raw.includes(provider));
    if (matched) return matched;
  }
  return PROVIDERS[game['game-id'] % PROVIDERS.length];
}

function inferJackpot(game: Game): string {
  return JACKPOTS[game['game-id'] % JACKPOTS.length];
}

function inferVolatility(game: Game): string {
  return VOLATILITY[game['game-id'] % VOLATILITY.length];
}

function matchesFeature(game: Game, feature: string): boolean {
  if (feature === 'NEW') return game.new;
  if (feature === 'DUELZ') return game['is-duelz-enabled'];
  if (feature === 'FAST') return game['game-id'] % 2 === 0;
  if (feature === 'BONUS') return game['game-id'] % 3 === 0;
  return true;
}

export function LobbyPage() {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const { withLoading, showToast } = useUiStatus();
  const [activeCategory, setActiveCategory] = useState('home');
  const [activeSubCategory, setActiveSubCategory] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [homeScrollTop, setHomeScrollTop] = useState(0);
  const filters = useMemo(() => parseFiltersFromSearch(searchParams), [searchParams]);

  const games = useGameStore((s) => s.games);
  const categories = useGameStore((s) => s.categories);
  const favorites = useGameStore((s) => s.favorites);
  const addFavorite = useGameStore((s) => s.addFavorite);
  const removeFavorite = useGameStore((s) => s.removeFavorite);
  const hotGameIdSet = useMemo(() => {
    const hotCategory = categories.find((category) => category.slug === 'hot');
    return new Set(hotCategory?.['game-ids'] ?? []);
  }, [categories]);

  const secondaryCategories = useMemo(() => SECONDARY_CATEGORY_MAP[activeCategory] ?? [], [activeCategory]);
  const banners = useMemo<BannerItem[]>(() => [
    {
      key: 'banner-00',
      imageUrl: '/imgResource/unity-main-lobby/backgrounds-and-banners/IMG_Top_Banner_00.png',
      alt: 'Promotion Banner 1',
    },
    {
      key: 'banner-01',
      imageUrl: '/imgResource/unity-main-lobby/backgrounds-and-banners/IMG_Top_Banner_01.png',
      alt: 'Promotion Banner 2',
    },
    {
      key: 'banner-02',
      imageUrl: '/imgResource/unity-main-lobby/backgrounds-and-banners/IMG_Top_Banner_02.png',
      alt: 'Promotion Banner 3',
    },
    {
      key: 'banner-03',
      imageUrl: '/imgResource/unity-main-lobby/backgrounds-and-banners/IMG_Top_Banner_03.png',
      alt: 'Promotion Banner 4',
    },
  ], []);

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

    if (filters.provider.length > 0) {
      gameList = gameList.filter((g) => filters.provider.includes(inferProvider(g)));
    }

    if (filters.jackpots.length > 0) {
      gameList = gameList.filter((g) => filters.jackpots.includes(inferJackpot(g)));
    }

    if (filters.volatility.length > 0) {
      gameList = gameList.filter((g) => filters.volatility.includes(inferVolatility(g)));
    }

    if (filters.features.length > 0) {
      gameList = gameList.filter((g) => filters.features.every((feature) => matchesFeature(g, feature)));
    }

    if (filters.sortBy === 'a-z') {
      gameList.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === 'newest') {
      gameList = gameList.filter((g) => g.new).concat(gameList.filter((g) => !g.new));
    }

    if (activeSubCategory === 'new') {
      gameList = gameList.filter((game) => game.new);
    }

    return gameList;
  }, [games, categories, activeCategory, activeSubCategory, favorites, filters]);

  const handleGameClick = useCallback(async (game: Game) => {
    navigate(`/slot?slotType=${game['game-id']}&title=${encodeURIComponent(game.title)}`);
  }, [navigate]);

  const handleFavoriteToggle = useCallback(async (game: Game) => {
    const gameId = game['game-id'];
    if (favorites.includes(gameId)) {
      removeFavorite(gameId);
      try {
        await withLoading(() => gameApi.favoriteDelete(gameId), 'Updating favorites...');
        showToast('Removed from My Picks', 'info');
      } catch {
        addFavorite(gameId);
        showToast('Failed to remove favorite', 'error');
      }
      return;
    }

    addFavorite(gameId);
    try {
      await withLoading(() => gameApi.favoriteCreate(gameId), 'Updating favorites...');
      showToast('Added to My Picks', 'success');
    } catch {
      removeFavorite(gameId);
      showToast('Failed to add favorite', 'error');
    }
  }, [favorites, addFavorite, removeFavorite, showToast, withLoading]);

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
    setFilterOpen(true);
  };

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ group: keyof FilterState | 'sortBy'; value: string }> = [];
    filters.provider.forEach((value) => chips.push({ group: 'provider', value }));
    filters.jackpots.forEach((value) => chips.push({ group: 'jackpots', value }));
    filters.features.forEach((value) => chips.push({ group: 'features', value }));
    filters.volatility.forEach((value) => chips.push({ group: 'volatility', value }));
    if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
      chips.push({ group: 'sortBy', value: filters.sortBy.toUpperCase() });
    }
    return chips;
  }, [filters]);

  const applyFilters = useCallback((nextFilters: FilterState) => {
    const next = buildSearchParamsFromFilters(nextFilters);
    setSearchParams(next);
    showToast('Filter applied', 'success');
  }, [setSearchParams, showToast]);

  const clearFilterChip = useCallback((group: keyof FilterState | 'sortBy', value: string) => {
    const nextFilters: FilterState = {
      provider: [...filters.provider],
      jackpots: [...filters.jackpots],
      features: [...filters.features],
      volatility: [...filters.volatility],
      sortBy: filters.sortBy,
    };

    if (group === 'sortBy') {
      nextFilters.sortBy = DEFAULT_FILTERS.sortBy;
    } else {
      nextFilters[group] = nextFilters[group].filter((item) => item !== value);
    }

    const next = buildSearchParamsFromFilters(nextFilters);
    setSearchParams(next);
    showToast('Filter updated', 'info');
  }, [filters, setSearchParams, showToast]);

  const isHome = activeCategory === 'home';
  const isPromoEndCategory = activeCategory === 'promo' && activeSubCategory === 'the end';
  const clampedHomeScroll = Math.max(0, Math.min(homeScrollTop, HOME_BANNER_MAX_HEIGHT));
  const homeBannerHeight = Math.max(HOME_BANNER_MAX_HEIGHT - clampedHomeScroll, 0);
  const showHomeBanner = clampedHomeScroll < HOME_BANNER_MAX_HEIGHT;

  const handleCategoryChange = useCallback((slug: string) => {
    setActiveCategory(slug);
    const nextSubCategories = SECONDARY_CATEGORY_MAP[slug] ?? [];
    setActiveSubCategory(nextSubCategories[0] ?? '');
  }, []);

  const handleSubCategoryChange = useCallback((slug: string) => {
    setActiveSubCategory(slug);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {isHome && (
        <div
          className="shrink-0 overflow-hidden"
          style={{ height: `${homeBannerHeight}px`, visibility: showHomeBanner ? 'visible' : 'hidden' }}
        >
          <div style={{ transform: `translateY(-${clampedHomeScroll}px)` }}>
            <BannerCarousel items={banners} className="shrink-0" />
          </div>
        </div>
      )}

      <CategoryBar
        activeCategory={activeCategory}
        subCategories={secondaryCategories}
        activeSubCategory={activeSubCategory}
        onCategoryChange={handleCategoryChange}
        onSubCategoryChange={handleSubCategoryChange}
        className="z-20 shadow-[0_1px_0_rgba(255,255,255,0.08)]"
      />

      {activeFilterChips.length > 0 && (
        <div className="px-3 pt-2">
          <ScrollView direction="horizontal">
            <div className="flex items-center gap-2 pb-1">
              {activeFilterChips.map((chip) => (
                <button
                  key={`${chip.group}-${chip.value}`}
                  type="button"
                  onClick={() => clearFilterChip(chip.group, chip.value)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#8fb6ff]/60 bg-[#1a348f]/90 px-2 py-1 text-xs font-semibold text-white"
                >
                  <span>{chip.value}</span>
                  <span className="text-[11px] opacity-80">✕</span>
                </button>
              ))}
            </div>
          </ScrollView>
        </div>
      )}

      <FloatingActionGroup
        items={[
          { key: 'search', label: 'Search', icon: '🔍', onClick: openSearch },
          {
            key: 'filter',
            label: 'Filter',
            icon: (
              <img
                src={activeFilterChips.length > 0 ? FILTER_ICON_ACTIVE : FILTER_ICON_DEFAULT}
                alt=""
                className="h-5 w-5 object-contain"
              />
            ),
            onClick: openFilter,
          },
        ]}
      />

      {/* Home: horizontal sections(2 rows), Others: vertical list */}
      <ScrollView
        className="flex-1"
        onScroll={(event) => {
          if (!isHome) return;
          const target = event.currentTarget as HTMLDivElement;
          setHomeScrollTop(target.scrollTop);
        }}
      >
        {!isHome && (
          <BannerCarousel
            items={banners}
            className="shrink-0 pt-1"
            itemAspectClass="aspect-[358/102]"
          />
        )}

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
                      isEnd={isPromoEndCategory}
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

      <FilterDrawer
        open={filterOpen}
        initialFilters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={applyFilters}
      />
    </div>
  );
}
