import client from './client';
import type { VoltListResponse, VoltOpenResponse, VoltOpenAllResponse } from '@/types';

export const voltApi = {
  list: () =>
    client.get<unknown, VoltListResponse>('volt/list'),

  open: (voltType: number) =>
    client.post<unknown, VoltOpenResponse>('volt/open', { voltType }),

  openAll: (voltType: number) =>
    client.post<unknown, VoltOpenAllResponse>('volt/open_all', { voltType }),
};
