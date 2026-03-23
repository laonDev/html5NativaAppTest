import client from './client';
import type {
  TournamentResponse,
  TournamentAwardResponse,
  TournamentRankingResponse,
  TournamentHistoryResponse,
} from '@/types';

export const tournamentApi = {
  info: (withRank: boolean, startRank: number, size: number) =>
    client.post<unknown, { tournament: TournamentResponse | null }>('tournament/info', {
      withRank, startRank, size,
    }),

  award: () =>
    client.post<unknown, TournamentAwardResponse>('tournament/award'),

  ranking: (startRank: number, size: number, tournamentIdx: number) =>
    client.post<unknown, TournamentRankingResponse>('tournament/ranking', {
      startRank, size, tournament_idx: tournamentIdx,
    }),

  history: (size: number) =>
    client.post<unknown, TournamentHistoryResponse>('tournament/history', { size }),
};
