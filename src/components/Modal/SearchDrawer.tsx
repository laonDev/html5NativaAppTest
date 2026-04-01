import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/Button';
import type { Game } from '@/types';

type GamePrimaryCategory = 'home' | 'hot' | 'slot' | 'live' | 'promo' | 'mypick';

interface SearchDrawerProps {
  open: boolean;
  activeCategory: string;
  activeSubCategory: string;
  secondaryCategoryMap: Record<string, string[]>;
  onClose: () => void;
  onSelectLobbyCategory: (category: GamePrimaryCategory, subCategory?: string) => void;
  onNavigate: (path: string) => void;
  onGameClick: (game: Game) => void;
}

interface GroupItem {
  key: string;
  label: string;
  type: 'lobby' | 'route';
  category?: GamePrimaryCategory;
  subCategory?: string;
  path?: string;
  children?: GroupItem[];
}

interface QuickAction {
  key: 'deposit' | 'promo' | 'earned';
  label: string;
  onClick: () => void;
}

const GROUPS: Array<{ key: string; title: string; items: GroupItem[] }> = [
  {
    key: 'games',
    title: 'GAMES',
    items: [
      { key: 'hot', label: 'HOT', type: 'lobby', category: 'hot' },
      { key: 'slot', label: 'SLOTS', type: 'lobby', category: 'slot' },
      { key: 'live', label: 'LIVE', type: 'lobby', category: 'live' },
      { key: 'mypick', label: 'MY PICKS', type: 'lobby', category: 'mypick' },
    ],
  },
  {
    key: 'contents',
    title: 'CONTENTS',
    items: [
      { key: 'volt', label: 'VOLT', type: 'route', path: '/volt' },
      { key: 'missions', label: 'MISSIONS', type: 'route', path: '/mission' },
      { key: 'tournament', label: 'TOURNAMENT', type: 'route', path: '/tournament' },
      { key: 'housey', label: 'HOUSEY HOUSEY', type: 'route', path: '/bingo' },
      { key: 'viccon', label: 'VICCON EXCLUSIVE', type: 'route', path: '/viccon' },
    ],
  },
  {
    key: 'other',
    title: 'OTHER',
    items: [
      { key: 'help-center', label: 'HELP CENTER', type: 'route', path: '/account' },
      { key: 'language', label: 'LANGUAGE', type: 'route', path: '/account' },
    ],
  },
];

function toUpper(value: string) {
  return value.toUpperCase();
}

function getGameImageUrl(game: Game) {
  const mockThumbnails = [
    '/mock-cdn/slots/BTN_Thumbnail_00.png',
    '/mock-cdn/slots/BTN_Thumbnail_01.png',
    '/mock-cdn/slots/BTN_Thumbnail_02.png',
    '/mock-cdn/slots/BTN_Thumbnail_03.png',
    '/mock-cdn/slots/BTN_Thumbnail_04.png',
    '/mock-cdn/slots/BTN_Thumbnail_05.png',
  ];
  return mockThumbnails[(game['game-id'] * 7) % mockThumbnails.length];
}

function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="text-[#ff3f5f]">{text.slice(index, index + q.length)}</span>
      {text.slice(index + q.length)}
    </>
  );
}

