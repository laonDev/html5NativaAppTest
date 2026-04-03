import { useState, useMemo, useCallback, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CategoryBar } from '@/components/CategoryBar/CategoryBar';
import { FloatingActionGroup } from '@/components/FloatingActionGroup/FloatingActionGroup';
import { LobbySectionRow } from '@/components/LobbySectionRow/LobbySectionRow';
import { LobbyCurrencyPanel } from '@/components/LobbyCurrencyPanel/LobbyCurrencyPanel';
import { LobbyTournamentPanel } from '@/components/LobbyTournamentPanel/LobbyTournamentPanel';
import { SlotCardItem } from '@/components/SlotCardItem/SlotCardItem';
import { BannerCarousel, type BannerItem } from '@/components/BannerCarousel/BannerCarousel';
import { SearchDrawer } from '@/components/Modal/SearchDrawer';
import { FilterDrawer } from '@/components/Modal/FilterDrawer';
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
const HOME_SECTION_ITEM_LIMIT = 24;
const SLOT_CARD_WIDTH_STYLE = 'clamp(148px, calc((100vw - 44px) / 2.25), 186px)';

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

function matchesSubCategory(activeCategory: string, activeSubCategory: string, game: Game, favorites: number[]): boolean {
  if (!activeSubCategory) return true;

  switch (activeCategory) {
    case 'hot':
      if (activeSubCategory === 'new') return game.new;
      if (activeSubCategory === 'picks') return favorites.includes(game['game-id']);
      if (activeSubCategory === 'jackpot') return inferJackpot(game) !== 'MINI';
      return true;
    case 'slot':
      if (activeSubCategory === 'new') return game.new;
      if (activeSubCategory === 'jackpot') return inferJackpot(game) !== 'MINI';
      if (activeSubCategory === 'megaways') return game['game-id'] % 4 === 0;
      return true;
    case 'live': {
      const group = game['game-id'] % 5;
      if (activeSubCategory === 'roulette') return group === 1;
      if (activeSubCategory === 'blackjack') return group === 2;
      if (activeSubCategory === 'baccarat') return group === 3;
      if (activeSubCategory === 'others') return group === 4;
      return true;
    }
    case 'promo':
      if (activeSubCategory === 'new') return game.new;
      if (activeSubCategory === 'games') return !game.new;
      if (activeSubCategory === 'the end') return game['game-id'] % 2 === 0;
      return true;
    default:
      return true;
  }
}

