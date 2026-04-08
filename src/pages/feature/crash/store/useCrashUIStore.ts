import { create } from 'zustand';
import type {
  BottomSheetState,
  BottomTab,
  BetSlotUI,
  RoundStatus,
} from '../types/crashUI';

interface CrashUIState {
  bottomSheetState: BottomSheetState;
  activeTab: BottomTab;

  roundStatus: RoundStatus;
  multiplier: number;
  balance: number;
  crashPoint: number;

  betSlots: BetSlotUI[];

  toggleBottomSheet: () => void;
  setBottomSheetState: (state: BottomSheetState) => void;
  setActiveTab: (tab: BottomTab) => void;

  increaseBetAmount: (slotId: number) => void;
  decreaseBetAmount: (slotId: number) => void;

  placeBet: (slotId: number) => void;
  takeCashout: (slotId: number) => void;

  startRound: () => void;
  tickMultiplier: () => void;
  endRound: () => void;
  resetRound: () => void;
}

export const useCrashUIStore = create<CrashUIState>((set, get) => ({
  bottomSheetState: 'collapsed',
  activeTab: 'all',

  roundStatus: 'waiting',
  multiplier: 1,
  balance: 100,
  crashPoint: 3.6,

  betSlots: [
    { id: 1, amount: 1, autoCashout: null, status: 'idle', cashedOutAt: null },
    { id: 2, amount: 1.1, autoCashout: null, status: 'idle', cashedOutAt: null },
  ],

  toggleBottomSheet: () =>
    set((state) => ({
      bottomSheetState:
        state.bottomSheetState === 'expanded' ? 'collapsed' : 'expanded',
    })),

  setBottomSheetState: (state) => set({ bottomSheetState: state }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  increaseBetAmount: (slotId) =>
    set((state) => ({
      betSlots: state.betSlots.map((slot) =>
        slot.id === slotId
          ? { ...slot, amount: Number((slot.amount + 0.1).toFixed(2)) }
          : slot
      ),
    })),

  decreaseBetAmount: (slotId) =>
    set((state) => ({
      betSlots: state.betSlots.map((slot) =>
        slot.id === slotId
          ? { ...slot, amount: Math.max(0.1, Number((slot.amount - 0.1).toFixed(2))) }
          : slot
      ),
    })),

  placeBet: (slotId) => {
    const { roundStatus, betSlots, balance } = get();
    if (roundStatus !== 'waiting') return;

    const target = betSlots.find((slot) => slot.id === slotId);
    if (!target) return;
    if (target.status !== 'idle') return;
    if (balance < target.amount) return;

    set((state) => ({
      balance: Number((state.balance - target.amount).toFixed(2)),
      betSlots: state.betSlots.map((slot) =>
        slot.id === slotId ? { ...slot, status: 'bet', cashedOutAt: null } : slot
      ),
    }));
  },

  takeCashout: (slotId) => {
    const { roundStatus, multiplier } = get();
    if (roundStatus !== 'playing') return;

    set((state) => {
      const target = state.betSlots.find((slot) => slot.id === slotId);
      if (!target || target.status !== 'bet') return state;

      const payout = Number((target.amount * multiplier).toFixed(2));

      return {
        balance: Number((state.balance + payout).toFixed(2)),
        betSlots: state.betSlots.map((slot) =>
          slot.id === slotId
            ? { ...slot, status: 'cashout', cashedOutAt: multiplier }
            : slot
        ),
      };
    });
  },

  startRound: () =>
    set((state) => ({
      roundStatus: 'playing',
      multiplier: 1,
      betSlots: state.betSlots.map((slot) =>
        slot.status === 'cashout' || slot.status === 'lose'
          ? { ...slot, status: 'idle', cashedOutAt: null }
          : slot
      ),
    })),

  tickMultiplier: () => {
    const { roundStatus, multiplier, crashPoint } = get();
    if (roundStatus !== 'playing') return;

    const nextMultiplier = Number((multiplier + 0.05).toFixed(2));

    if (nextMultiplier >= crashPoint) {
      get().endRound();
      return;
    }

    set({ multiplier: nextMultiplier });
  },

  endRound: () =>
    set((state) => ({
      roundStatus: 'ended',
      multiplier: state.crashPoint,
      betSlots: state.betSlots.map((slot) =>
        slot.status === 'bet' ? { ...slot, status: 'lose' } : slot
      ),
    })),

  resetRound: () =>
    set((state) => ({
      roundStatus: 'waiting',
      multiplier: 1,
      crashPoint: Number((2 + Math.random() * 3).toFixed(2)),
      betSlots: state.betSlots.map((slot) => ({
        ...slot,
        status: 'idle',
        cashedOutAt: null,
      })),
    })),
}));