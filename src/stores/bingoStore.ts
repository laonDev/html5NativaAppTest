import { create } from 'zustand';
import type { HouseyData, HouseyAwardData } from '@/types';

interface BingoState {
  houseyData: HouseyData | null;
  lastAward: HouseyAwardData | null;
  endTime: string | null;
  coin: number;
  isPlaying: boolean;

  setHouseyData: (data: HouseyData) => void;
  setLastAward: (award: HouseyAwardData | null) => void;
  setEndTime: (endTime: string | null) => void;
  setCoin: (coin: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const useBingoStore = create<BingoState>((set) => ({
  houseyData: null,
  lastAward: null,
  endTime: null,
  coin: 0,
  isPlaying: false,

  setHouseyData: (data) => set({ houseyData: data, endTime: data.endTime }),
  setLastAward: (award) => set({ lastAward: award }),
  setEndTime: (endTime) => set({ endTime }),
  setCoin: (coin) => set({ coin }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
