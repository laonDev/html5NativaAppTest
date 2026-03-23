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
    client.post<unknown, CrashJoinResponse>('crash/join', {}),

  bet: (betIndex: number, betMoney: number, autoMulti: number) =>
    client.post<unknown, void>('crashgame/bet', { betIndex, betMoney, autoMulti }),

  cancel: (betIndex: number) =>
    client.post<unknown, void>('crashgame/cancel', { betIndex }),

  cashOut: (betIndex: number) =>
    client.post<unknown, CrashCashResponse>('crashgame/cashout', { betIndex }),

  cashAuto: (betIndex: number) =>
    client.post<unknown, CrashCashResponse>('crashgame/cashauto', { betIndex }),

  userHistory: () =>
    client.post<unknown, CrashUserHistoryResponse>('crashgame/user/history', {}),

  roundHistory: () =>
    client.post<unknown, CrashRoundHistoryResponse>('crashgame/round/history', {}),

  topRanking: (categoryType: number, categoryDate: number, size: number) =>
    client.post<unknown, CrashTopRankingResponse>('crashgame/top_ranking', {
      category_type: categoryType, category_date: categoryDate, size,
    }),

  roundDetail: (roundIndex: number) =>
    client.post<unknown, CrashRoundDetailResponse>('crashgame/round/detail', { roundIndex }),
};
