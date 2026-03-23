import client from './client';
import type { GetUserAccountResponse } from '@/types';

export const gameApi = {
  sync: (configRevision?: number) =>
    client.post<unknown, unknown>('game/sync', { config_revision: configRevision }),

  enterLobby: (startRank = 1, size = 3) =>
    client.post<unknown, GetUserAccountResponse>('game/enter_lobby', { startRank, size }),

  gamesList: () =>
    client.post<unknown, unknown>('games/list', {}),

  gamesSearch: (text: string) =>
    client.post<unknown, unknown>('games/search', { text }),

  favoriteCreate: (gameIdx: number) =>
    client.post<unknown, void>('games/favorite/create', { gameIdx }),

  favoriteDelete: (gameIdx: number) =>
    client.post<unknown, void>('games/favorite/delete', { gameIdx }),

  spinLog: (start: string, end: string) =>
    client.post<unknown, unknown>('spinlog', { start, end }),
};
