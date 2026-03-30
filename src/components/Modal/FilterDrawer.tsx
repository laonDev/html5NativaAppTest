import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { FilterState } from '@/types/lobbyFilter';
import { DEFAULT_FILTERS } from '@/types/lobbyFilter';

type SectionKey = keyof Pick<FilterState, 'provider' | 'jackpots' | 'features' | 'volatility'>;

const FILTER_OPTIONS: Record<SectionKey, { title: string; options: string[] }> = {
  provider: { title: 'STUDIO', options: ['DUG', 'PRAGMATIC', 'SUPRNATION', 'CASINO888'] },
  jackpots: { title: 'JACKPOTS', options: ['MINI', 'MAJOR', 'MEGA'] },
  features: { title: 'FEATURES', options: ['NEW', 'DUELZ', 'FAST', 'BONUS'] },
  volatility: { title: 'VOLATILITY', options: ['LOW', 'MEDIUM', 'HIGH'] },
};

const SORT_OPTIONS: FilterState['sortBy'][] = ['popular', 'newest', 'a-z'];

function toggleValue(values: string[], value: string): string[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }
  return [...values, value];
}

interface FilterDrawerProps {
  open: boolean;
  initialFilters: FilterState;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export function FilterDrawer({ open, initialFilters, onClose, onApply }: FilterDrawerProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    provider: true,
    jackpots: false,
    features: false,
    volatility: false,
  });

  useEffect(() => {
    if (open) {
      setFilters(initialFilters);
    }
  }, [initialFilters, open]);

  const toggleSection = (section: SectionKey) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleToggleOption = (section: SectionKey, option: string) => {
    setFilters((prev) => ({
      ...prev,
      [section]: toggleValue(prev[section], option),
    }));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/45"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            className="fixed right-0 top-0 flex h-full w-[78vw] max-w-[320px] flex-col bg-[#11298b] px-4 py-5 shadow-[-8px_0_24px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-[#6d7fc6] pb-2">
              <h2 className="text-xl font-extrabold tracking-[0.03em] text-white">FILTER</h2>
              <Button variant="text" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>

            <div className="mb-3 rounded-md bg-[#0f226f] p-2">
              <p className="mb-1 text-xs font-semibold text-[#b8c9ff]">SORT</p>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map((sortBy) => (
                  <Button
                    key={sortBy}
                    size="sm"
                    variant={filters.sortBy === sortBy ? 'primary' : 'ghost'}
                    onClick={() => setFilters((prev) => ({ ...prev, sortBy }))}
                  >
                    {sortBy.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {(Object.keys(FILTER_OPTIONS) as SectionKey[]).map((section) => {
                const group = FILTER_OPTIONS[section];
                const isOpen = expanded[section];

                return (
                  <section key={section} className="border-b border-[#5e72bf] pb-2">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-1 text-left text-base font-bold text-white"
                      onClick={() => toggleSection(section)}
                    >
                      <span>{group.title}</span>
                      <span className="text-lg text-[#c8d8ff]">{isOpen ? '˄' : '˅'}</span>
                    </button>

                    {isOpen && (
                      <div className="mt-1 space-y-1 pl-1">
                        {group.options.map((option) => {
                          const checked = filters[section].includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              className="flex w-full items-center gap-2 py-1 text-left text-sm text-white/95"
                              onClick={() => handleToggleOption(section, option)}
                            >
                              <span
                                className={[
                                  'inline-flex h-4 w-4 items-center justify-center rounded border text-[10px]',
                                  checked ? 'border-cyan-200 bg-cyan-500 text-[#041434]' : 'border-[#9fb3ff]/70 text-transparent',
                                ].join(' ')}
                              >
                                ✓
                              </span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="secondary" size="md" fullWidth onClick={() => setFilters(DEFAULT_FILTERS)}>
                CLEAR ALL
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  onApply(filters);
                  onClose();
                }}
              >
                SELECT
              </Button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
