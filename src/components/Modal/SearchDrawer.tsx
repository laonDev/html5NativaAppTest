import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
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
  const imgSrc = game['game-Image']?.src;
  return imgSrc && imgSrc.ext.length > 0 ? `${imgSrc.name}.${imgSrc.ext[0]}` : '';
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
  const [menuQuery, setMenuQuery] = useState('');
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

  const filteredActions = useMemo(() => {
    const trimmed = menuQuery.trim().toLowerCase();
    if (!trimmed) return [];

    const actions: Array<{ key: string; label: string; onClick: () => void }> = [];
    groups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.label.toLowerCase().includes(trimmed)) {
          if (item.type === 'route' && item.path) {
            actions.push({
              key: `${group.key}-${item.key}`,
              label: `${group.title} / ${item.label}`,
              onClick: () => onNavigate(item.path!),
            });
          } else if (item.type === 'lobby' && item.category) {
            actions.push({
              key: `${group.key}-${item.key}`,
              label: `${group.title} / ${item.label}`,
              onClick: () => onSelectLobbyCategory(item.category!),
            });
          }
        }

        (item.children ?? []).forEach((child) => {
          if (!child.label.toLowerCase().includes(trimmed)) return;
          actions.push({
            key: `${group.key}-${item.key}-${child.key}`,
            label: `${group.title} / ${item.label} / ${child.label}`,
            onClick: () => onSelectLobbyCategory(child.category!, child.subCategory),
          });
        });
      });
    });

    return actions;
  }, [groups, menuQuery, onNavigate, onSelectLobbyCategory]);

  const renderLobbyItem = (item: GroupItem) => {
    const hasChildren = (item.children?.length ?? 0) > 0;
    const isExpanded = expanded[item.key];
    const isActive = item.category === activeCategory;

    return (
      <div key={item.key}>
        <button
          type="button"
          className={[
            'flex w-full items-center justify-between py-1.5 text-left text-[22px] font-semibold leading-none tracking-[0.01em]',
            isActive ? 'text-white' : 'text-[#8fb0ff]',
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
          <span className="text-[18px] text-[#93b3ff]">{hasChildren ? (isExpanded ? '˄' : '˅') : '›'}</span>
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
                    'flex w-full items-center justify-between py-1 text-left text-[18px] leading-none',
                    isSubActive ? 'text-white' : 'text-[#7e9ae0]',
                  ].join(' ')}
                  onClick={() => onSelectLobbyCategory(child.category!, child.subCategory)}
                >
                  <span>{child.label}</span>
                  <span className="text-[16px] text-[#7e9ae0]">›</span>
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
            className="fixed right-0 top-0 flex h-full w-[78vw] max-w-[340px] flex-col bg-[#0f1f86] px-4 py-5 shadow-[-8px_0_24px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-2 text-white">
              <span className="text-lg">⌂</span>
              <span className="text-sm font-semibold tracking-[0.02em]">HOME</span>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={() => setSearchPageOpen(true)}
                className="flex h-11 w-full items-center rounded-full border border-[#899bde] bg-[#6472b5] px-4"
              >
                <span className="flex-1 text-left text-sm text-[#d0d7ff]/90">Search...</span>
                <span className="text-xl text-white/90">⌕</span>
              </button>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2">
              {['DEPOSIT', 'PROMO', 'EARNED'].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  className="rounded-xl border border-[#2a5dff] bg-gradient-to-b from-[#2257f1] to-[#1736a8] py-2 text-xs font-semibold text-white"
                >
                  {quick}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 [scrollbar-color:#5e79d6_transparent] [scrollbar-width:thin]">
              {menuQuery.trim().length > 0 ? (
                <div className="space-y-1 pb-2">
                  <h3 className="mb-2 border-b border-[#8da8f2] pb-1 text-[22px] font-bold leading-none text-white">SEARCH</h3>
                  {filteredActions.length === 0 ? (
                    <p className="py-4 text-sm text-[#9bb3f1]">No menu matched</p>
                  ) : (
                    filteredActions.map((action) => (
                      <button
                        key={action.key}
                        type="button"
                        className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-white/90 hover:bg-[#1a348f]"
                        onClick={action.onClick}
                      >
                        {action.label}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                groups.map((group) => (
                  <section key={group.key} className="mb-4">
                    <h3 className="mb-2 border-b border-[#8da8f2] pb-1 text-[30px] font-bold leading-none text-white">{group.title}</h3>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        if (item.type === 'lobby') {
                          return renderLobbyItem(item);
                        }
                        return (
                          <button
                            key={item.key}
                            type="button"
                            className="flex w-full items-center justify-between py-1.5 text-left text-[22px] font-semibold leading-none text-[#8fb0ff]"
                            onClick={() => onNavigate(item.path ?? '/lobby')}
                          >
                            <span>{item.label}</span>
                            <span className="text-[16px] text-[#93b3ff]">›</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute -left-4 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border border-[#2a5dff] bg-gradient-to-b from-[#2358f6] to-[#1739b4] text-2xl text-white shadow-lg"
              aria-label="Close search drawer"
            >
              ‹
            </button>
          </motion.aside>

          <AnimatePresence>
            {searchPageOpen && (
              <motion.div
                initial={{ opacity: 0, x: 36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 36 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed inset-0 z-[70] overflow-y-auto bg-[#0d1f86] px-5 pb-6 pt-10"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="mb-6 inline-flex items-center gap-2 text-base font-semibold text-white"
                  onClick={closeSearchPage}
                >
                  <span className="text-xl">↩</span>
                  <span>BACK</span>
                </button>

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
                    className="h-12 w-full rounded-full border border-[#899bde] bg-[#6472b5] px-4 pr-20 text-base text-white placeholder-[#d0d7ff]/80 outline-none"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                    {searchQuery.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSubmittedQuery('');
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white"
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={executeSearch}
                      className="text-2xl text-white/90"
                      aria-label="Search"
                    >
                      ⌕
                    </button>
                  </div>
                </div>

                {searchQuery.trim().length > 0 && submittedQuery.trim().length === 0 && (
                  <div className="mb-5 max-h-64 overflow-y-auto rounded-md border border-[#bdc8ff] bg-white">
                    {liveMatches.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-[#2b2f45]">No matching games</p>
                    ) : (
                      liveMatches.map((game) => (
                        <button
                          key={`live-${game['game-id']}`}
                          type="button"
                          className="block w-full border-b border-[#d8ddfb] px-4 py-3 text-left text-[27px] font-semibold text-[#1b2248] last:border-b-0"
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

                <div className="mb-4 border-t border-[#5c78d4] pt-3">
                  <h3 className="text-[34px] font-bold leading-none text-white">RESULT ({submittedResults.length})</h3>
                </div>

                {submittedQuery.trim().length === 0 ? (
                  <div className="mb-10 min-h-[120px] py-6 text-center text-white/90">No Search Results Found...</div>
                ) : submittedResults.length === 0 ? (
                  <div className="mb-10 min-h-[120px] py-6 text-center text-white/90">No Search Results Found...</div>
                ) : (
                  <div className="mb-10 space-y-3">
                    {submittedResults.map((game) => {
                      const imageUrl = getGameImageUrl(game);
                      return (
                        <button
                          key={`result-${game['game-id']}`}
                          type="button"
                          className="block w-full overflow-hidden rounded-xl border border-[#6f88d6] bg-[#12235f] text-left"
                          onClick={() => {
                            onGameClick(game);
                            onClose();
                          }}
                        >
                          <div className="aspect-[3/1] w-full bg-[#2b3562]">
                            {imageUrl ? (
                              <img src={imageUrl} alt={game.title} className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <img
                                src="/imgResource/unity-main-lobby/backgrounds-and-banners/IMG_Top_Banner_00.png"
                                alt={game.title}
                                className="h-full w-full object-cover opacity-90"
                                loading="lazy"
                              />
                            )}
                          </div>
                          <div className="px-3 py-2 text-sm font-semibold text-white">{game.title}</div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mb-4 border-t border-[#5c78d4] pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-[34px] font-bold leading-none text-white">MOST POPULAR</h3>
                    <button type="button" className="rounded-full border border-[#4470df] px-4 py-1 text-sm font-semibold text-white">See all</button>
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
                        <div className="aspect-[4/3] rounded bg-[#cfd4e6]" />
                        <p className="mt-1 line-clamp-2 text-xs text-white">{game.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4 border-t border-[#5c78d4] pt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-[34px] font-bold leading-none text-white">RECOMMENDED</h3>
                    <button type="button" className="rounded-full border border-[#4470df] px-4 py-1 text-sm font-semibold text-white">See all</button>
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
                        <div className="aspect-[4/3] rounded bg-[#cfd4e6]" />
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
