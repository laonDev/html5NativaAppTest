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
    client.post<unknown, HistoryResponse>('history/cash', params),

  bonus: (params: HistoryParams) =>
    client.post<unknown, HistoryResponse>('history/bonus', params),

  viccon: (params: HistoryParams) =>
    client.post<unknown, HistoryResponse>('history/viccon', params),

  ticket: (params: HistoryParams) =>
    client.post<unknown, HistoryResponse>('history/ticket', params),
};
