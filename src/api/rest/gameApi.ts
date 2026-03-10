import client from './client';
import type { GetUserAccountResponse } from '@/types';

export const gameApi = {
  sync: (configRevision?: number) =>
    client.get<unknown, unknown>('game/sync', { params: { config_revision: configRevision } }),

  enterLobby: (startRank: number, size: number) =>
    client.post<unknown, GetUserAccountResponse>('game/enter_lobby', { startRank, size }),

  gamesList: () =>
    client.get<unknown, unknown>('games/list'),

  gamesSearch: (text: string) =>
    client.get<unknown, unknown>('games/search', { params: { text } }),

  favoriteCreate: (gameIdx: number) =>
    client.post<unknown, void>('games/favorite/create', { gameIdx }),

  favoriteDelete: (gameIdx: number) =>
    client.post<unknown, void>('games/favorite/delete', { gameIdx }),

  spinLog: (start: string, end: string) =>
    client.get<unknown, unknown>('spinlog', { params: { start, end } }),
};
