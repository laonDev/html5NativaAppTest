import client from './client';
import type { TicketUseResponse, TicketsData } from '@/types';

export const ticketApi = {
  list: () =>
    client.post<unknown, TicketsData>('ticket/list', {}),

  use: (ticketIdx: number, award: number) =>
    client.post<unknown, TicketUseResponse>('ticket/use', { ticketIdx, award }),
};
