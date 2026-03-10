import { useState } from 'react';

interface FilterModalProps {
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  provider: string;
  sortBy: 'popular' | 'newest' | 'a-z';
}

const SORT_OPTIONS = [
  { value: 'popular' as const, label: 'Popular' },
  { value: 'newest' as const, label: 'Newest' },
  { value: 'a-z' as const, label: 'A-Z' },
];

export function FilterModal({ onClose, onApply, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Filter</h3>
        <button onClick={onClose} className="text-gray-400">✕</button>
      </div>

      {/* Sort */}
      <div>
        <p className="mb-2 text-sm text-gray-400">Sort by</p>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilters({ ...filters, sortBy: opt.value })}
              className={`rounded-full px-4 py-2 text-sm ${
                filters.sortBy === opt.value
                  ? 'bg-[#e94560] text-white'
                  : 'bg-[#1a1a2e] text-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Apply */}
      <button
        onClick={() => { onApply(filters); onClose(); }}
        className="rounded-lg bg-[#e94560] py-3 text-sm font-bold text-white"
      >
        Apply
      </button>
    </div>
  );
}
