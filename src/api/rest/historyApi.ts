import client from './client';
import type { HistoryResponse } from '@/types';

interface HistoryParams {
  startDate: string;
  endDate: string;
  type?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}

export const historyApi = {
  cash: (params: HistoryParams) =>
    client.get<unknown, HistoryResponse>('history/cash', { params }),

  bonus: (params: HistoryParams) =>
    client.get<unknown, HistoryResponse>('history/bonus', { params }),

  viccon: (params: HistoryParams) =>
    client.get<unknown, HistoryResponse>('history/viccon', { params }),

  ticket: (params: HistoryParams) =>
    client.get<unknown, HistoryResponse>('history/ticket', { params }),
};
