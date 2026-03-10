import client from './client';
import type { SlotLoginResponse, SpinParameter } from '@/types';

export const casinoApi = {
  slotEnter: (slotType: number) =>
    client.post<unknown, SlotLoginResponse>('casino/slot/enter', { slotType }),

  slotSpin: (params: SpinParameter) =>
    client.post<unknown, unknown>('casino/slot/spin', params),
};