export function LobbyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { withLoading, showToast } = useUiStatus();
  const [activeCategory, setActiveCategory] = useState('home');
  const [activeSubCategory, setActiveSubCategory] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [homeScrollTop, setHomeScrollTop] = useState(0);
  const [listScrollTop, setListScrollTop] = useState(0);
  const listScrollRef = useRef<HTMLDivElement | null>(null);
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
  const categoryGameIdSets = useMemo(() => {
    const findIds = (slug: string) => new Set(categories.find((category) => category.slug === slug)?.['game-ids'] ?? []);
    return {
      hot: findIds('hot'),
      slot: findIds('slot'),
      live: findIds('live'),
    };
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

    gameList = gameList.filter((game) => matchesSubCategory(activeCategory, activeSubCategory, game, favorites));

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
    if (activeCategory !== 'home') {
      if (filteredGames.length === 0) return [];
      const fallbackTitle = activeSubCategory ? activeSubCategory.toUpperCase() : 'TOP';
      return [
        {
          key: `${activeCategory}-single`,
          title: `| ${fallbackTitle}`,
          items: filteredGames,
        },
      ];
    }

    if (filteredGames.length === 0) return [];

    const all = filteredGames;
    const getSlice = (start: number, size: number) => all.slice(start, start + size);
    const withFallback = (items: Game[], fallbackStart: number) => {
      if (items.length > 0) return items.slice(0, HOME_SECTION_ITEM_LIMIT);
      return getSlice(fallbackStart, HOME_SECTION_ITEM_LIMIT);
    };

    const featured = withFallback(all.filter((game) => categoryGameIdSets.hot.has(game['game-id'])), 0);
    const topSlots = withFallback(all.filter((game) => categoryGameIdSets.slot.has(game['game-id'])), 4);
    const topExclusiveSlots = withFallback(
      all.filter((game) => game['is-duelz-enabled'] || game['game-id'] % 5 === 0),
      8,
    );
    const topLive = withFallback(all.filter((game) => categoryGameIdSets.live.has(game['game-id'])), 12);
    const trendingSlots = withFallback(
      [
        ...all.filter((game) => hotGameIdSet.has(game['game-id']) || game.new),
        ...all.filter((game) => !(hotGameIdSet.has(game['game-id']) || game.new)),
      ],
      16,
    );
    const jackpot = withFallback(all.filter((game) => inferJackpot(game) !== 'MINI'), 20);
    const megaways = withFallback(all.filter((game) => game['game-id'] % 4 === 0), 24);

    return [
      { key: 'home-featured', title: '| FEATURED GAME', items: featured },
      { key: 'home-top-slot', title: '| TOP SLOT GAMES', items: topSlots },
      { key: 'home-top-exclusive', title: '| TOP EXCLUSIVE SLOTS', items: topExclusiveSlots },
      { key: 'home-top-live', title: '| TOP LIVE GAMES', items: topLive },
      { key: 'home-trending', title: '| TRENDING SLOTS', items: trendingSlots },
      { key: 'home-jackpot', title: '| JACKPOT', items: jackpot },
      { key: 'home-megaways', title: '| MEGAWAYS', items: megaways },
    ];
  }, [activeCategory, activeSubCategory, categoryGameIdSets, filteredGames, hotGameIdSet]);

  const recentPlayedGames = useMemo(() => {
    if (activeCategory !== 'slot') return [];
    const favoredInCurrent = filteredGames.filter((game) => favorites.includes(game['game-id']));
    if (favoredInCurrent.length >= 2) return favoredInCurrent.slice(0, 2);
    const needed = 2 - favoredInCurrent.length;
    const fallback = filteredGames.filter((game) => !favorites.includes(game['game-id'])).slice(0, needed);
    return [...favoredInCurrent, ...fallback];
  }, [activeCategory, favorites, filteredGames]);

  const openSearch = () => {
    setSearchOpen(true);
  };

  const openFilter = () => {
    setFilterOpen(true);
  };

  const scrollToTop = useCallback(() => {
    if (listScrollRef.current) {
      listScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setHomeScrollTop(0);
    setListScrollTop(0);
  }, []);

  const resetListScroll = useCallback(() => {
    setHomeScrollTop(0);
    if (listScrollRef.current) {
      listScrollRef.current.scrollTop = 0;
    }
  }, []);

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
    resetListScroll();
    showToast('Filter applied', 'success');
  }, [resetListScroll, setSearchParams, showToast]);

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
    resetListScroll();
    showToast('Filter updated', 'info');
  }, [filters, resetListScroll, setSearchParams, showToast]);

  const isHome = activeCategory === 'home';
  const isPromoEndCategory = activeCategory === 'promo' && activeSubCategory === 'the end';
  const showScrollTopAction = listScrollTop > 24;
  const clampedHomeScroll = Math.max(0, Math.min(homeScrollTop, HOME_BANNER_MAX_HEIGHT));
  const homeBannerHeight = Math.max(HOME_BANNER_MAX_HEIGHT - clampedHomeScroll, 0);
  const showHomeBanner = clampedHomeScroll < HOME_BANNER_MAX_HEIGHT;

  const handleCategoryChange = useCallback((slug: string) => {
    setActiveCategory(slug);
    const nextSubCategories = SECONDARY_CATEGORY_MAP[slug] ?? [];
    setActiveSubCategory(nextSubCategories[0] ?? '');
    resetListScroll();
  }, [resetListScroll]);

  const handleSubCategoryChange = useCallback((slug: string) => {
    setActiveSubCategory(slug);
    resetListScroll();
  }, [resetListScroll]);

  const handleSearchSelectCategory = useCallback((category: 'home' | 'hot' | 'slot' | 'live' | 'promo' | 'mypick', subCategory?: string) => {
    setActiveCategory(category);
    const nextSubCategories = SECONDARY_CATEGORY_MAP[category] ?? [];
    setActiveSubCategory(subCategory ?? nextSubCategories[0] ?? '');
    setSearchOpen(false);
    resetListScroll();
  }, [resetListScroll]);

  return (
    <div className="flex h-full flex-col">
      {isHome && (
        <div
          className="shrink-0 overflow-hidden"
          style={{ height: `${homeBannerHeight}px`, visibility: showHomeBanner ? 'visible' : 'hidden' }}
        >
          <div style={{ transform: `translateY(-${clampedHomeScroll}px)` }}>
            <BannerCarousel key="banner-home" items={banners} className="shrink-0" />
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
          ...(showScrollTopAction ? [{ key: 'to-top', label: 'Top', icon: '↑', onClick: scrollToTop }] : []),
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

      {/* Home: horizontal sections(2 rows), Others: single vertical section */}
      <ScrollView
        ref={listScrollRef}
        className="flex-1"
        onScroll={(event) => {
          const target = event.currentTarget as HTMLDivElement;
          setListScrollTop(target.scrollTop);
          if (!isHome) return;
          setHomeScrollTop(target.scrollTop);
        }}
      >
        {!isHome && <div className="h-[10px]" />}

        {!isHome && (
          <BannerCarousel
            key={`banner-${activeCategory}-${activeSubCategory || 'root'}`}
            items={banners}
            className="shrink-0"
            itemAspectClass="aspect-[358/102]"
          />
        )}

        {!isHome && <div className="h-[10px]" />}

        {lobbySections.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-gray-500">No games found</div>
        ) : activeCategory === 'home' ? (
          <div className="pb-4">
            <div className="h-[10px]" />
            <div className="ui-section-stack">
            <LobbyCurrencyPanel />
            <LobbyTournamentPanel />
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
          </div>
        ) : (
          <div className="ui-section-stack px-4 pb-4">
            {activeCategory === 'slot' && recentPlayedGames.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.04em] text-gray-200">| RECENTLY PLAYED</h3>
                <div
                  className="grid gap-2"
                  style={{
                    '--slot-card-width': SLOT_CARD_WIDTH_STYLE,
                    gridTemplateColumns: 'repeat(auto-fill, minmax(var(--slot-card-width), var(--slot-card-width)))',
                    justifyContent: 'center',
                  } as CSSProperties}
                >
                  {recentPlayedGames.map((game) => (
                    <SlotCardItem
                      key={`recent-${game['game-id']}`}
                      game={game}
                      isFavorite={favorites.includes(game['game-id'])}
                      isHot={hotGameIdSet.has(game['game-id'])}
                      isEnd={isPromoEndCategory}
                      onClick={() => handleGameClick(game)}
                      onToggleFavorite={handleFavoriteToggle}
                    />
                  ))}
                </div>
                <div className="flex h-20 items-center">
                  <div className="h-px w-full bg-[#5a6ba1]/70" />
                </div>
              </section>
            )}
            {lobbySections.map((section) => (
              <section key={section.key}>
                <div
                  className="grid gap-2"
                  style={{
                    '--slot-card-width': SLOT_CARD_WIDTH_STYLE,
                    gridTemplateColumns: 'repeat(auto-fill, minmax(var(--slot-card-width), var(--slot-card-width)))',
                    justifyContent: 'center',
                  } as CSSProperties}
                >
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

      <SearchDrawer
        open={searchOpen}
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        secondaryCategoryMap={SECONDARY_CATEGORY_MAP}
        onClose={() => setSearchOpen(false)}
        onSelectLobbyCategory={handleSearchSelectCategory}
        onGameClick={handleGameClick}
        onNavigate={(path) => {
          setSearchOpen(false);
          navigate(path);
        }}
      />
    </div>
  );
}
