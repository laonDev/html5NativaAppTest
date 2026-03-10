import client from './client';
import type { TicketUseResponse } from '@/types';

export const ticketApi = {
  list: () =>
    client.get<unknown, unknown>('ticket/list'),

  use: (ticketIdx: number, award: number) =>
    client.post<unknown, TicketUseResponse>('ticket/use', { ticketIdx, award }),
};
