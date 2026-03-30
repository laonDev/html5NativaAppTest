export type LobbySortBy = 'popular' | 'newest' | 'a-z';

export interface FilterState {
  provider: string[];
  jackpots: string[];
  features: string[];
  volatility: string[];
  sortBy: LobbySortBy;
}

export const DEFAULT_FILTERS: FilterState = {
  provider: [],
  jackpots: [],
  features: [],
  volatility: [],
  sortBy: 'popular',
};
