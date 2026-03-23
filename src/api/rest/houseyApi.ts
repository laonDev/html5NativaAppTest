import client from './client';
import type { HouseyReadResponse, HouseyPlayResponse, HouseyResetResponse } from '@/types';

export const houseyApi = {
  read: () =>
    client.post<unknown, HouseyReadResponse>('housey/read', {}),

  play: (playCount: number) =>
    client.post<unknown, HouseyPlayResponse>('housey/play', { playCount }),

  reset: () =>
    client.post<unknown, HouseyResetResponse>('housey/reset'),
};
