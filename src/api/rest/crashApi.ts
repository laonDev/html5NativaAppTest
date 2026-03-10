import client from './client';
import type {
  CrashJoinResponse,
  CrashCashResponse,
  CrashUserHistoryResponse,
  CrashRoundHistoryResponse,
  CrashTopRankingResponse,
  CrashRoundDetailResponse,
} from '@/types';

export const crashApi = {
  join: () =>
    client.get<unknown, CrashJoinResponse>('crash/join'),

  bet: (betIndex: number, betMoney: number, autoMulti: number) =>
    client.post<unknown, void>('crashgame/bet', { betIndex, betMoney, autoMulti }),

  cancel: (betIndex: number) =>
    client.post<unknown, void>('crashgame/cancel', { betIndex }),

  cashOut: (betIndex: number) =>
    client.post<unknown, CrashCashResponse>('crashgame/cashout', { betIndex }),

  cashAuto: (betIndex: number) =>
    client.post<unknown, CrashCashResponse>('crashgame/cashauto', { betIndex }),

  userHistory: () =>
    client.get<unknown, CrashUserHistoryResponse>('crashgame/user/history'),

  roundHistory: () =>
    client.get<unknown, CrashRoundHistoryResponse>('crashgame/round/history'),

  topRanking: (categoryType: number, categoryDate: number, size: number) =>
    client.get<unknown, CrashTopRankingResponse>('crashgame/top_ranking', {
      params: { category_type: categoryType, category_date: categoryDate, size },
    }),

  roundDetail: (roundIndex: number) =>
    client.get<unknown, CrashRoundDetailResponse>('crashgame/round/detail', {
      params: { roundIndex },
    }),
};
