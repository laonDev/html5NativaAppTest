import client from './client';
import type {
  TournamentResponse,
  TournamentAwardResponse,
  TournamentRankingResponse,
  TournamentHistoryResponse,
} from '@/types';

export const tournamentApi = {
  info: (withRank: boolean, startRank: number, size: number) =>
    client.get<unknown, { tournament: TournamentResponse | null }>('tournament/info', {
      params: { withRank, startRank, size },
    }),

  award: () =>
    client.post<unknown, TournamentAwardResponse>('tournament/award'),

  ranking: (startRank: number, size: number, tournamentIdx: number) =>
    client.get<unknown, TournamentRankingResponse>('tournament/ranking', {
      params: { startRank, size, tournament_idx: tournamentIdx },
    }),

  history: (size: number) =>
    client.get<unknown, TournamentHistoryResponse>('tournament/history', { params: { size } }),
};