export function SearchDrawer({
  open,
  activeCategory,
  activeSubCategory,
  secondaryCategoryMap,
  onClose,
  onSelectLobbyCategory,
  onNavigate,
  onGameClick,
}: SearchDrawerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    hot: false,
    slot: false,
    live: false,
    mypick: false,
  });
  const [searchPageOpen, setSearchPageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const games = useGameStore((s) => s.games);
  const gameList = useMemo(() => Object.values(games), [games]);

  const liveMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return gameList.filter((game) => game.title.toLowerCase().includes(q));
  }, [gameList, searchQuery]);

  const submittedResults = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();
    if (!q) return [];
    return gameList.filter((game) => game.title.toLowerCase().includes(q));
  }, [gameList, submittedQuery]);

  const groups = useMemo(() => {
    return GROUPS.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        if (item.type !== 'lobby' || !item.category) {
          return item;
        }
        const children = (secondaryCategoryMap[item.category] ?? []).map((sub) => ({
          key: `${item.key}-${sub}`,
          label: toUpper(sub),
          type: 'lobby' as const,
          category: item.category,
          subCategory: sub,
        }));
        return { ...item, children };
      }),
    }));
  }, [secondaryCategoryMap]);

  const renderLobbyItem = (item: GroupItem) => {
    const hasChildren = (item.children?.length ?? 0) > 0;
    const isExpanded = expanded[item.key];
    const isActive = item.category === activeCategory;

    return (
      <div key={item.key}>
        <button
          type="button"
          className={[
            'flex w-full items-center justify-between py-1.5 text-left text-base font-bold',
            isActive ? 'text-white' : 'text-[#b8c9ff]',
          ].join(' ')}
          onClick={() => {
            if (hasChildren) {
              setExpanded((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
              return;
            }
            if (item.category) {
              onSelectLobbyCategory(item.category);
            }
          }}
        >
          <span>{item.label}</span>
          <span className="text-base text-[#c8d8ff]">{hasChildren ? (isExpanded ? '˄' : '˅') : '›'}</span>
        </button>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 pb-2 pl-3">
            {item.children!.map((child) => {
              const isSubActive = activeCategory === child.category && activeSubCategory === child.subCategory;
              return (
                <button
                  key={child.key}
                  type="button"
                  className={[
                    'flex w-full items-center justify-between py-1 text-left text-sm',
                    isSubActive ? 'text-white' : 'text-[#9fb3ff]',
                  ].join(' ')}
                  onClick={() => onSelectLobbyCategory(child.category!, child.subCategory)}
                >
                  <span>{child.label}</span>
                  <span className="text-sm text-[#9fb3ff]">›</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const executeSearch = () => {
    setSubmittedQuery(searchQuery.trim());
  };

  const closeSearchPage = () => {
    setSearchPageOpen(false);
    setSearchQuery('');
    setSubmittedQuery('');
  };

  const quickActions: QuickAction[] = [
    {
      key: 'deposit',
      label: 'DEPOSIT',
      onClick: () => onNavigate('/account'),
    },
    {
      key: 'promo',
      label: 'PROMO',
      onClick: () => onSelectLobbyCategory('promo', 'all'),
    },
    {
      key: 'earned',
      label: 'EARNED',
      onClick: () => onNavigate('/history'),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[65] bg-black/45"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.24, ease: 'easeOut' }}
            className="fixed right-0 top-0 flex h-full w-[78vw] max-w-[320px] flex-col bg-[#11298b] px-4 py-5 shadow-[-8px_0_24px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-[#6d7fc6] pb-2">
              <h2 className="text-xl font-extrabold tracking-[0.03em] text-white">SEARCH</h2>
              <Button variant="text" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>

            <div className="mb-3 rounded-md bg-[#0f226f] p-2">
              <button
                type="button"
                onClick={() => setSearchPageOpen(true)}
                className="flex h-10 w-full items-center rounded-md border border-[#6d7fc6] bg-[#132a7a] px-3"
              >
                <span className="flex-1 text-left text-sm text-[#b8c9ff]">Search...</span>
                <span className="text-base text-[#c8d8ff]">⌕</span>
              </button>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {quickActions.map((quick) => (
                <Button
                  key={quick.key}
                  size="sm"
                  variant="ghost"
                  className="h-10 text-xs"
                  onClick={quick.onClick}
                >
                  {quick.label}
                </Button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 [scrollbar-color:#5e79d6_transparent] [scrollbar-width:thin]">
              {groups.map((group) => (
                <section key={group.key} className="mb-3 border-b border-[#5e72bf] pb-2">
                  <h3 className="mb-1 text-base font-bold text-white">{group.title}</h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      if (item.type === 'lobby') {
                        return renderLobbyItem(item);
                      }
                      return (
                        <button
                          key={item.key}
                          type="button"
                          className="flex w-full items-center justify-between py-1.5 text-left text-base font-bold text-[#b8c9ff]"
                          onClick={() => onNavigate(item.path ?? '/lobby')}
                        >
                          <span>{item.label}</span>
                          <span className="text-sm text-[#c8d8ff]">›</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </motion.aside>

          <AnimatePresence>
            {searchPageOpen && (
              <motion.div
                initial={{ opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 36 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed inset-0 z-[70] overflow-y-auto bg-[#11298b] px-5 pb-6 pt-8"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between border-b border-[#6d7fc6] pb-2">
                  <Button variant="text" size="sm" onClick={closeSearchPage}>
                    ↩ BACK
                  </Button>
                  <h2 className="text-lg font-extrabold tracking-[0.03em] text-white">SEARCH</h2>
                  <span className="w-14" />
                </div>

                <div className="relative mb-4">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setSubmittedQuery('');
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        executeSearch();
                      }
                    }}
                    placeholder="Search..."
                    className="h-10 w-full rounded-md border border-[#6d7fc6] bg-[#132a7a] px-3 pr-20 text-sm text-white placeholder-[#b8c9ff] outline-none"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                    {searchQuery.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSubmittedQuery('');
                        }}
                        className="flex h-5 w-5 items-center justify-center rounded bg-[#5e72bf] text-xs text-white"
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={executeSearch}
                      className="text-base text-[#c8d8ff]"
                      aria-label="Search"
                    >
                      ⌕
                    </button>
                  </div>
                </div>

                {searchQuery.trim().length > 0 && submittedQuery.trim().length === 0 && (
                  <div className="mb-4 max-h-64 overflow-y-auto rounded-md border border-[#5e72bf] bg-[#0f226f]">
                    {liveMatches.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-[#b8c9ff]">No matching games</p>
                    ) : (
                      liveMatches.map((game) => (
                        <button
                          key={`live-${game['game-id']}`}
                          type="button"
                          className="block w-full border-b border-[#5e72bf] px-4 py-2 text-left text-sm font-semibold text-white last:border-b-0"
                          onClick={() => {
                            setSearchQuery(game.title);
                            setSubmittedQuery(game.title);
                          }}
                        >
                          {highlightMatch(game.title, searchQuery)}
                        </button>
                      ))
                    )}
                  </div>
                )}

                <div className="mb-3 border-t border-[#6d7fc6] pt-2">
                  <h3 className="text-lg font-extrabold tracking-[0.03em] text-white">RESULT ({submittedResults.length})</h3>
                </div>

                {submittedQuery.trim().length === 0 ? (
                  <div className="mb-10 min-h-[120px] py-6 text-center text-white/90">No Search Results Found...</div>
                ) : submittedResults.length === 0 ? (
                  <div className="mb-10 min-h-[120px] py-6 text-center text-white/90">No Search Results Found...</div>
                ) : (
                  <div className="mb-10 grid grid-cols-3 gap-2">
                    {submittedResults.map((game) => {
                      const imageUrl = getGameImageUrl(game);
                      return (
                        <button
                          key={`result-${game['game-id']}`}
                          type="button"
                          className="text-left"
                          onClick={() => {
                            onGameClick(game);
                            onClose();
                          }}
                        >
                          <div className="aspect-[360/230] overflow-hidden rounded border border-[#5e72bf] bg-[#0f226f]">
                            <img src={imageUrl} alt={game.title} className="h-full w-full object-cover" loading="lazy" />
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-white">{game.title}</p>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mb-4 border-t border-[#6d7fc6] pt-2">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-extrabold tracking-[0.03em] text-white">MOST POPULAR</h3>
                    <Button type="button" variant="ghost" size="sm">See all</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {gameList.slice(0, 3).map((game) => (
                      <button
                        key={`popular-${game['game-id']}`}
                        type="button"
                        className="text-left"
                        onClick={() => {
                          onGameClick(game);
                          onClose();
                        }}
                      >
                        <div className="aspect-[360/230] overflow-hidden rounded border border-[#5e72bf] bg-[#0f226f]">
                          <img src={getGameImageUrl(game)} alt={game.title} className="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-white">{game.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4 border-t border-[#6d7fc6] pt-2">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-extrabold tracking-[0.03em] text-white">RECOMMENDED</h3>
                    <Button type="button" variant="ghost" size="sm">See all</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {gameList.slice(3, 6).map((game) => (
                      <button
                        key={`recommended-${game['game-id']}`}
                        type="button"
                        className="text-left"
                        onClick={() => {
                          onGameClick(game);
                          onClose();
                        }}
                      >
                        <div className="aspect-[360/230] overflow-hidden rounded border border-[#5e72bf] bg-[#0f226f]">
                          <img src={getGameImageUrl(game)} alt={game.title} className="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-white">{game.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
