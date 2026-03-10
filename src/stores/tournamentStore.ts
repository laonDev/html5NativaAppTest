import { create } from 'zustand';
import type { TournamentData, CurrentUserData, RankingData, TournamentHistoryData } from '@/types';

interface TournamentState {
  tournament: TournamentData | null;
  currentUser: CurrentUserData | null;
  rankings: RankingData[];
  history: TournamentHistoryData[];
  isActive: boolean;

  setTournament: (data: TournamentData | null, currentUser: CurrentUserData | null) => void;
  setRankings: (rankings: RankingData[]) => void;
  setHistory: (history: TournamentHistoryData[]) => void;
}

export const useTournamentStore = create<TournamentState>((set) => ({
  tournament: null,
  currentUser: null,
  rankings: [],
  history: [],
  isActive: false,

  setTournament: (data, currentUser) =>
    set({
      tournament: data,
      currentUser,
      isActive: data !== null,
    }),

  setRankings: (rankings) => set({ rankings }),
  setHistory: (history) => set({ history }),
}));
