import client from './client';
import type { GamesResult, GamesCategories, GameDetail } from '@/types';

const SUPR_BASE = import.meta.env.VITE_SUPR_API_BASE_URL || '/supr';

export const suprApi = {
  games: () =>
    client.get<unknown, GamesResult>(`${SUPR_BASE}/v1/games`),

  gamesCategories: () =>
    client.get<unknown, GamesCategories>(`${SUPR_BASE}/v1/games/categories`),

  gameDetail: (slug: string) =>
    client.get<unknown, GameDetail>(`${SUPR_BASE}/v1/games/${slug}`),

  gamesHistory: (year: number, month: number, count: number, page: number) =>
    client.get<unknown, unknown>(`${SUPR_BASE}/v1/games/history/${year}/${month}/${count}/${page}`),

  stompInfo: () =>
    client.get<unknown, unknown>(`${SUPR_BASE}/v1/comet/info`),
};
