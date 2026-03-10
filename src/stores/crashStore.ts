import { create } from 'zustand';
import type { CrashBet, BetRank, CrashGameState } from '@/types';
import { CRASH_STATE } from '@/types';

interface CrashState {
  roundIndex: number;
  gameState: CrashGameState;
  tick: number;
  multiplier: number;
  hash: string;
  userCount: number;
  bets: CrashBet[];
  betRanks: BetRank[];
  cashOutRanks: BetRank[];

  setRoundInfo: (roundIndex: number, state: number, tick: number, hash: string, userCount: number) => void;
  setGameState: (state: number) => void;
  setTick: (tick: number) => void;
  setMultiplier: (multi: number) => void;
  setBetRanks: (ranks: BetRank[]) => void;
  setCashOutRanks: (ranks: BetRank[]) => void;
  setBet: (betIndex: number, bet: number, autoMulti: number) => void;
  clearBets: () => void;
}

export const useCrashStore = create<CrashState>((set, get) => ({
  roundIndex: 0,
  gameState: CRASH_STATE.WAITING,
  tick: 0,
  multiplier: 1.0,
  hash: '',
  userCount: 0,
  bets: [],
  betRanks: [],
  cashOutRanks: [],

  setRoundInfo: (roundIndex, state, tick, hash, userCount) =>
    set({ roundIndex, gameState: state as CrashGameState, tick, hash, userCount }),

  setGameState: (state) => set({ gameState: state as CrashGameState }),
  setTick: (tick) => set({ tick }),
  setMultiplier: (multi) => set({ multiplier: multi }),
  setBetRanks: (ranks) => set({ betRanks: ranks }),
  setCashOutRanks: (ranks) => set({ cashOutRanks: ranks }),

  setBet: (betIndex, bet, autoMulti) => {
    const bets = [...get().bets];
    const existing = bets.findIndex((b) => b.betIndex === betIndex);
    if (existing >= 0) {
      bets[existing] = { betIndex, bet, autoMulti };
    } else {
      bets.push({ betIndex, bet, autoMulti });
    }
    set({ bets });
  },

  clearBets: () => set({ bets: [], betRanks: [], cashOutRanks: [] }),
}));
