import type { FilterState, LobbySortBy } from '@/types/lobbyFilter';
import { DEFAULT_FILTERS } from '@/types/lobbyFilter';

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSort(value: string | null): LobbySortBy {
  if (value === 'newest' || value === 'a-z') return value;
  return 'popular';
}

export function parseFiltersFromSearch(searchParams: URLSearchParams): FilterState {
  return {
    provider: parseList(searchParams.get('provider')),
    jackpots: parseList(searchParams.get('jackpots')),
    features: parseList(searchParams.get('features')),
    volatility: parseList(searchParams.get('volatility')),
    sortBy: parseSort(searchParams.get('sortBy')),
  };
}

export function buildSearchParamsFromFilters(filters: FilterState): URLSearchParams {
  const next = new URLSearchParams();

  if (filters.provider.length) next.set('provider', filters.provider.join(','));
  if (filters.jackpots.length) next.set('jackpots', filters.jackpots.join(','));
  if (filters.features.length) next.set('features', filters.features.join(','));
  if (filters.volatility.length) next.set('volatility', filters.volatility.join(','));

  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) next.set('sortBy', filters.sortBy);

  return next;
}
