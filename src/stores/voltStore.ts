import { create } from 'zustand';
import type { VoltData, VoltReward } from '@/types';

interface VoltState {
  voltList: VoltData[];
  totalCount: number;
  lastReward: VoltReward | null;

  setVoltList: (list: VoltData[]) => void;
  setLastReward: (reward: VoltReward | null) => void;
  addVolt: (voltType: number, count: number) => void;
}

export const useVoltStore = create<VoltState>((set, get) => ({
  voltList: [],
  totalCount: 0,
  lastReward: null,

  setVoltList: (list) =>
    set({
      voltList: list,
      totalCount: list.reduce((sum, v) => sum + v.count, 0),
    }),

  setLastReward: (reward) => set({ lastReward: reward }),

  addVolt: (voltType, count) => {
    const voltList = [...get().voltList];
    const existing = voltList.find((v) => v.voltType === voltType);
    if (existing) {
      existing.count += count;
    } else {
      voltList.push({ voltType, count });
    }
    set({
      voltList,
      totalCount: voltList.reduce((sum, v) => sum + v.count, 0),
    });
  },
}));
