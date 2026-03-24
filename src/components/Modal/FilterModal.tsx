import { useState } from 'react';
import { Button } from '@/components/ui/Button';

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
        <Button onClick={onClose} variant="text" size="sm">✕</Button>
      </div>

      {/* Sort */}
      <div>
        <p className="mb-2 text-sm text-gray-400">Sort by</p>
        <div className="flex gap-2">
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              onClick={() => setFilters({ ...filters, sortBy: opt.value })}
              size="md"
              variant={filters.sortBy === opt.value ? 'primary' : 'ghost'}
              className="rounded-full"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Apply */}
      <Button
        onClick={() => { onApply(filters); onClose(); }}
        variant="primary"
        size="lg"
        fullWidth
      >
        Apply
      </Button>
    </div>
  );
}
