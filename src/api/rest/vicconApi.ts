import client from './client';
import type { VicconSlotListResponse, SlotLoginResponse } from '@/types';

export const vicconApi = {
  gameList: () =>
    client.get<unknown, VicconSlotListResponse>('viccon/game/list'),

  slotEnter: (slotType: number) =>
    client.post<unknown, SlotLoginResponse>('viccon/slot/enter', { slotType }),

  slotSpin: (params: Record<string, unknown>) =>
    client.post<unknown, unknown>('viccon/slot/spin', params),

  crashEnter: (slotIdx: number) =>
    client.post<unknown, unknown>('viccon/crash_enter', { slotIdx }),

  crashPlay: () =>
    client.post<unknown, unknown>('viccon/crash_play'),
};
